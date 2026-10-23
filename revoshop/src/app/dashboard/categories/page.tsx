import type { Metadata } from "next";
import DashboardTabs from "@/components/DashboardTabs";
import CategoryManager from "@/components/CategoryManager";

export const metadata: Metadata = {
  title: "Dashboard · Categories",
};

/**
 * Admin category CRUD. Guarded by the dashboard layout (admin only).
 * CategoryManager handles create/edit/delete with the admin's JWT, and
 * enforces a frontend deletion guard (no delete when products are linked).
 */
export default function DashboardCategoriesPage() {
  return (
    <section className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">Manage product categories.</p>
      </div>
      <DashboardTabs />
      <CategoryManager />
    </section>
  );
}
