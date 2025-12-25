"use client";

import React from "react";
import Link from "next/link";

/**
 * PUBLIC_INTERFACE
 * TopNav
 * @description Sticky top navigation bar containing brand, search, and profile placeholder.
 * On small screens it displays a menu button to open the sidebar. Provides keyboard accessibility
 * via focus-visible styles and aria attributes.
 */
export default function TopNav({
  onOpenSidebar,
  isSidebarOpen,
}: {
  /** Callback to open the mobile sidebar. */
  onOpenSidebar: () => void;
  /** Indicates if the sidebar is currently open (for aria-expanded). */
  isSidebarOpen?: boolean;
}) {
  return (
    <>
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>

      <header
        className="fixed inset-x-0 top-0 z-50 h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60"
        role="banner"
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 lg:px-6">
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <button
              type="button"
              aria-label="Open sidebar"
              aria-controls="app-sidebar"
              aria-expanded={isSidebarOpen ? true : false}
              onClick={onOpenSidebar}
              className="inline-flex items-center justify-center rounded-lg border border-transparent bg-white p-2 text-slate-700 shadow hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Brand */}
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-lg px-2 py-1"
              aria-label="Ocean Billing Home"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow">
                OB
              </span>
              <span className="text-[15px] font-semibold text-slate-900 group-hover:text-blue-700">
                Ocean Billing
              </span>
            </Link>
          </div>

          {/* Search (hidden on small screens) */}
          <form
            className="hidden min-w-0 flex-1 items-center md:flex"
            role="search"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="topnav-search" className="sr-only">
              Search
            </label>
            <div className="relative w-full max-w-xl">
              <input
                id="topnav-search"
                type="search"
                inputMode="search"
                placeholder="Search shops, invoices, customers..."
                className="w-full rounded-xl border border-slate-200/70 bg-white/80 px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-500/40"
              />
              <div className="pointer-events-none absolute inset-y-0 right-3 hidden items-center gap-1 text-xs text-slate-400 sm:flex">
                <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 shadow-sm">
                  /
                </kbd>
                <span>to search</span>
              </div>
            </div>
          </form>

          {/* Profile placeholder */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden rounded-xl border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 md:inline-flex"
              aria-label="Create new"
            >
              New
            </button>
            <button
              type="button"
              aria-label="Account menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200 shadow hover:bg-blue-200/70 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="text-sm font-semibold">AB</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
