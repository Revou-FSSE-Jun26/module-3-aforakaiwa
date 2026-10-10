"use client";

import { useState } from "react";
import type { Product } from "@/types";

interface AddProductFormProps {
  /** Called with a fully-formed Product when the form validates and submits. */
  onAdd: (product: Product) => void;
}

interface FormErrors {
  product_name?: string;
  price?: string;
  stock_quantity?: string;
}

/**
 * Controlled form to add a new product to the list. Validates client-side
 * and only calls onAdd with a valid, typed Product.
 */
export default function AddProductForm({ onAdd }: AddProductFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!name.trim()) {
      next.product_name = "Name is required.";
    }
    const priceNum = Number(price);
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      next.price = "Enter a price greater than 0.";
    }
    const stockNum = Number(stock);
    if (stock === "" || Number.isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      next.stock_quantity = "Enter a stock count of 0 or more.";
    }
    return next;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // prevent default form submission
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Build a typed Product. Negative id marks it as locally-added.
    const newProduct: Product = {
      product_id: -Date.now(),
      category_id: 0,
      product_name: name.trim(),
      sku: `LOCAL-${Date.now()}`,
      description: "Locally added product.",
      price: Number(price),
      stock_quantity: Number(stock),
      is_active: true,
      created_at: new Date().toISOString(),
      deleted_at: null,
    };

    onAdd(newProduct);

    // Reset the form.
    setName("");
    setPrice("");
    setStock("");
    setErrors({});
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <h3 className="font-semibold text-gray-900">Add a product</h3>

      <div>
        <label htmlFor="p-name" className="mb-1 block text-sm text-gray-700">
          Name
        </label>
        <input
          id="p-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          aria-invalid={!!errors.product_name}
        />
        {errors.product_name && (
          <p className="mt-1 text-xs text-red-600">{errors.product_name}</p>
        )}
      </div>

      <div>
        <label htmlFor="p-price" className="mb-1 block text-sm text-gray-700">
          Price (IDR)
        </label>
        <input
          id="p-price"
          type="number"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={inputClass}
          aria-invalid={!!errors.price}
        />
        {errors.price && (
          <p className="mt-1 text-xs text-red-600">{errors.price}</p>
        )}
      </div>

      <div>
        <label htmlFor="p-stock" className="mb-1 block text-sm text-gray-700">
          Stock quantity
        </label>
        <input
          id="p-stock"
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className={inputClass}
          aria-invalid={!!errors.stock_quantity}
        />
        {errors.stock_quantity && (
          <p className="mt-1 text-xs text-red-600">{errors.stock_quantity}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        Add product
      </button>
    </form>
  );
}
