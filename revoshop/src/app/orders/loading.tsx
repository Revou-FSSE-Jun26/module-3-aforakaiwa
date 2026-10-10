/** Skeleton shown while the orders page is fetching. */
export default function Loading() {
  return (
    <section className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <div className="h-7 w-28 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="space-y-2">
              <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </section>
  );
}
