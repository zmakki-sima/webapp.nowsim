"use client";

import { useSyncExternalStore } from "react";

import { BASE_CURRENCY, isCurrency, type Currency } from "@/lib/money";

const KEY = "nowsim.currency";

/**
 * The choice lives in the browser, not in a cookie, because the pages that show
 * prices are statically rendered — reading a cookie on the server would make
 * every destination page dynamic to change four characters of text.
 *
 * The consequence is that the server always renders euros and the first client
 * render corrects it. `useSyncExternalStore` is what makes that legal: React
 * hydrates against the server snapshot, then re-renders against the stored one,
 * so there is no hydration mismatch to suppress.
 */
const listeners = new Set<() => void>();

let current: Currency | null = null;
let bound = false;

function emit() {
  for (const listener of listeners) listener();
}

function bind() {
  if (bound) return;

  bound = true;

  // Another tab switched currency. `key === null` is a whole-storage clear.
  window.addEventListener("storage", (event) => {
    if (event.key !== null && event.key !== KEY) return;

    current = null;
    emit();
  });
}

function snapshot(): Currency {
  if (current) return current;

  try {
    const stored = window.localStorage.getItem(KEY);

    current = isCurrency(stored) ? stored : BASE_CURRENCY;
  } catch {
    // Private mode, or storage denied. The euro is still a currency.
    current = BASE_CURRENCY;
  }

  return current;
}

function subscribe(listener: () => void): () => void {
  bind();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

const serverSnapshot = () => BASE_CURRENCY;

export function useCurrency(): Currency {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

export function setCurrency(next: Currency): void {
  if (current === next) return;

  current = next;

  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    // Not persisted, but the session still honours the choice.
  }

  emit();
}
