import Link from "next/link";
import Nav from "./Nav";

/**
 * Top app bar: shows the RevoShop brand and the main navigation.
 * Rendered once in the root layout so it appears on every page.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand font-bold text-white">
            R
          </span>
          <span className="text-lg font-bold text-gray-900">RevoShop</span>
        </Link>
        <Nav />
      </div>
    </header>
  );
}
