"use client";

import { useEffect } from "react";
import Link from "next/link";

/** Friendly error UI for a single product detail page. */
export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <h2 className="text-lg font-semibold text-red-800">
        Couldn&apos;t load this product
      </h2>
      <p className="mt-1 text-sm text-red-700">
        Something went wrong while fetching the product details.
      </p>
      <div className="mt-4 flex justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try again
        </button>
        <Link
          href="/products"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Back to products
        </Link>
      </div>
    </div>
  );
}
