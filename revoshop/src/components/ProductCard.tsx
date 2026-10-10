"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "./Card";
import { formatRupiah } from "@/lib/api";
import type { Product, StockState } from "@/types";

/**
 * Props for ProductCard.
 * - product: the product to display (required)
 * - showAddToCart: whether to render the quantity counter + add button (optional)
 * - initialQuantity: starting counter value (optional)
 * - maxQuantity: hard cap on the counter; defaults to the product's stock (optional)
 * - onAddToCart: called with (product, quantity) when "Add to Cart" is clicked (optional)
 */
export interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  initialQuantity?: number;
  maxQuantity?: number;
  onAddToCart?: (product: Product, quantity: number) => void;
}

/** Map a product's raw stock number to a typed, named stock state. */
function getStockState(stock: number): StockState {
  return stock > 0
    ? { kind: "in-stock", quantity: stock }
    : { kind: "out-of-stock" };
}

export default function ProductCard({
  product,
  showAddToCart = true,
  initialQuantity = 1,
  maxQuantity,
  onAddToCart,
}: ProductCardProps) {
  const stock = getStockState(product.stock_quantity);
  const inStock = stock.kind === "in-stock";

  // The counter can never exceed available stock (or an explicit maxQuantity).
  const cap = maxQuantity ?? (inStock ? stock.quantity : 0);

  const [quantity, setQuantity] = useState(initialQuantity);

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => Math.min(cap, q + 1));

  // Conditional Tailwind class strings driven by typed data.
  const buttonClass = inStock
    ? "bg-brand text-white hover:bg-brand-dark"
    : "bg-gray-200 text-gray-500 cursor-not-allowed";

  const badgeClass = inStock
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";

  return (
    <Card as="article" className="flex flex-col p-4">
      {/* Stock badge */}
      <span
        className={`mb-2 inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}
      >
        {inStock ? `In stock: ${stock.quantity}` : "Out of stock"}
      </span>

      {/* Title links to the detail page (reserve 2 lines so cards align) */}
      <h3 className="min-h-[3rem] font-semibold text-gray-900">
        <Link
          href={`/products/${product.product_id}`}
          className="line-clamp-2 hover:text-brand"
        >
          {product.product_name}
        </Link>
      </h3>

      {/* Description reserves 2 lines so the price/button rows line up */}
      <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-gray-600">
        {product.description ?? "No description available."}
      </p>

      {/* Push price + actions to the bottom so they align across all cards */}
      <p className="mt-auto pt-3 text-lg font-bold text-gray-900">
        {formatRupiah(product.price)}
      </p>

      {showAddToCart && (
        <div className="mt-4 flex items-center gap-3">
          {/* Quantity counter */}
          <div className="flex items-center rounded-lg border border-gray-300">
            <button
              type="button"
              onClick={decrement}
              disabled={!inStock || quantity <= 1}
              aria-label="Decrease quantity"
              className="px-3 py-1 text-lg text-gray-700 disabled:opacity-40"
            >
              &minus;
            </button>
            <span className="w-8 text-center text-sm" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={increment}
              disabled={!inStock || quantity >= cap}
              aria-label="Increase quantity"
              className="px-3 py-1 text-lg text-gray-700 disabled:opacity-40"
            >
              +
            </button>
          </div>

          {/* In-stock vs out-of-stock button */}
          <button
            type="button"
            disabled={!inStock}
            onClick={() => onAddToCart?.(product, quantity)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold ${buttonClass}`}
          >
            {inStock ? "Add to Cart" : "Unavailable"}
          </button>
        </div>
      )}
    </Card>
  );
}
