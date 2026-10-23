// Shared helpers for rendering orders.

import type { OrderStatus } from "@/types";

/** Tailwind classes for an order-status badge (typed data -> classes). */
export function orderStatusClass(status: OrderStatus): string {
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

/** Format an ISO timestamp as a readable date, or "—" when missing. */
export function formatOrderDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
