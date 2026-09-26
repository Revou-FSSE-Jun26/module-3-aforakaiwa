export type Category = "electronics" | "clothing" | "home" | "books";

export type StockStatus =
    | { kind: "in-stock"; quantity: number }
    | { kind: "low-stock"; quantity: number }
    | { kind: "out-of-stock"; restockDate: string | null };

export type Badge = "new" | "sale" | "bestseller" | null;

export interface Price {
    amount: number;
    originalAmount?: number; // only present when on sale
}

// Main product interface
export interface Product {
    readonly id: number;
    name: string;
    description: string;
    category: Category;
    price: Price;
    stock: StockStatus;
    badge: Badge;
    tags: string[];
}

export interface CartItem {
    productId: number;
    quantity: number;
}

export type CategoryFilter = Category | "all";

export interface CatalogState {
    query: string;
    category: CategoryFilter;
    cart: CartItem[];
}