"use client";

// Orchestrates category CRUD on the dashboard: create form + table with
// per-row edit (inline) and delete.
//
// DELETION GUARD (frontend): the backend soft-deletes categories even when
// products are linked, so we enforce the "can't delete a category with linked
// products" rule here. Before deleting, we fetch the category's products via
// GET /categories/:id and refuse (with a visible error) if any exist.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import {
  getCategories,
  getCategoryWithProducts,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api";
import type { Category } from "@/types";

export default function CategoryManager() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Row action feedback
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  async function refresh() {
    const cats = await getCategories().catch(() => [] as Category[]);
    setCategories(cats);
    setLoading(false);
  }

  useEffect(() => {
    // Initial load; state set in the async callback, not synchronously.
    let cancelled = false;
    getCategories()
      .catch(() => [] as Category[])
      .then((cats) => {
        if (cancelled) return;
        setCategories(cats);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    if (!name.trim()) {
      setCreateError("Category name is required.");
      return;
    }
    if (!description.trim()) {
      setCreateError("Description is required.");
      return;
    }
    if (!token) {
      setCreateError("Your session has expired. Please sign in again.");
      return;
    }
    setCreating(true);
    try {
      const res = await createCategory(
        { category_name: name.trim(), description: description.trim() },
        token,
      );
      if (res.status === "created") {
        setCreateSuccess(`"${res.category.category_name}" created.`);
        toast.success(`"${res.category.category_name}" created`);
        setName("");
        setDescription("");
        await refresh();
      } else {
        const msg = res.status === "unauthorized" ? "Your session has expired. Please sign in again." : res.message;
        setCreateError(msg);
        toast.error(msg);
      }
    } finally {
      setCreating(false);
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.category_id);
    setEditName(cat.category_name);
    setEditDescription(cat.description ?? "");
    setActionError("");
    setActionSuccess("");
  }

  async function handleSaveEdit(id: number) {
    setActionError("");
    setActionSuccess("");
    if (!editName.trim()) {
      setActionError("Category name is required.");
      return;
    }
    if (!token) {
      setActionError("Your session has expired. Please sign in again.");
      return;
    }
    setBusyId(id);
    try {
      const res = await updateCategory(
        id,
        { category_name: editName.trim(), description: editDescription.trim() },
        token,
      );
      if (res.status === "updated") {
        setEditingId(null);
        setActionSuccess("Category updated.");
        toast.success("Category updated");
        await refresh();
      } else if (res.status === "unauthorized") {
        const msg = "Your session has expired. Please sign in again.";
        setActionError(msg);
        toast.error(msg);
      } else if (res.status === "not-found") {
        setActionError("That category no longer exists.");
        await refresh();
      } else {
        setActionError(res.message);
        toast.error(res.message);
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(cat: Category) {
    setActionError("");
    setActionSuccess("");
    if (!token) {
      setActionError("Your session has expired. Please sign in again.");
      return;
    }
    setBusyId(cat.category_id);
    try {
      // Frontend deletion guard: refuse if the category has linked products.
      const detail = await getCategoryWithProducts(cat.category_id);
      const linked = detail?.products?.length ?? 0;
      if (linked > 0) {
        const msg = `Cannot delete "${cat.category_name}": it has ${linked} linked product${linked === 1 ? "" : "s"}. Reassign or remove them first.`;
        setActionError(msg);
        toast.error(msg);
        return;
      }
      const confirmed = window.confirm(`Delete "${cat.category_name}"?`);
      if (!confirmed) return;

      const res = await deleteCategory(cat.category_id, token);
      if (res.status === "deleted") {
        setActionSuccess(`"${cat.category_name}" deleted.`);
        toast.success(`"${cat.category_name}" deleted`);
        await refresh();
      } else if (res.status === "conflict") {
        setActionError(res.message);
        toast.error(res.message);
      } else if (res.status === "unauthorized") {
        const msg = "Your session has expired. Please sign in again.";
        setActionError(msg);
        toast.error(msg);
      } else if (res.status === "not-found") {
        setActionError("That category no longer exists.");
        await refresh();
      } else {
        setActionError(res.message);
        toast.error(res.message);
      }
    } finally {
      setBusyId(null);
    }
  }

  const field =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40";

  return (
    <div className="space-y-6">
      {/* Create form */}
      <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6" noValidate>
        <h2 className="text-lg font-semibold text-gray-900">New category</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cc-name" className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input id="cc-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              className={field} placeholder="e.g. Electronics" />
          </div>
          <div>
            <label htmlFor="cc-desc" className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <input id="cc-desc" type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              className={field} placeholder="Short description" />
          </div>
        </div>
        {createError && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{createError}</div>
        )}
        {createSuccess && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{createSuccess}</div>
        )}
        <div className="flex justify-end">
          <button type="submit" disabled={creating} data-testid="create-category-submit"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
            {creating && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
            {creating ? "Saving…" : "Add category"}
          </button>
        </div>
      </form>

      {actionError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" data-testid="category-action-error">{actionError}</div>
      )}
      {actionSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{actionSuccess}</div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="font-semibold text-gray-900">Categories</h2>
        </div>
        {loading ? (
          <p className="px-4 py-6 text-sm text-gray-500">Loading categories…</p>
        ) : categories.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">No categories yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody data-testid="category-table-body">
              {categories.map((c) => (
                <tr key={c.category_id} className="border-b border-gray-100 last:border-0">
                  {editingId === c.category_id ? (
                    <>
                      <td className="px-4 py-3">
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={field} />
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className={field} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setEditingId(null)}
                            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                          <button type="button" onClick={() => handleSaveEdit(c.category_id)} disabled={busyId === c.category_id}
                            className="rounded-md bg-brand px-3 py-1 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
                            {busyId === c.category_id ? "Saving…" : "Save"}
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-gray-900">{c.category_name}</td>
                      <td className="px-4 py-3 text-gray-600">{c.description ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => startEdit(c)}
                            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">Edit</button>
                          <button type="button" onClick={() => handleDelete(c)} disabled={busyId === c.category_id}
                            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
                            {busyId === c.category_id ? "…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
