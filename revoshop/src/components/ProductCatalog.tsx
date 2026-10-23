"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import CartSummary from "./CartSummary";
import AddProductForm from "./AddProductForm";
import Card from "./Card";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

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

  // Cart now lives in the global CartContext (localStorage-backed), so adding
  // from the grid fills the same cart used by /cart and /checkout.
  const { items: cart, addToCart, removeFromCart, clearCart } = useCart();

  const products = [...addedProducts, ...initialProducts];

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
                onAddToCart={addToCart}
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
            onRemove={removeFromCart}
            onClear={clearCart}
          />
        </Card>
        <Card className="p-5">
          <AddProductForm onAdd={handleAddProduct} />
        </Card>
      </aside>
    </div>
  );
}
