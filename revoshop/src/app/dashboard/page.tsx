import type { Metadata } from "next";
import { getCategories } from "@/lib/api";
import AddProductForm from "@/components/AddProductForm";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Admin dashboard. Hosts the CreateProductForm, which talks to the real
 * Flask backend: it signs in for an Admin JWT and POSTs /products, then
 * handles the 201 / 400 / error branches inline.
 *
 * Categories are fetched here on the server so the form can offer a real
 * category dropdown (POST /products needs a valid category_id — a FK with
 * ON DELETE RESTRICT — so free-typing an id would often fail).
 */
export default async function DashboardPage() {
  // Don't let a categories outage take down the whole page; the form falls
  // back to a numeric category-id input when the list is empty.
  const categories = await getCategories().catch(() => []);

  return (
    <section className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">
          Add a product to the RevoShop catalog (Admin only).
        </p>
      </div>

      <AddProductForm categories={categories} />
    </section>
  );
}
