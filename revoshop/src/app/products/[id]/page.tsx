import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getCategoryWithProducts, formatRupiah } from "@/lib/api";
import Card from "@/components/Card";
import ProductCard from "@/components/ProductCard";

/**
 * Dynamic page title based on the product. The root layout's title template
 * ("%s | RevoShop") turns this into "Logitech MX Master ... | RevoShop".
 */
export async function generateMetadata({
  params,
}: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.product_name,
    description: product.description ?? `Buy ${product.product_name} on RevoShop.`,
  };
}

export default async function ProductDetailPage({
  params,
}: PageProps<"/products/[id]">) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const inStock = product.stock_quantity > 0;

  // Fetch sibling products in the same category (nice "related" section).
  const category = await getCategoryWithProducts(product.category_id);
  const related =
    category?.products
      .filter((p) => p.product_id !== product.product_id)
      .slice(0, 3) ?? [];

  return (
    <div className="space-y-8">
      <Link
        href="/products"
        className="inline-block text-sm font-medium text-brand hover:underline"
      >
        &larr; Back to products
      </Link>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {product.product_name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">SKU: {product.sku}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              inStock
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {inStock ? `In stock: ${product.stock_quantity}` : "Out of stock"}
          </span>
        </div>

        <p className="mt-4 text-gray-700">
          {product.description ?? "No description available."}
        </p>

        <p className="mt-6 text-3xl font-bold text-gray-900">
          {formatRupiah(product.price)}
        </p>
      </Card>

      {related.length > 0 && (
        <section>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            More in this category
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.product_id} product={p} showAddToCart={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
