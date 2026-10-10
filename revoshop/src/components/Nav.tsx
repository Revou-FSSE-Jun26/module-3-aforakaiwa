"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
}

const links: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/orders", label: "Orders" },
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
 * with usePathname() to highlight the active link.
 */
export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white"
                : "rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-light hover:text-brand"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
