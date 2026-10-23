"use client";

// Admin "edit product" form. Prefilled from the product being edited; submits
// a PUT with the admin's JWT. Calls onUpdated with the updated product, or
// onCancel to close without saving.

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateProduct } from "@/lib/api";
import type { Category, Product } from "@/types";

const NAME_MAX = 100;
const SKU_MAX = 11;

interface EditProductFormProps {
  product: Product;
  categories: Category[];
  onUpdated: (product: Product) => void;
  onCancel: () => void;
}

export default function EditProductForm({
  product,
  categories,
  onUpdated,
  onCancel,
}: EditProductFormProps) {
  const { token } = useAuth();

  const [productName, setProductName] = useState(product.product_name);
  const [sku, setSku] = useState(product.sku);
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock_quantity));
  const [categoryId, setCategoryId] = useState(String(product.category_id));
  const [description, setDescription] = useState(product.description ?? "");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    if (!productName.trim() || !sku.trim()) {
      setFormError("Name and SKU are required.");
      return;
    }
    if (!token) {
      setFormError("Your session has expired. Please sign in again.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await updateProduct(
        product.product_id,
        {
          category_id: Number(categoryId),
          product_name: productName.trim(),
          sku: sku.trim(),
          price: Number(price),
          stock_quantity: Number(stock),
          description: description.trim(),
        },
        token,
      );
      if (res.status === "updated") {
        onUpdated(res.product);
      } else if (res.status === "validation" || res.status === "conflict") {
        setFormError(res.message);
      } else if (res.status === "unauthorized") {
        setFormError("Your session has expired. Please sign in again.");
      } else if (res.status === "not-found") {
        setFormError("That product no longer exists.");
      } else if (res.status === "forbidden") {
        setFormError(res.message);
      } else {
        setFormError(res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const baseField =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40";
  const labelClass = "mb-1 block text-sm font-medium text-gray-700";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-brand/40 bg-brand-light/30 p-6"
      noValidate
    >
      <h2 className="text-lg font-semibold text-gray-900">
        Edit product #{product.product_id}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="ep-name" className={labelClass}>Name</label>
          <input id="ep-name" type="text" maxLength={NAME_MAX} value={productName}
            onChange={(e) => setProductName(e.target.value)} className={baseField} />
        </div>
        <div>
          <label htmlFor="ep-sku" className={labelClass}>SKU</label>
          <input id="ep-sku" type="text" maxLength={SKU_MAX} value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())} className={baseField} />
        </div>
        <div>
          <label htmlFor="ep-cat" className={labelClass}>Category</label>
          {categories.length > 0 ? (
            <select id="ep-cat" value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)} className={baseField}>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
              ))}
            </select>
          ) : (
            <input id="ep-cat" type="number" min="1" value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)} className={baseField} />
          )}
        </div>
        <div>
          <label htmlFor="ep-price" className={labelClass}>Price</label>
          <input id="ep-price" type="number" min="0" step="0.01" value={price}
            onChange={(e) => setPrice(e.target.value)} className={baseField} />
        </div>
        <div>
          <label htmlFor="ep-stock" className={labelClass}>Stock</label>
          <input id="ep-stock" type="number" min="0" step="1" value={stock}
            onChange={(e) => setStock(e.target.value)} className={baseField} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="ep-desc" className={labelClass}>Description</label>
          <input id="ep-desc" type="text" value={description}
            onChange={(e) => setDescription(e.target.value)} className={baseField} />
        </div>
      </div>

      {formError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={submitting}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          Cancel
        </button>
        <button type="submit" disabled={submitting} data-testid="edit-product-submit"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
          {submitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
          {submitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
