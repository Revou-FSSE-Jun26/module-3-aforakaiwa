"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import CartSummary from "./CartSummary";
import AddProductForm from "./AddProductForm";
import Card from "./Card";
import type { CartItem, Product } from "@/types";

interface ProductCatalogProps {
  /** Products already filtered on the server (by ?q= and ?category=). */
  initialProducts: Product[];
  totalItems: number;
}

/**
 * Client orchestrator that wires the product grid, the cart, and the
 * add-product form together. All state updates are immutable (new arrays
 * via map/filter/spread, never mutating the previous state).
 */
export default function ProductCatalog({
  initialProducts,
  totalItems,
}: ProductCatalogProps) {
  // Locally-added products are kept separate so server-driven search/filter
  // (which replaces initialProducts) doesn't wipe them out.
  const [addedProducts, setAddedProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const products = [...addedProducts, ...initialProducts];

  /** Add a product to the cart immutably (merge quantities if already present). */
  function handleAddToCart(product: Product, quantity: number) {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.product_id === product.product_id,
      );
      if (existing) {
        // Return a new array with the matching item replaced (immutable).
        return prev.map((item) =>
          item.product.product_id === product.product_id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { product, quantity }];
    });
  }

  function handleRemoveFromCart(productId: number) {
    setCart((prev) =>
      prev.filter((item) => item.product.product_id !== productId),
    );
  }

  function handleClearCart() {
    setCart([]);
  }

  function handleAddProduct(product: Product) {
    // Prepend immutably so it shows at the top of the list.
    setAddedProducts((prev) => [product, ...prev]);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Product grid */}
      <div>
        <p className="mb-4 text-sm text-gray-600">
          Showing {products.length} of {totalItems + addedProducts.length}{" "}
          products.
        </p>
        {products.length === 0 ? (
          <p className="text-gray-600">No products match your filters.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sidebar: cart + add product */}
      <aside className="space-y-6">
        <Card className="p-5">
          <CartSummary
            items={cart}
            onRemove={handleRemoveFromCart}
            onClear={handleClearCart}
          />
        </Card>
        <Card className="p-5">
          <AddProductForm onAdd={handleAddProduct} />
        </Card>
      </aside>
    </div>
  );
}
