import Link from "next/link";

/**
 * Site navigation links. For now these are plain links; in Step 4 this
 * becomes a client component that highlights the active route with
 * usePathname().
 */
const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/orders", label: "Orders" },
];

export default function Nav() {
  return (
    <nav className="flex items-center gap-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-light hover:text-brand"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
