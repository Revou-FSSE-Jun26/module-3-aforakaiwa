import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/api";
import Card from "@/components/Card";

export const metadata: Metadata = {
  title: "Categories",
};

/**
 * Categories list (Server Component). Fetches real categories from the API.
 * While fetching, loading.tsx is shown; on failure, error.tsx.
 */
export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <section className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-sm text-gray-600">
          {categories.length} categories fetched from the RevoShop API.
        </p>
      </div>

      {categories.length === 0 ? (
        <p className="text-gray-600">No categories found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.category_id} className="p-5">
              <h2 className="font-semibold text-gray-900">
                {category.category_name}
              </h2>
              <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-gray-600">
                {category.description ?? "No description available."}
              </p>
              <Link
                href={`/products?category=${category.category_id}`}
                className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
              >
                View products &rarr;
              </Link>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
