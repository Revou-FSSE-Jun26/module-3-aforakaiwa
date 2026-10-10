/** Skeleton shown while a product detail page is fetching. */
export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-3 h-7 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="mb-6 h-4 w-24 animate-pulse rounded bg-gray-100" />
        <div className="mb-2 h-4 w-full animate-pulse rounded bg-gray-100" />
        <div className="mb-6 h-4 w-5/6 animate-pulse rounded bg-gray-100" />
        <div className="h-9 w-40 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}
