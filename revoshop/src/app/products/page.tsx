import type { Metadata } from "next";
import { getProducts, getCategories } from "@/lib/api";
import SearchControls from "@/components/SearchControls";
import ProductCatalog from "@/components/ProductCatalog";

export const metadata: Metadata = {
  title: "Products",
};

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

  const PER_PAGE = 100;

  // Fetch the first page of products (filtered by q on the backend) plus the
  // categories list for the filter dropdown, in parallel.
  const [firstPage, categories] = await Promise.all([
    getProducts(1, PER_PAGE, q),
    getCategories(),
  ]);

  // Text search (q) is handled by the backend. Category has no backend param,
  // so it must be filtered client-side. When a category IS selected we need
  // the FULL set of matching products — not just the first page — otherwise
  // products beyond the first page would never be considered. Paginate through
  // the remaining pages (capped at total_pages from the first response to
  // guard against a runaway loop) and concatenate the results.
  let allProducts = firstPage.products;
  if (category && firstPage.total_pages > 1) {
    const rest = await Promise.all(
      Array.from({ length: firstPage.total_pages - 1 }, (_, i) =>
        getProducts(i + 2, PER_PAGE, q),
      ),
    );
    allProducts = rest.reduce(
      (acc, page) => acc.concat(page.products),
      allProducts,
    );
  }

  const filtered = category
    ? allProducts.filter((p) => String(p.category_id) === category)
    : allProducts;

  // When filtering by category client-side, `filtered` IS the complete set, so
  // its length is the true total. Without a category the backend's total_items
  // is the authoritative count (which may exceed the first page shown).
  const totalItems = category ? filtered.length : firstPage.total_items;

  return (
    <section className="space-y-4">
      <SearchControls categories={categories} />

      {q && (
        <p className="text-sm text-gray-600">
          Results for <span className="font-medium">&ldquo;{q}&rdquo;</span>.
        </p>
      )}

      <ProductCatalog initialProducts={filtered} totalItems={totalItems} />
    </section>
  );
}
