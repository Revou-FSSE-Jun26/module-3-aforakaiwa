"use client";

// Client-side context providers for the whole app.
//
// The root layout is a Server Component (so it can export metadata), but React
// Context requires a Client Component. This thin wrapper bridges the two: the
// layout renders <Providers> around its children, and every context lives in
// one place here. Nesting order is flat — Auth and Cart are independent.

import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
