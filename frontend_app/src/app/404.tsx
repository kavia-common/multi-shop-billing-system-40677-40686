import React from "react";
import Link from "next/link";

/**
 * PUBLIC_INTERFACE
 * NotFoundPage
 * @description Global 404 page for the App Router. Provides a themed, accessible message
 * and a simple way to navigate back into the application.
 */
export default function NotFoundPage() {
  return (
    <main className="p-6">
      <section
        className="rounded-xl border border-slate-200/70 bg-white/90 p-6 shadow-sm"
        role="alert"
        aria-live="assertive"
      >
        <header>
          <h1 className="text-2xl font-semibold text-slate-900">404 — Page Not Found</h1>
          <p className="mt-1 text-sm text-slate-600">
            The page you’re looking for doesn’t exist or has been moved.
          </p>
        </header>
        <div className="mt-4">
          <Link
            href="/shops"
            className="inline-flex items-center rounded-xl bg-blue-600 px-3 py-1.5 text-sm text-white shadow hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Go to Shops"
          >
            Go to Shops
          </Link>
        </div>
      </section>
    </main>
  );
}
