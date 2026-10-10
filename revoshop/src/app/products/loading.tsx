/**
 * Shown automatically by Next.js while the Products server component is
 * fetching. A simple skeleton grid that mirrors the real layout.
 */
export default function Loading() {
  return (
    <section>
      <div className="mb-4 h-4 w-40 animate-pulse rounded bg-gray-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 h-5 w-20 animate-pulse rounded-full bg-gray-200" />
            <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="mb-1 h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="mb-3 h-4 w-2/3 animate-pulse rounded bg-gray-100" />
            <div className="h-6 w-28 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 h-9 w-full animate-pulse rounded-lg bg-gray-100" />
          </div>
        ))}
      </div>
    </section>
  );
}
