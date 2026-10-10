"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types";

interface SearchControlsProps {
  categories: Category[];
}

/**
 * Controlled search box + category dropdown. Both write their state into the
 * URL query string (?q=&category=), which is the single source of truth. The
 * server component on /products reads those params and returns the filtered
 * list, so the URL and the rendered results always stay in sync.
 */
export default function SearchControls({ categories }: SearchControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state seeded from the URL so the input is controlled and reflects
  // the current query (e.g. after a refresh or when sharing the link).
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const category = searchParams.get("category") ?? "";

  // Keep the input in sync if the URL changes elsewhere (e.g. back button).
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  /** Build a new query string from the current params plus overrides. */
  function buildUrl(overrides: Record<string, string>): string {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function pushUrl(overrides: Record<string, string>) {
    startTransition(() => {
      router.push(buildUrl(overrides));
    });
  }

  // Live search: debounce URL updates so we don't push on every keystroke.
  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (query === current) return;

    const id = setTimeout(() => {
      pushUrl({ q: query });
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products by name, description, or SKU..."
        aria-label="Search products"
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />

      <select
        value={category}
        onChange={(e) => pushUrl({ category: e.target.value })}
        aria-label="Filter by category"
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.category_id} value={String(c.category_id)}>
            {c.category_name}
          </option>
        ))}
      </select>

      {isPending && (
        <span className="self-center text-xs text-gray-400">Updating…</span>
      )}
    </div>
  );
}
