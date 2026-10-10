"use client";

import { useEffect } from "react";

/**
 * Friendly error UI for the /products route. error.tsx must be a Client
 * Component; Next.js passes the thrown error plus a `reset()` function to
 * retry rendering the segment.
 */
export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log for debugging; in a real app this could go to an error service.
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <h2 className="text-lg font-semibold text-red-800">
        Couldn&apos;t load products
      </h2>
      <p className="mt-1 text-sm text-red-700">
        The product API didn&apos;t respond as expected. It may be waking up or
        temporarily unavailable.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}
