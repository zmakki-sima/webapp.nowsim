"use client";

import {
  createContext,
  use,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Account } from "@/lib/auth/account";

type SessionValue = {
  pending: Promise<Account | null>;
  local: Account | null | undefined;
  setLocal: (account: Account | null) => void;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({
  account,
  children,
}: {
  account: Promise<Account | null>;
  children: ReactNode;
}) {
  const [local, setLocal] = useState<Account | null | undefined>(undefined);

  const value = useMemo<SessionValue>(
    () => ({ pending: account, local, setLocal }),
    [account, local],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}

function useSession(): SessionValue {
  const value = useContext(SessionContext);

  if (!value) {
    throw new Error("useAccount must be used inside <SessionProvider>");
  }

  return value;
}

export function useAccount(): Account | null {
  const { pending, local } = useSession();

  return local !== undefined ? local : use(pending);
}

export function useSetAccount(): (account: Account | null) => void {
  return useSession().setLocal;
}
