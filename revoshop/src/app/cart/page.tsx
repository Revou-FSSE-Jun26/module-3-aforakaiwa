"use client";

// Shopping cart page. Requires a signed-in user (ProtectedRoute) and reads the
// global CartContext (localStorage-backed, so it survives refresh). Shows a
// table of items with per-row remove, an empty state, the total, and a
// checkout button that is disabled when the cart is empty.

import Link from "next/link";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCart } from "@/context/CartContext";
import { formatRupiah } from "@/lib/api";

function CartContent() {
  const { items, total, isEmpty, removeFromCart } = useCart();

  function handleRemove(productId: number, name: string) {
    removeFromCart(productId);
    toast(`${name} removed from cart`);
  }

  return (
    <section className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">My cart</h1>
        <p className="text-sm text-gray-600">
          Review your items before checking out.
        </p>
      </div>

      {isEmpty ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
          <p className="text-gray-600">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Subtotal</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.product.product_id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3 text-gray-900">
                    {item.product.product_name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatRupiah(item.product.price)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{item.quantity}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {formatRupiah(item.product.price * item.quantity)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemove(item.product.product_id, item.product.product_name)}
                      aria-label={`Remove ${item.product.product_name}`}
                      className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <span className="text-gray-600">Total</span>
        <span className="text-xl font-bold text-gray-900" data-testid="cart-total">
          {formatRupiah(total)}
        </span>
      </div>

      {/* Disabled when empty: render a non-interactive button; otherwise a link
          to checkout. */}
      {isEmpty ? (
        <button
          type="button"
          disabled
          className="w-full cursor-not-allowed rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white opacity-50"
        >
          Proceed to Checkout
        </button>
      ) : (
        <Link
          href="/checkout"
          data-testid="checkout-link"
          className="block w-full rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Proceed to Checkout
        </Link>
      )}
    </section>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}
