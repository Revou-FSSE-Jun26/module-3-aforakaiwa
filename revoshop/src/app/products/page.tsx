import type { Metadata } from "next";
import { getProducts, getCategories } from "@/lib/api";
import SearchControls from "@/components/SearchControls";
import ProductCatalog from "@/components/ProductCatalog";
import type { Product } from "@/types";

export const metadata: Metadata = {
  title: "Products",
};

/** Case-insensitive match against name, description, and SKU. */
function matchesQuery(product: Product, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    product.product_name.toLowerCase().includes(needle) ||
    (product.description?.toLowerCase().includes(needle) ?? false) ||
    product.sku.toLowerCase().includes(needle)
  );
}

/**
 * Products list page (Server Component).
 * Reads the ?q= and ?category= search params from the URL and returns the
 * filtered list, so the rendered results always reflect the current URL.
 */
export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";

  // Fetch everything we need in parallel: products + categories (for the filter).
  const [data, categories] = await Promise.all([
    getProducts(1, 100),
    getCategories(),
  ]);

  // Filter by category and search query on the server.
  const filtered = data.products.filter((product) => {
    const inCategory = category
      ? String(product.category_id) === category
      : true;
    return inCategory && matchesQuery(product, q);
  });

  return (
    <section className="space-y-4">
      <SearchControls categories={categories} />

      {q && (
        <p className="text-sm text-gray-600">
          Results for <span className="font-medium">&ldquo;{q}&rdquo;</span>.
        </p>
      )}

      <ProductCatalog initialProducts={filtered} totalItems={data.total_items} />
    </section>
  );
}
