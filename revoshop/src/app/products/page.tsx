import type { Metadata } from "next";
import { getProducts, getCategories } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import SearchControls from "@/components/SearchControls";
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

      <p className="text-sm text-gray-600">
        Showing {filtered.length} of {data.total_items} products
        {q && (
          <>
            {" "}
            for <span className="font-medium">&ldquo;{q}&rdquo;</span>
          </>
        )}
        .
      </p>

      {filtered.length === 0 ? (
        <p className="text-gray-600">No products match your filters.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
