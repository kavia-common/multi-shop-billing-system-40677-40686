"use client";

import React from "react";
import Link from "next/link";

/**
 * PUBLIC_INTERFACE
 * Breadcrumbs
 * Accessible breadcrumbs using nav + ordered list semantics.
 */
export interface Crumb {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: Crumb[];
  "aria-label"?: string;
}

// PUBLIC_INTERFACE
export function Breadcrumbs({ items, "aria-label": ariaLabel = "Breadcrumb" }: BreadcrumbsProps) {
  const lastIndex = items.length - 1;
  return (
    <nav aria-label={ariaLabel}>
      <ol className="flex items-center gap-2 text-sm text-slate-600">
        {items.map((item, idx) => {
          const isLast = idx === lastIndex;
          return (
            <li key={`${item.label}-${idx}`} className="inline-flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded-md px-1 py-0.5 text-slate-700 hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="px-1 py-0.5 text-slate-900 font-medium" aria-current="page">
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <span aria-hidden="true" className="text-slate-400">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
