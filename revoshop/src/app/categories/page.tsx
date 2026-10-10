import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
};

/**
 * Placeholder categories page so the nav link works. The full version
 * (fetching categories from the API) is built in Step 9.
 */
export default function CategoriesPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
      <p className="text-gray-600">Coming soon — categories will be listed here.</p>
    </section>
  );
}
