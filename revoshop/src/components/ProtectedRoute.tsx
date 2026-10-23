"use client";

// Client-side route guard.
//
// Wrap a page (or a dashboard layout) in <ProtectedRoute> to control who may
// see it:
//   - requireAuth (default true): logged-out users are sent to /login.
//   - requireAdmin: non-admins (Customers) are sent to / (the storefront).
//
// IMPORTANT: this is a UX guard, not real security. A determined user can
// bypass client-side checks. The actual protection lives on the backend
// (admin endpoints are @roles_required("Admin")). The job here is to route
// people to the right place and avoid flashing protected content.
//
// We wait for auth hydration (isLoading) before deciding, so a user whose
// session was restored from localStorage is not wrongly bounced to /login on
// the first render.

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Require a signed-in user. Defaults to true. */
  requireAuth?: boolean;
  /** Also require the user to be an Admin. */
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  // Decide the redirect target (if any) for the current auth state.
  const deniedTo = (() => {
    if (isLoading) return null; // not decided yet
    if (requireAuth && !isAuthenticated) return "/login";
    if (requireAdmin && !isAdmin) return "/";
    return null; // allowed
  })();

  useEffect(() => {
    if (deniedTo) router.replace(deniedTo);
  }, [deniedTo, router]);

  // While hydrating, show a neutral placeholder.
  if (isLoading) {
    return <p className="py-10 text-center text-sm text-gray-500">Loading…</p>;
  }

  // Access denied: render a redirect notice instead of the protected content,
  // so sensitive UI never appears even for a frame.
  if (deniedTo) {
    return (
      <p className="py-10 text-center text-sm text-gray-500">Redirecting…</p>
    );
  }

  return <>{children}</>;
}
