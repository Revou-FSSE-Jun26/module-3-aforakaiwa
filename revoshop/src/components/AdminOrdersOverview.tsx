"use client";

// Read-only order overview for admins. With the backend change, an admin's
// GET /orders returns every user's orders, so this lists all orders across
// users. Read-only: no mutation controls.

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchOrders, formatRupiah, type FetchOrdersResult } from "@/lib/api";
import { orderStatusClass, formatOrderDate } from "@/lib/orders";

export default function AdminOrdersOverview() {
  const { token } = useAuth();
  const [result, setResult] = useState<FetchOrdersResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!token) return;
    fetchOrders(token).then((r) => {
      if (!cancelled) setResult(r);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="space-y-4">
      {result === null && (
        <p className="py-6 text-center text-sm text-gray-500">Loading orders…</p>
      )}

      {result?.status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-800">Couldn&apos;t load orders</h2>
          <p className="mt-1 text-sm text-red-700">{result.message}</p>
        </div>
      )}

      {result?.status === "unauthorized" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm text-amber-800">Your session has expired. Please sign in again.</p>
        </div>
      )}

      {result?.status === "ok" && result.orders.length === 0 && (
        <p className="px-4 py-6 text-sm text-gray-500">No orders yet.</p>
      )}

      {result?.status === "ok" && result.orders.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">User ID</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody data-testid="admin-orders-body">
              {result.orders.map((order) => (
                <tr key={order.order_id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">#{order.order_id}</td>
                  <td className="px-4 py-3 text-gray-600">{order.user_id}</td>
                  <td className="px-4 py-3 text-gray-600">{formatOrderDate(order.ordered_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${orderStatusClass(order.order_status)}`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatRupiah(order.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
