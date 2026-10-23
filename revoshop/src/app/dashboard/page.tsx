import type { Metadata } from "next";
import DashboardTabs from "@/components/DashboardTabs";
import ProductManager from "@/components/ProductManager";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Admin dashboard — product CRUD. The admin is already authenticated (the
 * dashboard layout guards this), so ProductManager uses the JWT from
 * AuthContext for its create/edit/delete calls. Categories and the order
 * overview live on their own sub-routes (see DashboardTabs).
 */
export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">Manage the RevoShop catalog.</p>
      </div>
      <DashboardTabs />
      <ProductManager />
    </section>
  );
}
