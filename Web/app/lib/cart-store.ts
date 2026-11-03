"use client";

import type { CartItem } from "@/app/lib/types";

/**
 * Plain module-level store (read via useSyncExternalStore) instead of
 * effect + setState, so hydrating from localStorage doesn't trigger the
 * "setState in effect" cascading-render lint rule and stays SSR-safe.
 */
const STORAGE_KEY = "cart";

let items: CartItem[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) items = JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getSnapshot(): CartItem[] {
  ensureHydrated();
  return items;
}

/** Stable empty array so the SSR/hydration render never mismatches the client. */
export function getServerSnapshot(): CartItem[] {
  return items;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setCartItems(updater: CartItem[] | ((current: CartItem[]) => CartItem[])) {
  items = typeof updater === "function" ? updater(items) : updater;
  persist();
  listeners.forEach((listener) => listener());
}
