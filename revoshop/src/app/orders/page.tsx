import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
};

/**
 * Placeholder orders page so the nav link works. The full version
 * (fetching orders from the API, which requires auth) is built in Step 9.
 */
export default function OrdersPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      <p className="text-gray-600">Coming soon — your orders will appear here.</p>
    </section>
  );
}
