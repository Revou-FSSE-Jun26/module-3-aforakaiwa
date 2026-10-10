import type { ReactNode } from "react";

/**
 * Props for the reusable Card wrapper.
 * - children: the content inside the card (required)
 * - className: extra Tailwind classes to merge in (optional)
 * - as: which HTML element to render as (optional, defaults to "div")
 */
export interface CardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section" | "li";
}

/**
 * A generic surface used across the app (product cards, panels, etc.).
 * Keeps the white box / border / shadow styling in one place so it looks
 * consistent and is easy to reuse.
 */
export default function Card({
  children,
  className = "",
  as: Tag = "div",
}: CardProps) {
  return (
    <Tag
      className={`rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      {children}
    </Tag>
  );
}
