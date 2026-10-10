import type { Metadata } from "next";
import { getProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Products",
};

/**
 * Products list page. This is a Server Component: it `await`s the API on
 * the server, so the HTML arrives already populated. If the fetch throws
 * (e.g. API returns 500), Next.js renders error.tsx; while it's pending,
 * loading.tsx is shown.
 */
export default async function ProductsPage() {
  // Fetch a full page of products (the API is paginated; default per_page=5).
  const data = await getProducts(1, 20);
  const products = data.products;

  return (
    <section>
      <p className="mb-4 text-sm text-gray-600">
        Showing {products.length} of {data.total_items} products.
      </p>

      {products.length === 0 ? (
        <p className="text-gray-600">No products found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
