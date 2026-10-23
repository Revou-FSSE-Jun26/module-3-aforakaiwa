"use client";

// Client-side context providers for the whole app.
//
// The root layout is a Server Component (so it can export metadata), but React
// Context requires a Client Component. This thin wrapper bridges the two: the
// layout renders <Providers> around its children, and every context lives in
// one place here. Nesting order is flat — Auth and Cart are independent.

import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        {/* Global toast outlet — toasts can be fired from anywhere via toast(). */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}
