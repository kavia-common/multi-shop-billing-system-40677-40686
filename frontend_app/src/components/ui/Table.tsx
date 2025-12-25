"use client";

import React from "react";
import { Button } from "./Button";

/**
 * PUBLIC_INTERFACE
 * Table
 * A simple table component with empty state and pagination.
 */

export interface Column<T> {
  key: keyof T | string;
  header: React.ReactNode;
  /** custom cell renderer */
  cell?: (row: T, rowIndex: number) => React.ReactNode;
  className?: string;
}

export interface Pagination {
  page: number; // 1-based
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey?: (row: T, index: number) => React.Key;
  empty?: EmptyStateProps;
  pagination?: Pagination;
  caption?: string;
}

function IconChevron({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// PUBLIC_INTERFACE
export function Table<T>({
  columns,
  data,
  rowKey,
  empty,
  pagination,
  caption,
}: TableProps<T>) {
  const start = pagination ? (pagination.page - 1) * pagination.pageSize : 0;
  const end = pagination ? Math.min(start + pagination.pageSize, pagination.total) : data.length;

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100">
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
            <path d="M3 5h18M3 10h18M3 15h18M3 20h18" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <h3 className="mt-3 text-base font-semibold text-slate-900">
          {empty?.title || "No records"}
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          {empty?.description || "There are no items to display right now."}
        </p>
        {empty?.action ? <div className="mt-4">{empty.action}</div> : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={`h-${idx}`}
                  scope="col"
                  className={`px-4 py-3 font-medium ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-900">
            {data.map((row, rIdx) => (
              <tr key={rowKey ? rowKey(row, rIdx) : rIdx}>
                {columns.map((col, cIdx) => {
                  const content =
                    col.cell?.(row, rIdx) ??
                    // @ts-expect-error index access allowed at runtime
                    (row[col.key] as React.ReactNode);
                  return (
                    <td key={`c-${cIdx}`} className={`px-4 py-3 ${col.className || ""}`}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination ? (
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-3 py-2">
          <div className="text-xs text-slate-600">
            Showing <span className="font-medium">{start + 1}</span> to{" "}
            <span className="font-medium">{end}</span> of{" "}
            <span className="font-medium">{pagination.total}</span> results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              aria-label="Previous page"
            >
              <IconChevron className="h-4 w-4 rotate-180" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                pagination.onPageChange(
                  Math.ceil(pagination.total / pagination.pageSize) > pagination.page
                    ? pagination.page + 1
                    : pagination.page
                )
              }
              disabled={
                pagination.page >= Math.ceil(pagination.total / pagination.pageSize)
              }
              aria-label="Next page"
            >
              Next
              <IconChevron className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
