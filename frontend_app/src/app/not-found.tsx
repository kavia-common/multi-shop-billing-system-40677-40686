import React from "react";

/**
 * PUBLIC_INTERFACE
 * NotFound
 * @description 404 fallback page with theme-aligned surface and accessible alert semantics.
 */
export default function NotFound() {
  return (
    <main className="p-6">
      <section
        className="card bg-white/90 p-6 sm:p-8"
        role="alert"
        aria-live="assertive"
      >
        <header>
          <h1 className="text-2xl font-semibold text-slate-900">
            404 — Page Not Found
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            The page you’re looking for doesn’t exist.
          </p>
        </header>
      </section>
    </main>
  );
}
