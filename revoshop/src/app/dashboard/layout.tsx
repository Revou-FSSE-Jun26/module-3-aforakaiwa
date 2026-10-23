import type { ReactNode } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

/**
 * Admin-only layout for everything under /dashboard — including the future
 * /dashboard/orders and /dashboard/categories sub-routes. Guarding here (once)
 * means every dashboard page is protected automatically; logged-out users go
 * to /login and non-admin Customers go to /.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute requireAdmin>{children}</ProtectedRoute>;
}
