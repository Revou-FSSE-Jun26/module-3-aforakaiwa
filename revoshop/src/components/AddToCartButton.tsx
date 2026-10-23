"use client";

// Standalone "Add to Cart" button backed by the global CartContext. Used on
// the product detail page. Out-of-stock products render a disabled button.
// (Toast notifications are wired in a later stage.)

import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

interface AddToCartButtonProps {
  product: Product;
  /** How many units to add per click. Defaults to 1. */
  quantity?: number;
  className?: string;
}

export default function AddToCartButton({
  product,
  quantity = 1,
  className = "",
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const inStock = product.stock_quantity > 0;

  return (
    <button
      type="button"
      disabled={!inStock}
      onClick={() => addToCart(product, quantity)}
      data-testid="add-to-cart"
      className={
        className ||
        `rounded-lg px-5 py-2 text-sm font-semibold transition ${
          inStock
            ? "bg-brand text-white hover:bg-brand-dark"
            : "cursor-not-allowed bg-gray-200 text-gray-500"
        }`
      }
    >
      {inStock ? "Add to Cart" : "Out of stock"}
    </button>
  );
}
