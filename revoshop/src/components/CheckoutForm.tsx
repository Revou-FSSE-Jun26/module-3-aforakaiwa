"use client";

// Checkout form. Collects the shipping address, shows an order summary from
// the cart, and on submit POSTs /orders with the signed-in user's token.
// On success it clears the cart and redirects to /orders.
//
// Guard rails: an empty cart can't be ordered (the submit is disabled and the
// handler bails), and a missing token means the session expired.

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createOrder, formatRupiah } from "@/lib/api";

export default function CheckoutForm() {
  const router = useRouter();
  const { token } = useAuth();
  const { items, total, isEmpty, clearCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    setAddressError("");

    if (isEmpty) {
      setFormError("Your cart is empty.");
      return;
    }
    if (!shippingAddress.trim()) {
      setAddressError("Shipping address is required.");
      return;
    }
    if (!token) {
      setFormError("Your session has expired. Please sign in again.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createOrder(
        {
          shipping_address: shippingAddress.trim(),
          items: items.map((it) => ({
            product_id: it.product.product_id,
            quantity: it.quantity,
          })),
        },
        token,
      );

      if (result.status === "created") {
        clearCart();
        toast.success(`Order #${result.order.order_id} placed`);
        router.replace("/orders");
      } else if (result.status === "validation") {
        setFormError(result.message);
        toast.error(result.message);
      } else if (result.status === "unauthorized") {
        const msg = "Your session has expired. Please sign in again.";
        setFormError(msg);
        toast.error(msg);
      } else {
        setFormError(result.message);
        toast.error(result.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="text-sm text-gray-600">
          Confirm your order and shipping details.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Shipping form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-gray-200 bg-white p-6"
          noValidate
        >
          <div>
            <label
              htmlFor="shipping-address"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Shipping address
            </label>
            <textarea
              id="shipping-address"
              rows={3}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand/40 ${
                addressError
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-brand"
              }`}
              placeholder="Street, city, postal code"
            />
            {addressError && (
              <p className="mt-1 text-xs text-red-600">{addressError}</p>
            )}
          </div>

          {formError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <span aria-hidden>⚠</span>
              <span>{formError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || isEmpty}
            data-testid="confirm-order"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden
              />
            )}
            {submitting ? "Placing order…" : "Confirm Order"}
          </button>
        </form>

        {/* Order summary */}
        <aside className="h-fit space-y-3 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">Order summary</h2>
          {isEmpty ? (
            <p className="text-sm text-gray-500">Your cart is empty.</p>
          ) : (
            <>
              <ul className="space-y-2">
                {items.map((it) => (
                  <li
                    key={it.product.product_id}
                    className="flex justify-between gap-2 text-sm"
                  >
                    <span className="flex-1 truncate text-gray-700">
                      {it.product.product_name}
                      <span className="text-gray-400"> ×{it.quantity}</span>
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatRupiah(it.product.price * it.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between border-t border-gray-200 pt-3">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-gray-900">
                  {formatRupiah(total)}
                </span>
              </div>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
