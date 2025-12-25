"use client";

import React, { useEffect } from "react";
import { logger } from "@/lib/logger";

/**
 * PUBLIC_INTERFACE
 * ShopCustomersError
 * @description Error boundary for shop customers page.
 */
export default function ShopCustomersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Shop customers error:", error);
  }, [error]);

  return (
    <div className="p-6">
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
        <h2 className="font-semibold">Unable to load customers.</h2>
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
