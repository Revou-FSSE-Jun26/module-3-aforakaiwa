"use client";

// Customer's own orders. Fetches GET /orders with the signed-in user's token
// (the backend scopes the result to that user). Each order links to its
// detail page. Handles loading, empty, unauthorized, and error states inline
// since the data is fetched client-side.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchOrders, formatRupiah, type FetchOrdersResult } from "@/lib/api";
import { orderStatusClass, formatOrderDate } from "@/lib/orders";
import Card from "./Card";

export default function OrdersList() {
  const { token } = useAuth();
  const [result, setResult] = useState<FetchOrdersResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!token) return;
    // Fetch inside the effect (external system = the API); the result is
    // stored in state. This is a legitimate effect use (data fetching).
    fetchOrders(token).then((r) => {
      if (!cancelled) setResult(r);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <section className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">My orders</h1>
        <p className="text-sm text-gray-600">Orders you&apos;ve placed on RevoShop.</p>
      </div>

      {result === null && (
        <p className="py-6 text-center text-sm text-gray-500">Loading orders…</p>
      )}

      {result?.status === "unauthorized" && (
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900">Session expired</h2>
          <p className="mt-1 text-sm text-gray-600">
            Please sign in again to view your orders.
          </p>
          <Link href="/login" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">
            Sign in &rarr;
          </Link>
        </Card>
      )}

      {result?.status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-800">Couldn&apos;t load orders</h2>
          <p className="mt-1 text-sm text-red-700">{result.message}</p>
        </div>
      )}

      {result?.status === "ok" && result.orders.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
          <p className="text-gray-600">You have no orders yet.</p>
          <Link href="/products" className="mt-3 inline-block text-sm font-medium text-brand hover:underline">
            Start shopping
          </Link>
        </div>
      )}

      {result?.status === "ok" && result.orders.length > 0 && (
        <div className="space-y-3">
          {result.orders.map((order) => (
            <Link
              key={order.order_id}
              href={`/orders/${order.order_id}`}
              className="block"
              data-testid="order-row"
            >
              <Card className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:border-brand hover:shadow">
                <div>
                  <p className="font-semibold text-gray-900">
                    Order #{order.order_id}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatOrderDate(order.ordered_at)} · {order.shipping_address}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${orderStatusClass(order.order_status)}`}
                  >
                    {order.order_status}
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatRupiah(order.total_amount)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
