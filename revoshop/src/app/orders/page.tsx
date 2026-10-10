import type { Metadata } from "next";
import Link from "next/link";
import { getOrdersResult, formatRupiah } from "@/lib/api";
import Card from "@/components/Card";
import type { OrderStatus } from "@/types";

export const metadata: Metadata = {
  title: "Orders",
};

/** Tailwind classes per order status (typed data -> conditional classes). */
function statusClass(status: OrderStatus): string {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-700";
    case "Shipped":
    case "Paid":
      return "bg-blue-100 text-blue-700";
    case "Cancelled":
      return "bg-red-100 text-red-700";
    case "Return Process":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

/**
 * Orders page (Server Component). Orders are auth-protected on the Flask API,
 * so without a valid JWT the API returns 401. We fetch on the server and
 * render a clear notice in that case, or the real orders when authorized
 * (e.g. once an API token is configured via API_SECRET_KEY).
 */
export default async function OrdersPage() {
  // Server-only token (never shipped to the browser). Empty for now.
  const token = process.env.API_SECRET_KEY || undefined;
  const result = await getOrdersResult(token);

  return (
    <section className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-600">Orders fetched from the RevoShop API.</p>
      </div>

      {result.status === "unauthorized" && (
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900">Sign in to view orders</h2>
          <p className="mt-1 text-sm text-gray-600">
            The orders endpoint is protected and requires authentication. Once an
            API token is configured, your orders will appear here.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
          >
            Continue shopping &rarr;
          </Link>
        </Card>
      )}

      {result.status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-800">Couldn&apos;t load orders</h2>
          <p className="mt-1 text-sm text-red-700">{result.message}</p>
        </div>
      )}

      {result.status === "ok" && result.orders.length === 0 && (
        <p className="text-gray-600">You have no orders yet.</p>
      )}

      {result.status === "ok" && result.orders.length > 0 && (
        <div className="space-y-3">
          {result.orders.map((order) => (
            <Card key={order.order_id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold text-gray-900">Order #{order.order_id}</p>
                <p className="text-sm text-gray-500">{order.shipping_address}</p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(order.order_status)}`}
                >
                  {order.order_status}
                </span>
                <span className="font-bold text-gray-900">
                  {formatRupiah(order.total_amount)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
