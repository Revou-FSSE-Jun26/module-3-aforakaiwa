"use client";

// Admin "create product" form. Uses the admin's JWT from AuthContext (the
// admin is already signed in to reach the dashboard), validates against the
// backend constraints, and calls onCreated with the new product so the parent
// can refresh its table.

import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { createProduct } from "@/lib/api";
import type { Category, Product } from "@/types";

const NAME_MAX = 100;
const SKU_MAX = 11;

interface FieldErrors {
  product_name?: string;
  sku?: string;
  price?: string;
  stock_quantity?: string;
  category_id?: string;
}

interface CreateProductFormProps {
  categories: Category[];
  onCreated: (product: Product) => void;
}

export default function CreateProductForm({
  categories,
  onCreated,
}: CreateProductFormProps) {
  const { token } = useAuth();

  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState(
    categories[0] ? String(categories[0].category_id) : "",
  );
  const [description, setDescription] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setProductName("");
    setSku("");
    setPrice("");
    setStock("");
    setDescription("");
    setCategoryId(categories[0] ? String(categories[0].category_id) : "");
    setFieldErrors({});
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!productName.trim()) next.product_name = "Name is required.";
    else if (productName.trim().length > NAME_MAX)
      next.product_name = `Keep the name under ${NAME_MAX} characters.`;
    if (!sku.trim()) next.sku = "SKU is required.";
    else if (sku.trim().length > SKU_MAX)
      next.sku = `SKU must be ${SKU_MAX} characters or fewer.`;
    const priceNum = Number(price);
    if (price === "" || Number.isNaN(priceNum) || priceNum < 0)
      next.price = "Enter a price of 0 or more.";
    const stockNum = Number(stock);
    if (stock === "" || Number.isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum))
      next.stock_quantity = "Enter a whole number of 0 or more.";
    if (!categoryId) next.category_id = "Pick a category.";
    return next;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    setSuccess("");

    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!token) {
      setFormError("Your session has expired. Please sign in again.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createProduct(
        {
          category_id: Number(categoryId),
          product_name: productName.trim(),
          sku: sku.trim(),
          price: Number(price),
          stock_quantity: Number(stock),
          ...(description.trim() ? { description: description.trim() } : {}),
        },
        token,
      );
      if (res.status === "created") {
        setSuccess(`"${res.product.product_name}" created.`);
        onCreated(res.product);
        reset();
      } else if (res.status === "validation" || res.status === "conflict") {
        setFormError(res.message);
        toast.error(res.message);
      } else if (res.status === "unauthorized") {
        const msg = "Your session has expired. Please sign in again.";
        setFormError(msg);
        toast.error(msg);
      } else if (res.status === "forbidden") {
        setFormError(res.message);
        toast.error(res.message);
      } else {
        setFormError(res.message);
        toast.error(res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const baseField =
    "w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand/40";
  const fieldClass = (hasError: boolean) =>
    `${baseField} ${hasError ? "border-red-400" : "border-gray-300 focus:border-brand"}`;
  const labelClass = "mb-1 block text-sm font-medium text-gray-700";
  const err = (m?: string) => (m ? <p className="mt-1 text-xs text-red-600">{m}</p> : null);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-6"
      noValidate
    >
      <h2 className="text-lg font-semibold text-gray-900">New product</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="cp-name" className={labelClass}>Name</label>
          <input id="cp-name" type="text" maxLength={NAME_MAX} value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className={fieldClass(!!fieldErrors.product_name)} placeholder="e.g. Laptop Stand" />
          {err(fieldErrors.product_name)}
        </div>

        <div>
          <label htmlFor="cp-sku" className={labelClass}>SKU</label>
          <input id="cp-sku" type="text" maxLength={SKU_MAX} value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
            className={fieldClass(!!fieldErrors.sku)} placeholder="e.g. LS-001" />
          {err(fieldErrors.sku)}
        </div>

        <div>
          <label htmlFor="cp-cat" className={labelClass}>Category</label>
          {categories.length > 0 ? (
            <select id="cp-cat" value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={fieldClass(!!fieldErrors.category_id)}>
              <option value="" disabled>Select a category…</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
              ))}
            </select>
          ) : (
            <input id="cp-cat" type="number" min="1" value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={fieldClass(!!fieldErrors.category_id)} placeholder="Category ID" />
          )}
          {err(fieldErrors.category_id)}
        </div>

        <div>
          <label htmlFor="cp-price" className={labelClass}>Price</label>
          <input id="cp-price" type="number" min="0" step="0.01" value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={fieldClass(!!fieldErrors.price)} placeholder="0" />
          {err(fieldErrors.price)}
        </div>

        <div>
          <label htmlFor="cp-stock" className={labelClass}>Stock</label>
          <input id="cp-stock" type="number" min="0" step="1" value={stock}
            onChange={(e) => setStock(e.target.value)}
            className={fieldClass(!!fieldErrors.stock_quantity)} placeholder="0" />
          {err(fieldErrors.stock_quantity)}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="cp-desc" className={labelClass}>Description (optional)</label>
          <input id="cp-desc" type="text" value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={fieldClass(false)} placeholder="Short description" />
        </div>
      </div>

      {formError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={submitting} data-testid="create-product-submit"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
          {submitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
          {submitting ? "Saving…" : "Add product"}
        </button>
      </div>
    </form>
  );
}
