"use client";

// Detail for a single order. Fetches GET /orders/:id with the user's token and
// renders the order header plus a line-item table. Handles loading, not-found,
// unauthorized, and error states inline.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  fetchOrderDetail,
  formatRupiah,
  type FetchOrderDetailResult,
} from "@/lib/api";
import { orderStatusClass, formatOrderDate } from "@/lib/orders";
import Card from "./Card";

export default function OrderDetailView({ orderId }: { orderId: string }) {
  const { token } = useAuth();
  const [result, setResult] = useState<FetchOrderDetailResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!token) return;
    fetchOrderDetail(orderId, token).then((r) => {
      if (!cancelled) setResult(r);
    });
    return () => {
      cancelled = true;
    };
  }, [orderId, token]);

  return (
    <div className="space-y-6">
      <Link
        href="/orders"
        className="inline-block text-sm font-medium text-brand hover:underline"
      >
        &larr; Back to orders
      </Link>

      {result === null && (
        <p className="py-6 text-center text-sm text-gray-500">Loading order…</p>
      )}

      {result?.status === "unauthorized" && (
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900">Session expired</h2>
          <p className="mt-1 text-sm text-gray-600">
            Please sign in again to view this order.
          </p>
          <Link href="/login" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">
            Sign in &rarr;
          </Link>
        </Card>
      )}

      {result?.status === "not-found" && (
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900">Order not found</h2>
          <p className="mt-1 text-sm text-gray-600">
            We couldn&apos;t find that order. It may belong to another account.
          </p>
        </Card>
      )}

      {result?.status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-800">Couldn&apos;t load order</h2>
          <p className="mt-1 text-sm text-red-700">{result.message}</p>
        </div>
      )}

      {result?.status === "ok" && (
        <>
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{result.order.order_id}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Placed {formatOrderDate(result.order.ordered_at)}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Ship to: {result.order.shipping_address}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${orderStatusClass(result.order.order_status)}`}
              >
                {result.order.order_status}
              </span>
            </div>
          </Card>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Unit price</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Line total</th>
                </tr>
              </thead>
              <tbody>
                {result.order.items.map((item) => (
                  <tr
                    key={item.order_item_id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-4 py-3 text-gray-900">
                      {item.product.product_name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatRupiah(item.unit_price)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.quantity}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatRupiah(item.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <span className="text-gray-600">Total</span>
            <span className="text-xl font-bold text-gray-900">
              {formatRupiah(result.order.total_amount)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
