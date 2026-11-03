import { useSyncExternalStore } from "react";

/**
 * JWT storage for the SPA. Without a server of its own the panel can't use an
 * httpOnly cookie, so the token lives in localStorage (survives closing the
 * phone's browser) and expires with the API's JWT_EXPIRES_IN; a 401 clears it.
 */
const STORAGE_KEY = "pudim-admin-token";

export type SessionState = { token: string | null; expired: boolean };

let state: SessionState = { token: readToken(), expired: false };
const listeners = new Set<() => void>();

function readToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function update(next: SessionState) {
  state = next;
  try {
    if (next.token) localStorage.setItem(STORAGE_KEY, next.token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode / blocked storage: the session just lasts for this tab.
  }
  listeners.forEach((listener) => listener());
}

export const session = {
  get: () => state,
  signIn: (token: string) => update({ token, expired: false }),
  signOut: () => update({ token: null, expired: false }),
  /** Called by the API client on 401 so the login page can explain why. */
  expire: () => update({ token: null, expired: true }),
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useSession(): SessionState {
  return useSyncExternalStore(session.subscribe, session.get);
}
