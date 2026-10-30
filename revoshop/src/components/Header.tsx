"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "./Nav";
import AuthNav from "./AuthNav";

/**
 * Top app bar: shows the RevoShop brand and the main navigation.
 * Rendered once in the root layout so it appears on every page.
 *
 * Mobile-first: below `md` the nav collapses behind an accessible hamburger
 * button that toggles a stacked panel. At `md` and up the full inline nav is
 * shown exactly as before, so the desktop layout (and the Playwright suite,
 * which runs at ~1280px) is unchanged.
 */
export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand font-bold text-white">
            R
          </span>
          <span className="text-lg font-bold text-gray-900">RevoShop</span>
        </Link>

        {/* Desktop inline nav (md and up) — unchanged from before. */}
        <div className="hidden items-center gap-4 md:flex">
          <Nav />
          <AuthNav />
        </div>

        {/* Mobile hamburger toggle (below md). */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 transition hover:bg-gray-50 md:hidden"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu panel (below md): stacked nav + auth area. */}
      {open && (
        <div
          id="mobile-menu"
          className="border-t border-gray-200 bg-white px-4 py-4 md:hidden"
          onClick={() => setOpen(false)}
        >
          <div className="flex flex-col gap-4">
            <Nav stacked />
            <AuthNav stacked />
          </div>
        </div>
      )}
    </header>
  );
}
