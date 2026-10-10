// Centralized API client for the RevoShop Flask backend (Module 2).
// All data fetching goes through here so the base URL lives in one place
// and comes from the environment, never hardcoded.

import type {
  Product,
  Category,
  CategoryWithProducts,
  Order,
  PaginatedProducts,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  // Fail loudly during development if the env var is missing.
  console.warn(
    "NEXT_PUBLIC_API_BASE_URL is not set. Create .env.local from .env.example.",
  );
}

/**
 * Thin wrapper around fetch that:
 *  - builds the full URL from the base + path
 *  - throws on non-2xx so route-level error.tsx can catch it
 *  - revalidates every 60s by default (tweak per call as needed)
 */
async function apiFetch<T>(
  path: string,
  init?: RequestInit & { revalidate?: number },
): Promise<T> {
  if (!BASE_URL) {
    throw new Error("API base URL is not configured.");
  }

  const { revalidate = 60, ...rest } = init ?? {};
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...rest,
    next: { revalidate },
    headers: {
      Accept: "application/json",
      ...rest.headers,
    },
  });

  if (!res.ok) {
    throw new Error(
      `API request failed: ${res.status} ${res.statusText} (${path})`,
    );
  }

  return (await res.json()) as T;
}

/** GET /products?page=&per_page= — returns the paginated envelope. */
export async function getProducts(
  page = 1,
  perPage = 5,
): Promise<PaginatedProducts> {
  return apiFetch<PaginatedProducts>(
    `/products?page=${page}&per_page=${perPage}`,
  );
}

/** Convenience: fetch just the product array for a page. */
export async function getProductList(page = 1, perPage = 20): Promise<Product[]> {
  const data = await getProducts(page, perPage);
  return data.products;
}

/** GET /products/:id — a single product, or null if 404. */
export async function getProduct(id: number | string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/products/${id}`);
  } catch {
    return null;
  }
}

/** GET /categories — all categories. */
export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories");
}

/** GET /categories/:id — a category plus its products. */
export async function getCategoryWithProducts(
  id: number | string,
): Promise<CategoryWithProducts | null> {
  try {
    return await apiFetch<CategoryWithProducts>(`/categories/${id}`);
  } catch {
    return null;
  }
}

/**
 * GET /orders — requires a JWT. Without auth the backend returns 401/422,
 * so this will throw; callers can surface a friendly "sign in" state.
 */
export async function getOrders(token?: string): Promise<Order[]> {
  return apiFetch<Order[]>("/orders", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

/** Format a number as Indonesian Rupiah, e.g. 1450000 -> "Rp1.450.000". */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
