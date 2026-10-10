/**
 * Simple site footer, rendered once in the root layout so it appears
 * on every page.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500">
        <p>
          &copy; {year} RevoShop &mdash; RevoU FSSE Module 3, Checkpoint 2.
        </p>
        <p className="mt-1">
          Built with Next.js, TypeScript, and Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}
