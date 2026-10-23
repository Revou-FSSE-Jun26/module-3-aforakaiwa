"use client";

// Sub-navigation for the admin dashboard: Products, Categories, Orders.
// Highlights the active tab using the current pathname.

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Products" },
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/orders", label: "Orders" },
];

export default function DashboardTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2 border-b border-gray-200 pb-2">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              active
                ? "rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white"
                : "rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-brand-light hover:text-brand"
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
