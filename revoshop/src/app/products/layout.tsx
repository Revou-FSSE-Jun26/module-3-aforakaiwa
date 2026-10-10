/**
 * Nested layout for everything under /products (the list and each
 * /products/[id] detail page). It renders inside the root layout, so the
 * Header/Footer stay mounted; only this subtree changes when navigating
 * between the list and a detail page.
 */
export default function ProductsLayout({ children }: LayoutProps<"/products">) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-sm text-gray-600">
          Live catalog fetched from the RevoShop API.
        </p>
      </div>
      {children}
    </div>
  );
}
