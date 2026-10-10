import Link from "next/link";
import Card from "@/components/Card";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-brand px-6 py-12 text-white sm:px-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Welcome to RevoShop</h1>
        <p className="mt-3 max-w-xl text-brand-light">
          A storefront built with Next.js, TypeScript, and Tailwind CSS, powered
          by a live Flask API.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 font-semibold text-brand hover:bg-brand-light"
        >
          Browse products
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <h2 className="font-semibold text-gray-900">Products</h2>
          <p className="mt-1 text-sm text-gray-600">
            Live catalog with search and category filters.
          </p>
          <Link
            href="/products"
            className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
          >
            View products &rarr;
          </Link>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold text-gray-900">Categories</h2>
          <p className="mt-1 text-sm text-gray-600">
            Explore products grouped by category.
          </p>
          <Link
            href="/categories"
            className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
          >
            View categories &rarr;
          </Link>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold text-gray-900">Orders</h2>
          <p className="mt-1 text-sm text-gray-600">
            Review orders fetched from the API.
          </p>
          <Link
            href="/orders"
            className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
          >
            View orders &rarr;
          </Link>
        </Card>
      </section>
    </div>
  );
}
