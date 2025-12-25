"use client";

import React, { useEffect } from "react";
import { logger, createLogger } from "@/lib/logger";

/**
 * PUBLIC_INTERFACE
 * GlobalError
 * @description Global error boundary for the App Router root. Ensures a consistent error UI and provides a reset action.
 * This runs on the client as required by Next.js error boundaries.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log via centralized logger
    logger.error("Global error boundary triggered:", error);
  }, [error]);

  const log = createLogger("GlobalError");

  return (
    <main className="p-6">
      <section
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm"
        role="alert"
        aria-live="assertive"
      >
        <header>
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          {error?.message ? (
            <p className="mt-1 text-sm opacity-90">{error.message}</p>
          ) : null}
        </header>
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              log.debug("User clicked retry from global error");
              reset();
            }}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-white shadow hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label="Retry"
          >
            Retry
          </button>
        </div>
        {error?.digest ? (
          <p className="mt-3 text-xs opacity-70">Reference: {error.digest}</p>
        ) : null}
      </section>
    </main>
  );
}
