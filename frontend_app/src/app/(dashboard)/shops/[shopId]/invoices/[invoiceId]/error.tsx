"use client";

import React, { useEffect } from "react";

/**
 * PUBLIC_INTERFACE
 * ShopInvoiceDetailError
 * @description Error boundary for invoice detail page.
 */
export default function ShopInvoiceDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Invoice detail error:", error);
  }, [error]);

  return (
    <div className="p-6">
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
        <h2 className="font-semibold">Unable to load invoice.</h2>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-white shadow hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
