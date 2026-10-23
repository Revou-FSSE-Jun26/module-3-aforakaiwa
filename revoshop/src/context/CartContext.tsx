"use client";

// Global shopping-cart state for RevoShop.
//
// Holds the list of cart items and persists it to localStorage so the cart
// survives a page refresh (a Checkpoint 3 requirement). All mutations are
// immutable (new arrays/objects) so React re-renders reliably.
//
// A cart line is a { product, quantity } pair (see CartItem in types). Adding
// an existing product bumps its quantity instead of duplicating the row.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/types";

const CART_KEY = "revoshop.cart.v1";

/** Read the persisted cart from localStorage. Safe on the server (no window). */
function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CartItem[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Corrupt or unavailable storage — start with an empty cart.
  }
  return [];
}

interface CartContextValue {
  items: CartItem[];
  /** Total number of units across all lines (sum of quantities). */
  itemCount: number;
  /** Total price: sum of price × quantity across all lines. */
  total: number;
  /** True while the cart has no lines — drives the empty state + disabled checkout. */
  isEmpty: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Lazy initializer reads localStorage during the first render (client only),
  // so there's no setState-in-effect hydration step. On the server it starts
  // empty; React reconciles to the stored cart on the client.
  const [items, setItems] = useState<CartItem[]>(() => readStoredCart());

  // Skip the very first persist: the initial effect run would otherwise write
  // the server-rendered empty cart over whatever is already stored before the
  // client has reconciled. A ref avoids an extra render (no setState).
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // Non-fatal: the in-memory cart still works for this tab.
    }
  }, [items]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find(
        (it) => it.product.product_id === product.product_id,
      );
      if (existing) {
        // Bump quantity immutably.
        return prev.map((it) =>
          it.product.product_id === product.product_id
            ? { ...it, quantity: it.quantity + quantity }
            : it,
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setItems((prev) =>
      prev.filter((it) => it.product.product_id !== productId),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);
    const total = items.reduce(
      (sum, it) => sum + it.product.price * it.quantity,
      0,
    );
    return {
      items,
      itemCount,
      total,
      isEmpty: items.length === 0,
      addToCart,
      removeFromCart,
      clearCart,
    };
  }, [items, addToCart, removeFromCart, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Access the cart context. Throws if used outside <CartProvider>. */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return ctx;
}
