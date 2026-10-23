"use client";

import toast from "react-hot-toast";
import ProductCard from "./ProductCard";
import CartSummary from "./CartSummary";
import Card from "./Card";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

interface ProductCatalogProps {
  /** Products already filtered on the server (by ?q= and ?category=). */
  initialProducts: Product[];
  totalItems: number;
}

/**
 * Client orchestrator for the public product catalog: the product grid plus a
 * cart summary sidebar. Adding to the cart writes to the global CartContext
 * (localStorage-backed), the same cart used by /cart and /checkout.
 *
 * Product creation now lives in the admin dashboard (ProductManager), so this
 * public page no longer embeds an admin-only form.
 */
export default function ProductCatalog({
  initialProducts,
  totalItems,
}: ProductCatalogProps) {
  const { items: cart, addToCart, removeFromCart, clearCart } = useCart();

  function handleAdd(product: Product, quantity: number) {
    addToCart(product, quantity);
    toast.success(`${product.product_name} added to cart`);
  }

  function handleRemove(productId: number) {
    const item = cart.find((it) => it.product.product_id === productId);
    removeFromCart(productId);
    if (item) toast(`${item.product.product_name} removed from cart`);
  }

  function handleClear() {
    clearCart();
    toast("Cart cleared");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Product grid */}
      <div>
        <p className="mb-4 text-sm text-gray-600">
          Showing {initialProducts.length} of {totalItems} products.
        </p>
        {initialProducts.length === 0 ? (
          <p className="text-gray-600">No products match your filters.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {initialProducts.map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                onAddToCart={handleAdd}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sidebar: cart summary */}
      <aside className="space-y-6">
        <Card className="p-5">
          <CartSummary
            items={cart}
            onRemove={handleRemove}
            onClear={handleClear}
          />
        </Card>
      </aside>
    </div>
  );
}
