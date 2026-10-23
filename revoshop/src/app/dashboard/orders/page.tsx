import type { Metadata } from "next";
import DashboardTabs from "@/components/DashboardTabs";
import AdminOrdersOverview from "@/components/AdminOrdersOverview";

export const metadata: Metadata = {
  title: "Dashboard · Orders",
};

/**
 * Read-only order overview across all users (admin only, guarded by the
 * dashboard layout). The backend returns every user's orders for an admin
 * token (see the Module 2 change), which AdminOrdersOverview lists.
 */
export default function DashboardOrdersPage() {
  return (
    <section className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">Order overview across all users.</p>
      </div>
      <DashboardTabs />
      <AdminOrdersOverview />
    </section>
  );
}
