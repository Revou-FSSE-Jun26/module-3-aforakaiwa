"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

interface NavLink {
  href: string;
  label: string;
}

// Links everyone sees, regardless of auth state.
const publicLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
];

/**
 * Returns true when `href` is the active route.
 * - "/" must match exactly (otherwise it would match everything).
 * - Other routes also count as active on their sub-paths, e.g. "/products"
 *   stays highlighted while viewing "/products/5".
 */
function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Main navigation. A client component because it reads the current URL
 * (usePathname) to highlight the active link, and the auth/cart contexts to
 * decide which links to show:
 *   - public links: always
 *   - Cart (with an item-count badge) + Orders: only when signed in
 *   - Dashboard: only for admins
 * Until auth has hydrated we render just the public links to avoid a
 * hydration mismatch and link flicker.
 */
export default function Nav() {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const { itemCount } = useCart();

  const linkClass = (active: boolean) =>
    active
      ? "rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white"
      : "rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-light hover:text-brand";

  // Build the link list based on auth state (only after hydration).
  const links: NavLink[] = [...publicLinks];
  if (!isLoading && isAuthenticated) {
    links.push({ href: "/orders", label: "Orders" });
  }
  if (!isLoading && isAdmin) {
    links.push({ href: "/dashboard", label: "Dashboard" });
  }

  return (
    <nav className="flex items-center gap-1">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={linkClass(active)}
          >
            {link.label}
          </Link>
        );
      })}

      {/* Cart link with an item-count badge, shown only when signed in. */}
      {!isLoading && isAuthenticated && (
        <Link
          href="/cart"
          aria-current={isActive(pathname, "/cart") ? "page" : undefined}
          className={`relative ${linkClass(isActive(pathname, "/cart"))}`}
          data-testid="nav-cart"
        >
          Cart
          {itemCount > 0 && (
            <span
              className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-semibold text-white"
              data-testid="cart-badge"
            >
              {itemCount}
            </span>
          )}
        </Link>
      )}
    </nav>
  );
}
