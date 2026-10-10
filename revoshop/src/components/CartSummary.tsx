"use client";

import { formatRupiah } from "@/lib/api";
import type { CartItem } from "@/types";

interface CartSummaryProps {
  items: CartItem[];
  onRemove: (productId: number) => void;
  onClear: () => void;
}

/**
 * Cart summary: shows total item count and total price, computed with
 * reduce over the typed cart items.
 */
export default function CartSummary({ items, onRemove, onClear }: CartSummaryProps) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Cart</h3>
        <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.product.product_id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex-1 truncate text-gray-700">
                  {item.product.product_name}
                  <span className="text-gray-400"> ×{item.quantity}</span>
                </span>
                <span className="font-medium text-gray-900">
                  {formatRupiah(item.product.price * item.quantity)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(item.product.product_id)}
                  aria-label={`Remove ${item.product.product_name}`}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t border-gray-200 pt-3">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-gray-900">{formatRupiah(total)}</span>
          </div>

          <button
            type="button"
            onClick={onClear}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear cart
          </button>
        </>
      )}
    </div>
  );
}
