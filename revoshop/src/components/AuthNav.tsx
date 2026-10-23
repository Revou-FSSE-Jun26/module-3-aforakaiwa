"use client";

// Auth area in the header. Shows the signed-in username + a Logout button
// when authenticated, or Login/Register links when not. Reads useAuth(), so
// it reflects the persisted session immediately on refresh.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthNav() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Before hydration completes we don't know the session yet. Render a
  // stable placeholder so the server and first client render match (no
  // hydration mismatch) and the UI doesn't flicker between states.
  if (isLoading) {
    return <div className="h-9 w-24" aria-hidden />;
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">
          Hi,{" "}
          <span className="font-semibold text-gray-900" data-testid="username">
            {user.username}
          </span>
        </span>
        <button
          type="button"
          onClick={() => {
            logout();
            router.replace("/");
          }}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-brand-light hover:text-brand"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
      >
        Register
      </Link>
    </div>
  );
}
