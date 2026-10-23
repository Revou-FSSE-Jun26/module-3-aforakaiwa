"use client";

// Global authentication state for RevoShop.
//
// Holds the signed-in user (including their role) and the JWT, and persists
// both to localStorage so the session survives a page refresh — a Checkpoint 3
// requirement ("Header persists the username across a page refresh").
//
// The backend's POST /auth/login returns the token AND the full user object
// (with `role`), so we store both and never need a separate "who am I?" call.
// Registration (POST /users) does not return a token, so register() here
// creates the account and then immediately logs in to obtain one (auto-login).

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { User } from "@/types";
import {
  login as apiLogin,
  register as apiRegister,
  type RegisterInput,
} from "@/lib/api";

/** localStorage keys. Bumping the version invalidates old shapes cleanly. */
const TOKEN_KEY = "revoshop.auth.token.v1";
const USER_KEY = "revoshop.auth.user.v1";

/** Discriminated result returned by login()/register() to the calling form. */
export type AuthOutcome =
  | { ok: true; user: User }
  | { ok: false; message: string };

interface AuthContextValue {
  user: User | null;
  token: string | null;
  /** True until the initial localStorage read completes (avoids UI flicker). */
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthOutcome>;
  register: (input: RegisterInput) => Promise<AuthOutcome>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// A tiny external store that reports whether we've mounted on the client.
// useSyncExternalStore returns the server snapshot (false) during SSR and the
// first client render, then the client snapshot (true) after hydration — all
// without calling setState inside an effect. Guards use this to avoid
// redirecting before the persisted session has had a chance to load.
const emptySubscribe = () => () => {};
function useHasMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false, // server snapshot
  );
}

/** Read a persisted session from localStorage. Safe on the server (no window). */
function readStoredSession(): { token: string; user: User } | null {
  if (typeof window === "undefined") return null;
  try {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      return { token: storedToken, user: JSON.parse(storedUser) as User };
    }
  } catch {
    // Ignore — treat as a fresh, logged-out session.
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy initializers run once and read localStorage during the first render
  // (not in an effect). On the server they return the logged-out defaults;
  // React reconciles to the stored session on the client during hydration.
  const [user, setUser] = useState<User | null>(
    () => readStoredSession()?.user ?? null,
  );
  const [token, setToken] = useState<string | null>(
    () => readStoredSession()?.token ?? null,
  );
  // "Loading" means we haven't mounted on the client yet; guards wait for this
  // before deciding whether to redirect a logged-out user. Derived from
  // useHasMounted (no setState-in-effect).
  const hasMounted = useHasMounted();
  const isLoading = !hasMounted;

  /** Persist a session to state + localStorage. */
  const persistSession = useCallback((nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    try {
      localStorage.setItem(TOKEN_KEY, nextToken);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } catch {
      // Non-fatal: the in-memory session still works for this tab.
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthOutcome> => {
      const res = await apiLogin(email, password);
      if (res.status === "ok") {
        persistSession(res.token, res.user);
        return { ok: true, user: res.user };
      }
      if (res.status === "invalid") {
        return { ok: false, message: "Invalid email or password." };
      }
      return { ok: false, message: res.message };
    },
    [persistSession],
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<AuthOutcome> => {
      const res = await apiRegister(input);
      if (res.status === "created") {
        // Auto-login: the register response has no token, so exchange the
        // just-used credentials for one.
        const loginRes = await apiLogin(input.email, input.password);
        if (loginRes.status === "ok") {
          persistSession(loginRes.token, loginRes.user);
          return { ok: true, user: loginRes.user };
        }
        // Account exists but auto-login failed — report it so the user can
        // sign in manually.
        return {
          ok: false,
          message: "Account created, but automatic sign-in failed. Please log in.",
        };
      }
      if (res.status === "validation" || res.status === "conflict") {
        return { ok: false, message: res.message };
      }
      return { ok: false, message: res.message };
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // Ignore storage errors on logout.
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === "Admin",
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the auth context. Throws if used outside <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return ctx;
}
