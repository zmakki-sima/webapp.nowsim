import "server-only";

import { randomUUID } from "node:crypto";

import { redis } from "@/lib/auth/redis";
import type { InstallChoice } from "@/lib/checkout";

/**
 * `pending` → `paid` → `fulfilled` is the happy path. `failed` means the money
 * cleared and Yesim did not deliver, which is the only state a human has to act
 * on. `refunded` closes either of the last two.
 */
export type OrderStatus =
  | "pending"
  | "paid"
  | "fulfilled"
  | "failed"
  | "refunded";

export type IssuedEsim = {
  iccid: string;
  esimId?: string;
};

export type OrderRecord = {
  id: string;
  status: OrderStatus;
  /** Yesim user id. The account the eSIM is issued against. */
  accountId: string;
  email: string;
  planId: string;
  destination: string;
  quantity: number;
  /** Smallest currency unit, computed on the server. Never sent by a browser. */
  amount: number;
  currency: string;
  install: InstallChoice;
  /**
   * Query string that rebuilds the checkout page this order came from. The
   * record names a plan id and a destination name, neither of which addresses
   * the page, so the way back is stored rather than reconstructed.
   */
  back: string;
  sessionId?: string;
  paymentIntentId?: string;
  issued: IssuedEsim[];
  failure?: string;
  createdAt: number;
  updatedAt: number;
};

export type NewOrder = Pick<
  OrderRecord,
  | "accountId"
  | "email"
  | "planId"
  | "destination"
  | "quantity"
  | "amount"
  | "currency"
  | "install"
  | "back"
>;

/**
 * An order nobody paid for is an abandoned tab. It expires on its own rather
 * than accumulating forever; the expiry is lifted the moment money clears.
 */
const PENDING_SECONDS = 24 * 60 * 60;

const key = (id: string) => `order:${id}`;

/** Refund and dispute events name a payment intent, never our own order id. */
const intentKey = (paymentIntentId: string) => `order:intent:${paymentIntentId}`;

export async function createOrder(input: NewOrder): Promise<OrderRecord> {
  const now = Date.now();

  const record: OrderRecord = {
    ...input,
    id: randomUUID(),
    status: "pending",
    issued: [],
    createdAt: now,
    updatedAt: now,
  };

  await redis().set(key(record.id), record, { ex: PENDING_SECONDS });

  return record;
}

export async function getOrder(id: string): Promise<OrderRecord | null> {
  return (await redis().get<OrderRecord>(key(id))) ?? null;
}

export async function findOrderByIntent(
  paymentIntentId: string,
): Promise<OrderRecord | null> {
  const id = await redis().get<string>(intentKey(paymentIntentId));

  return id ? getOrder(id) : null;
}

type Patch = Partial<Omit<OrderRecord, "id" | "createdAt">>;

/**
 * Moves an order forward only from the status it is expected to be in, so a
 * replayed webhook cannot re-run a transition. Returns `null` when the order is
 * missing or has already moved on — the caller treats that as "already handled".
 *
 * This is a read-modify-write, not a transaction. It is the third duplicate
 * guard, not the first: the webhook rejects a repeated Stripe event id before
 * anything reaches here, and Stripe spaces its retries out rather than
 * delivering the same event twice at once.
 */
async function advance(
  id: string,
  from: OrderStatus[],
  patch: Patch,
): Promise<OrderRecord | null> {
  const current = await getOrder(id);

  if (!current || !from.includes(current.status)) return null;

  const next: OrderRecord = { ...current, ...patch, updatedAt: Date.now() };

  // Paid orders are records we keep. Only an unpaid one still expires.
  await redis().set(
    key(id),
    next,
    next.status === "pending" ? { ex: PENDING_SECONDS } : {},
  );

  return next;
}

export async function attachSession(
  id: string,
  sessionId: string,
): Promise<OrderRecord | null> {
  return advance(id, ["pending"], { sessionId });
}

export async function markPaid(
  id: string,
  paymentIntentId: string,
): Promise<OrderRecord | null> {
  const paid = await advance(id, ["pending"], {
    status: "paid",
    paymentIntentId,
  });

  if (paid) await redis().set(intentKey(paymentIntentId), id);

  return paid;
}

/**
 * Records one issued card the moment it exists, rather than waiting for the
 * whole order to finish. Yesim cannot be asked "did I already buy this?", so
 * this record is the only thing standing between a crash halfway through a
 * multi-eSIM order and paying for the same card twice.
 */
export async function appendIssued(
  id: string,
  esim: IssuedEsim,
): Promise<OrderRecord | null> {
  const current = await getOrder(id);

  if (!current) return null;

  if (current.issued.some((entry) => entry.iccid === esim.iccid)) return current;

  const next: OrderRecord = {
    ...current,
    issued: [...current.issued, esim],
    updatedAt: Date.now(),
  };

  await redis().set(
    key(id),
    next,
    next.status === "pending" ? { ex: PENDING_SECONDS } : {},
  );

  return next;
}

export async function markFulfilled(
  id: string,
  issued: IssuedEsim[],
): Promise<OrderRecord | null> {
  return advance(id, ["paid", "failed"], { status: "fulfilled", issued });
}

/** Money taken, nothing delivered. The one state that needs a human. */
export async function markFailed(
  id: string,
  failure: string,
  issued: IssuedEsim[] = [],
): Promise<OrderRecord | null> {
  return advance(id, ["paid", "failed"], { status: "failed", failure, issued });
}

export async function markRefunded(id: string): Promise<OrderRecord | null> {
  return advance(id, ["paid", "fulfilled", "failed"], { status: "refunded" });
}