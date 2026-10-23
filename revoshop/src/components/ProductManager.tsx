"use client";

// Orchestrates product CRUD on the dashboard: create form + table with
// per-row Edit (inline form) and Delete. Keeps the product list in state and
// re-fetches after each mutation so the table always reflects the backend.
// The delete flow surfaces the backend's 409 ("active orders") as a visible
// error.

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getProductList,
  deleteProduct,
  getCategories,
  formatRupiah,
} from "@/lib/api";
import type { Category, Product } from "@/types";
import CreateProductForm from "./CreateProductForm";
import EditProductForm from "./EditProductForm";

export default function ProductManager() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  async function refresh() {
    const [prods, cats] = await Promise.all([
      getProductList(1, 100).catch(() => [] as Product[]),
      getCategories().catch(() => [] as Category[]),
    ]);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  }

  useEffect(() => {
    // Initial load. Fetch runs against the API (an external system) and the
    // state is set in the async callback, after the awaits resolve — not
    // synchronously in the effect body.
    let cancelled = false;
    Promise.all([
      getProductList(1, 100).catch(() => [] as Product[]),
      getCategories().catch(() => [] as Category[]),
    ]).then(([prods, cats]) => {
      if (cancelled) return;
      setProducts(prods);
      setCategories(cats);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function categoryName(id: number): string {
    return categories.find((c) => c.category_id === id)?.category_name ?? `#${id}`;
  }

  async function handleDelete(product: Product) {
    setActionError("");
    setActionSuccess("");
    if (!token) {
      setActionError("Your session has expired. Please sign in again.");
      return;
    }
    const confirmed = window.confirm(
      `Delete "${product.product_name}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(product.product_id);
    try {
      const res = await deleteProduct(product.product_id, token);
      if (res.status === "deleted") {
        setActionSuccess(`"${product.product_name}" deleted.`);
        await refresh();
      } else if (res.status === "conflict") {
        // The visible "active orders" guard error.
        setActionError(res.message);
      } else if (res.status === "unauthorized") {
        setActionError("Your session has expired. Please sign in again.");
      } else if (res.status === "not-found") {
        setActionError("That product no longer exists.");
        await refresh();
      } else if (res.status === "forbidden") {
        setActionError(res.message);
      } else {
        setActionError(res.message);
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {editing ? (
        <EditProductForm
          product={editing}
          categories={categories}
          onCancel={() => setEditing(null)}
          onUpdated={async (updated) => {
            setEditing(null);
            setActionSuccess(`"${updated.product_name}" updated.`);
            await refresh();
          }}
        />
      ) : (
        <CreateProductForm
          categories={categories}
          onCreated={async () => {
            await refresh();
          }}
        />
      )}

      {actionError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" data-testid="product-action-error">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {actionSuccess}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="font-semibold text-gray-900">Products</h2>
        </div>
        {loading ? (
          <p className="px-4 py-6 text-sm text-gray-500">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">No products yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody data-testid="product-table-body">
              {products.map((p) => (
                <tr key={p.product_id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-gray-900">{p.product_name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.sku}</td>
                  <td className="px-4 py-3 text-gray-600">{categoryName(p.category_id)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatRupiah(p.price)}</td>
                  <td className="px-4 py-3 text-gray-700">{p.stock_quantity}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => { setEditing(p); setActionError(""); setActionSuccess(""); }}
                        className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(p)} disabled={deletingId === p.product_id}
                        className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
                        {deletingId === p.product_id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
