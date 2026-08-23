import "server-only";

import { randomInt, timingSafeEqual } from "node:crypto";

import { digest, redis } from "@/lib/auth/redis";

const TTL_SECONDS = 5 * 60;

const MAX_ATTEMPTS = 5;

const COOLDOWN_SECONDS = 60;

const LIMITS = {
  email: { max: 5, window: 60 * 60 },
  ip: { max: 20, window: 60 * 60 },
} as const;

function codeKey(email: string): string {
  return `otp:${digest(email)}`;
}

function cooldownKey(email: string): string {
  return `otp:cooldown:${digest(email)}`;
}

const LIMIT_SCRIPT = `
  local count = redis.call('INCR', KEYS[1])
  if count == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
  end
  return count
`;

async function overLimit(
  scope: keyof typeof LIMITS,
  value: string,
): Promise<boolean> {
  const { max, window } = LIMITS[scope];
  const key = `rl:${scope}:${digest(value)}`;

  const count = await redis().eval<[string], number>(
    LIMIT_SCRIPT,
    [key],
    [String(window)],
  );

  return count > max;
}

const ISSUE_SCRIPT = `
  redis.call('DEL', KEYS[1])
  redis.call('HSET', KEYS[1], 'code', ARGV[1], 'attempts', 0)
  redis.call('EXPIRE', KEYS[1], ARGV[2])
`;

type RequestResult =
  | { status: "sent"; code: string; expiresIn: number }
  | { status: "cooldown"; retryIn: number }
  | { status: "rate-limited" };

export async function requestCode(
  email: string,
  ip: string,
): Promise<RequestResult> {
  if (await overLimit("ip", ip)) return { status: "rate-limited" };
  if (await overLimit("email", email)) return { status: "rate-limited" };

  const cooldown = cooldownKey(email);
  const claimed = await redis().set(cooldown, 1, {
    nx: true,
    ex: COOLDOWN_SECONDS,
  });

  if (claimed !== "OK") {
    const ttl = await redis().ttl(cooldown);

    return { status: "cooldown", retryIn: ttl > 0 ? ttl : COOLDOWN_SECONDS };
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const key = codeKey(email);

  await redis().eval<[string, string], null>(
    ISSUE_SCRIPT,
    [key],
    [digest(`${email}:${code}`), String(TTL_SECONDS)],
  );

  return { status: "sent", code, expiresIn: TTL_SECONDS };
}

type VerifyResult = "ok" | "invalid" | "expired" | "locked";

type OtpRecord = { code: string; attempts: number };

export async function verifyCode(
  email: string,
  code: string,
): Promise<VerifyResult> {
  const key = codeKey(email);
  const record = await redis().hgetall<OtpRecord>(key);

  if (!record?.code) return "expired";

  const attempts = Number(record.attempts ?? 0);

  if (attempts >= MAX_ATTEMPTS) {
    await redis().del(key);

    return "locked";
  }

  const expected = Buffer.from(record.code, "hex");
  const given = Buffer.from(digest(`${email}:${code}`), "hex");

  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    const used = await redis().hincrby(key, "attempts", 1);

    if (used >= MAX_ATTEMPTS) {
      await redis().del(key);

      return "locked";
    }

    return "invalid";
  }

  await redis().del(key);
  await redis().del(cooldownKey(email));

  return "ok";
}
