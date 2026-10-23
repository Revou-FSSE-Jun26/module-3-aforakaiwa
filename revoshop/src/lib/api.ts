// Centralized API client for the RevoShop Flask backend (Module 2).
// All data fetching goes through here so the base URL lives in one place
// and comes from the environment, never hardcoded.

import type {
  Product,
  Category,
  CategoryWithProducts,
  Order,
  OrderDetail,
  PaginatedProducts,
  User,
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

/** GET /products?page=&per_page=&q= — returns the paginated envelope. */
export async function getProducts(
  page = 1,
  perPage = 5,
  q = "",
): Promise<PaginatedProducts> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (q) params.set("q", q);
  return apiFetch<PaginatedProducts>(`/products?${params.toString()}`);
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

/**
 * Result of trying to load orders. Orders are auth-protected on the API, so
 * without a valid JWT the request is unauthorized. We model that as data
 * rather than throwing, so the page can show a clear "sign in" notice
 * instead of a generic error.
 */
export type OrdersResult =
  | { status: "ok"; orders: Order[] }
  | { status: "unauthorized" }
  | { status: "error"; message: string };

/** Fetch orders and classify the outcome (ok / unauthorized / error). */
export async function getOrdersResult(token?: string): Promise<OrdersResult> {
  if (!BASE_URL) {
    return { status: "error", message: "API base URL is not configured." };
  }
  try {
    const res = await fetch(`${BASE_URL}/orders`, {
      next: { revalidate: 30 },
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (res.status === 401 || res.status === 422) {
      return { status: "unauthorized" };
    }
    if (!res.ok) {
      return {
        status: "error",
        message: `Orders request failed: ${res.status}`,
      };
    }
    return { status: "ok", orders: (await res.json()) as Order[] };
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

// ---------------------------------------------------------------------------
// Auth + product creation (write operations against the real Flask backend).
//
// POST /products is Admin-only (`@roles_required("Admin")`), so creating a
// product is a two-step flow: log in to get a JWT, then send it as a Bearer
// token on the POST. Both helpers model failure as data (a typed result)
// rather than throwing, so the form can branch on the outcome.
// ---------------------------------------------------------------------------

/**
 * Result of attempting to log in. On success we return BOTH the JWT and the
 * user object (the backend sends the full user — including `role` — inside the
 * login response), so the caller can persist the session and redirect by role
 * without a second request.
 */
export type LoginResult =
  | { status: "ok"; token: string; user: User }
  | { status: "invalid" } // 401/403 — bad credentials or deactivated
  | { status: "error"; message: string };

/**
 * POST /auth/login — exchange email + password for a JWT and the user record.
 * Returns the token + user on success, or a classified failure.
 */
export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  if (!BASE_URL) {
    return { status: "error", message: "API base URL is not configured." };
  }
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (res.status === 401 || res.status === 403) {
      return { status: "invalid" };
    }
    if (!res.ok) {
      return { status: "error", message: `Login failed: ${res.status}` };
    }

    const data = (await res.json()) as {
      access_token?: string;
      user?: User;
    };
    if (!data.access_token || !data.user) {
      return {
        status: "error",
        message: "Login succeeded but the response was incomplete.",
      };
    }
    return { status: "ok", token: data.access_token, user: data.user };
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

/** Fields POST /users (registration) accepts. */
export interface RegisterInput {
  email: string;
  username: string;
  full_name: string;
  password: string;
}

/**
 * Outcome of POST /users (register), mapped from the backend's status codes:
 *  - 201 -> created (returns the new user; role defaults to "Customer")
 *  - 400 -> validation error (field errors flattened to one message)
 *  - 409 -> conflict (duplicate email or username)
 *  - anything else / network -> generic error
 */
export type RegisterResult =
  | { status: "created"; user: User }
  | { status: "validation"; message: string }
  | { status: "conflict"; message: string }
  | { status: "error"; message: string };

/**
 * POST /users — create a new account. The backend does NOT return a token
 * here, only the user, so the typical flow is: register, then call login() to
 * obtain a JWT (auto-login after signup).
 */
export async function register(
  input: RegisterInput,
): Promise<RegisterResult> {
  if (!BASE_URL) {
    return { status: "error", message: "API base URL is not configured." };
  }
  try {
    const res = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(input),
    });

    if (res.status === 201) {
      const data = (await res.json()) as { user: User };
      return { status: "created", user: data.user };
    }
    if (res.status === 400) {
      const body = await res.json().catch(() => null);
      return { status: "validation", message: formatValidationError(body) };
    }
    if (res.status === 409) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      return {
        status: "conflict",
        message: body?.error ?? "That email or username is already taken.",
      };
    }
    return { status: "error", message: `Registration failed: ${res.status}` };
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

/** Fields the backend's ProductCreateSchema accepts on POST /products. */
export interface CreateProductInput {
  category_id: number;
  product_name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  description?: string;
}

/**
 * Outcome of POST /products, mapped from the backend's real status codes:
 *  - 201 -> created (with the new product)
 *  - 400 -> validation error (field errors or a single message)
 *  - 409 -> conflict (duplicate SKU)
 *  - 401/422 -> not authenticated (missing/expired token)
 *  - 403 -> authenticated but not an Admin
 *  - anything else / network -> generic error
 */
export type CreateProductResult =
  | { status: "created"; product: Product }
  | { status: "validation"; message: string }
  | { status: "conflict"; message: string }
  | { status: "unauthorized" }
  | { status: "forbidden"; message: string }
  | { status: "error"; message: string };

/**
 * Flatten the backend's 400 body into a single human-readable string.
 * Marshmallow returns `{ errors: { field: ["msg", ...] } }`; a non-JSON
 * request body returns `{ error: "Request body must be JSON" }`.
 */
function formatValidationError(body: unknown): string {
  if (body && typeof body === "object") {
    const b = body as { error?: unknown; errors?: unknown };
    if (typeof b.error === "string") return b.error;
    if (b.errors && typeof b.errors === "object") {
      const parts = Object.entries(b.errors as Record<string, unknown>).map(
        ([field, msgs]) => {
          const text = Array.isArray(msgs) ? msgs.join(", ") : String(msgs);
          return `${field}: ${text}`;
        },
      );
      if (parts.length) return parts.join(" · ");
    }
  }
  return "Validation failed. Please check the fields.";
}

/**
 * POST /products with a Bearer token. Classifies the response so the caller
 * can show a success message, a form-level validation error, or a toast.
 */
export async function createProduct(
  input: CreateProductInput,
  token: string,
): Promise<CreateProductResult> {
  if (!BASE_URL) {
    return { status: "error", message: "API base URL is not configured." };
  }
  try {
    const res = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (res.status === 201) {
      const data = (await res.json()) as { product: Product };
      return { status: "created", product: data.product };
    }
    if (res.status === 400) {
      const body = await res.json().catch(() => null);
      return { status: "validation", message: formatValidationError(body) };
    }
    if (res.status === 409) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      return {
        status: "conflict",
        message: body?.error ?? "That SKU already exists.",
      };
    }
    if (res.status === 401 || res.status === 422) {
      return { status: "unauthorized" };
    }
    if (res.status === 403) {
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      return {
        status: "forbidden",
        message: body?.message ?? "You need an Admin account to add products.",
      };
    }
    return { status: "error", message: `Request failed: ${res.status}` };
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

// ---------------------------------------------------------------------------
// Reading orders from the client. Auth is client-side (JWT in localStorage),
// so these take the user's token and run in the browser. The backend scopes
// GET /orders to the token's own user automatically.
// ---------------------------------------------------------------------------

/** Outcome of GET /orders from the client. */
export type FetchOrdersResult =
  | { status: "ok"; orders: Order[] }
  | { status: "unauthorized" }
  | { status: "error"; message: string };

/** GET /orders with a Bearer token (the user's own orders). */
export async function fetchOrders(token: string): Promise<FetchOrdersResult> {
  if (!BASE_URL) {
    return { status: "error", message: "API base URL is not configured." };
  }
  try {
    const res = await fetch(`${BASE_URL}/orders`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status === 401 || res.status === 422) return { status: "unauthorized" };
    if (!res.ok) {
      return { status: "error", message: `Orders request failed: ${res.status}` };
    }
    return { status: "ok", orders: (await res.json()) as Order[] };
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

/** Outcome of GET /orders/:id from the client. */
export type FetchOrderDetailResult =
  | { status: "ok"; order: OrderDetail }
  | { status: "unauthorized" }
  | { status: "not-found" }
  | { status: "error"; message: string };

/** GET /orders/:id with a Bearer token — the order plus its line items. */
export async function fetchOrderDetail(
  id: number | string,
  token: string,
): Promise<FetchOrderDetailResult> {
  if (!BASE_URL) {
    return { status: "error", message: "API base URL is not configured." };
  }
  try {
    const res = await fetch(`${BASE_URL}/orders/${id}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status === 401 || res.status === 422) return { status: "unauthorized" };
    if (res.status === 404) return { status: "not-found" };
    if (!res.ok) {
      return { status: "error", message: `Order request failed: ${res.status}` };
    }
    return { status: "ok", order: (await res.json()) as OrderDetail };
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

// ---------------------------------------------------------------------------
// Order creation (checkout). POST /orders is auth-protected: the signed-in
// user's JWT identifies the buyer. The body carries the shipping address and
// the cart lines; the backend computes total_amount server-side.
// ---------------------------------------------------------------------------

/** A single cart line as the backend expects it on POST /orders. */
export interface OrderLineInput {
  product_id: number;
  quantity: number;
}

/** Fields POST /orders accepts. */
export interface CreateOrderInput {
  shipping_address: string;
  items: OrderLineInput[];
}

/**
 * Outcome of POST /orders:
 *  - 201 -> created (returns the new order with its server-computed total)
 *  - 400 -> validation error (flattened to one message)
 *  - 401/422 -> not authenticated (missing/expired token)
 *  - anything else / network -> generic error
 */
export type CreateOrderResult =
  | { status: "created"; order: Order }
  | { status: "validation"; message: string }
  | { status: "unauthorized" }
  | { status: "error"; message: string };

/** POST /orders with a Bearer token. Classifies the response for the caller. */
export async function createOrder(
  input: CreateOrderInput,
  token: string,
): Promise<CreateOrderResult> {
  if (!BASE_URL) {
    return { status: "error", message: "API base URL is not configured." };
  }
  try {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (res.status === 201) {
      const data = (await res.json()) as { order: Order };
      return { status: "created", order: data.order };
    }
    if (res.status === 400) {
      const body = await res.json().catch(() => null);
      return { status: "validation", message: formatValidationError(body) };
    }
    if (res.status === 401 || res.status === 422) {
      return { status: "unauthorized" };
    }
    return { status: "error", message: `Request failed: ${res.status}` };
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

// ---------------------------------------------------------------------------
// Admin CRUD: product update/delete, full category CRUD, and the admin order
// overview. All are Admin-only on the backend and take the admin's JWT.
// ---------------------------------------------------------------------------

/** Fields PUT /products/:id accepts (all optional — partial update). */
export interface UpdateProductInput {
  category_id?: number;
  product_name?: string;
  sku?: string;
  price?: number;
  stock_quantity?: number;
  description?: string;
}

export type UpdateProductResult =
  | { status: "updated"; product: Product }
  | { status: "validation"; message: string }
  | { status: "conflict"; message: string }
  | { status: "unauthorized" }
  | { status: "forbidden"; message: string }
  | { status: "not-found" }
  | { status: "error"; message: string };

/** PUT /products/:id with a Bearer token. */
export async function updateProduct(
  id: number | string,
  input: UpdateProductInput,
  token: string,
): Promise<UpdateProductResult> {
  if (!BASE_URL) return { status: "error", message: "API base URL is not configured." };
  try {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
    if (res.ok) {
      const data = (await res.json()) as { product?: Product } & Partial<Product>;
      // Backend may return { product } or the product directly; handle both.
      const product = (data.product ?? (data as Product)) as Product;
      return { status: "updated", product };
    }
    if (res.status === 400) {
      const body = await res.json().catch(() => null);
      return { status: "validation", message: formatValidationError(body) };
    }
    if (res.status === 409) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      return { status: "conflict", message: body?.error ?? "That SKU already exists." };
    }
    if (res.status === 401 || res.status === 422) return { status: "unauthorized" };
    if (res.status === 403) {
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      return { status: "forbidden", message: body?.message ?? "Admins only." };
    }
    if (res.status === 404) return { status: "not-found" };
    return { status: "error", message: `Request failed: ${res.status}` };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Unknown error" };
  }
}

export type DeleteResult =
  | { status: "deleted" }
  | { status: "conflict"; message: string } // e.g. product has active orders
  | { status: "unauthorized" }
  | { status: "forbidden"; message: string }
  | { status: "not-found" }
  | { status: "error"; message: string };

/** DELETE /products/:id. 409 means the product has active orders. */
export async function deleteProduct(
  id: number | string,
  token: string,
): Promise<DeleteResult> {
  if (!BASE_URL) return { status: "error", message: "API base URL is not configured." };
  try {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: "DELETE",
      cache: "no-store",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    if (res.ok) return { status: "deleted" };
    if (res.status === 409) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      return {
        status: "conflict",
        message: body?.error ?? "Cannot delete product with active orders.",
      };
    }
    if (res.status === 401 || res.status === 422) return { status: "unauthorized" };
    if (res.status === 403) {
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      return { status: "forbidden", message: body?.message ?? "Admins only." };
    }
    if (res.status === 404) return { status: "not-found" };
    return { status: "error", message: `Request failed: ${res.status}` };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Unknown error" };
  }
}

/** Fields POST/PUT /categories accept. */
export interface CategoryInput {
  category_name: string;
  description: string;
}

export type CreateCategoryResult =
  | { status: "created"; category: Category }
  | { status: "validation"; message: string }
  | { status: "conflict"; message: string }
  | { status: "unauthorized" }
  | { status: "forbidden"; message: string }
  | { status: "error"; message: string };

/** Normalize a category response that may be { category } or the object itself. */
function readCategory(data: unknown): Category {
  const d = data as { category?: Category } & Partial<Category>;
  return (d.category ?? (d as Category)) as Category;
}

/** POST /categories with a Bearer token. */
export async function createCategory(
  input: CategoryInput,
  token: string,
): Promise<CreateCategoryResult> {
  if (!BASE_URL) return { status: "error", message: "API base URL is not configured." };
  try {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
    if (res.status === 201 || res.ok) {
      return { status: "created", category: readCategory(await res.json()) };
    }
    if (res.status === 400) {
      const body = await res.json().catch(() => null);
      return { status: "validation", message: formatValidationError(body) };
    }
    if (res.status === 409) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      return { status: "conflict", message: body?.error ?? "That category already exists." };
    }
    if (res.status === 401 || res.status === 422) return { status: "unauthorized" };
    if (res.status === 403) {
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      return { status: "forbidden", message: body?.message ?? "Admins only." };
    }
    return { status: "error", message: `Request failed: ${res.status}` };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Unknown error" };
  }
}

export type UpdateCategoryResult =
  | { status: "updated"; category: Category }
  | { status: "validation"; message: string }
  | { status: "conflict"; message: string }
  | { status: "unauthorized" }
  | { status: "forbidden"; message: string }
  | { status: "not-found" }
  | { status: "error"; message: string };

/** PUT /categories/:id with a Bearer token (partial update allowed). */
export async function updateCategory(
  id: number | string,
  input: Partial<CategoryInput>,
  token: string,
): Promise<UpdateCategoryResult> {
  if (!BASE_URL) return { status: "error", message: "API base URL is not configured." };
  try {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
    if (res.ok) return { status: "updated", category: readCategory(await res.json()) };
    if (res.status === 400) {
      const body = await res.json().catch(() => null);
      return { status: "validation", message: formatValidationError(body) };
    }
    if (res.status === 409) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      return { status: "conflict", message: body?.error ?? "That category name is taken." };
    }
    if (res.status === 401 || res.status === 422) return { status: "unauthorized" };
    if (res.status === 403) {
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      return { status: "forbidden", message: body?.message ?? "Admins only." };
    }
    if (res.status === 404) return { status: "not-found" };
    return { status: "error", message: `Request failed: ${res.status}` };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Unknown error" };
  }
}

/** DELETE /categories/:id with a Bearer token. */
export async function deleteCategory(
  id: number | string,
  token: string,
): Promise<DeleteResult> {
  if (!BASE_URL) return { status: "error", message: "API base URL is not configured." };
  try {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: "DELETE",
      cache: "no-store",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    if (res.ok) return { status: "deleted" };
    if (res.status === 409) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      return { status: "conflict", message: body?.error ?? "Cannot delete this category." };
    }
    if (res.status === 401 || res.status === 422) return { status: "unauthorized" };
    if (res.status === 403) {
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      return { status: "forbidden", message: body?.message ?? "Admins only." };
    }
    if (res.status === 404) return { status: "not-found" };
    return { status: "error", message: `Request failed: ${res.status}` };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Unknown error" };
  }
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
