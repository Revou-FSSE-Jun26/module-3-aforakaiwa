import type { Metadata } from "next";
import ProtectedRoute from "@/components/ProtectedRoute";
import OrdersList from "@/components/OrdersList";

export const metadata: Metadata = {
  title: "My orders",
};

/**
 * Orders page. Auth is client-side (JWT in localStorage), so the data is
 * fetched in the browser by OrdersList using the user's token. ProtectedRoute
 * keeps logged-out users out (redirects to /login).
 */
export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersList />
    </ProtectedRoute>
  );
}
