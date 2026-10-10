// Shared TypeScript types for RevoShop.
// These mirror the shape of the Flask API's `to_dict()` responses (Module 2).

/**
 * A product as returned by GET /products and GET /products/:id.
 * Matches Product.to_dict() in the Flask backend.
 */
export interface Product {
  product_id: number;
  category_id: number;
  product_name: string;
  sku: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string | null;
  deleted_at: string | null;
}

/**
 * A category as returned by GET /categories.
 * GET /categories/:id adds a `products` array (typed below).
 */
export interface Category {
  category_id: number;
  category_name: string;
  description: string | null;
  created_at: string | null;
  deleted_at: string | null;
}

/** GET /categories/:id returns the category plus its products. */
export interface CategoryWithProducts extends Category {
  products: Product[];
}

/** An order as returned by GET /orders (requires auth). */
export interface Order {
  order_id: number;
  user_id: number;
  order_status: OrderStatus;
  shipping_address: string;
  shipping_fee: number;
  total_amount: number;
  ordered_at: string | null;
  deleted_at: string | null;
}

/**
 * Union type for the fixed set of order states the backend allows.
 * (CheckConstraint on the orders table.)
 */
export type OrderStatus =
  | "Pending"
  | "Paid"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Return Process";

/**
 * Union type describing a product's stock state as a single "multi-shape"
 * value: either in stock (with a count) or out of stock. Used to drive
 * conditional rendering on the ProductCard.
 */
export type StockState =
  | { kind: "in-stock"; quantity: number }
  | { kind: "out-of-stock" };

/** Shape of the paginated GET /products response. */
export interface PaginatedProducts {
  products: Product[];
  page: number;
  per_page: number;
  total_pages: number;
  total_items: number;
}

/** A single line in the shopping cart (client-side only for now). */
export interface CartItem {
  product: Product;
  quantity: number;
}
