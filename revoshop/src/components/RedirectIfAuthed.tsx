"use client";

// Wrapper for the /login and /register pages: if someone who is already
// signed in lands here, send them to their role's home instead of showing
// the form again. Waits for auth hydration (isLoading) before deciding, so a
// logged-in user restored from localStorage isn't shown the form for a frame.

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { destinationForRole } from "@/lib/auth";

export default function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(destinationForRole(user.role));
    }
  }, [isLoading, isAuthenticated, user, router]);

  // While hydrating, or when we're about to redirect an authed user, don't
  // flash the form.
  if (isLoading || isAuthenticated) {
    return (
      <p className="py-10 text-center text-sm text-gray-500">Loading…</p>
    );
  }

  return <>{children}</>;
}
