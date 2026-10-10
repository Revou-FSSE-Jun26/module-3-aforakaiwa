/** Skeleton shown while the categories page is fetching. */
export default function Loading() {
  return (
    <section className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-2 h-5 w-32 animate-pulse rounded bg-gray-200" />
            <div className="mb-1 h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </section>
  );
}
