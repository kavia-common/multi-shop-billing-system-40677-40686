"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * ToastProvider and useToast
 * Simple global toast system aligned to Ocean Professional theme.
 */

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
}

export interface ToastContextValue {
  toasts: Toast[];
  // PUBLIC_INTERFACE
  show: (t: Omit<Toast, "id"> & { id?: string }) => string;
  // PUBLIC_INTERFACE
  remove: (id: string) => void;
  // PUBLIC_INTERFACE
  clear: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_CLASS: Record<ToastVariant, string> = {
  default: "bg-white text-slate-900 ring-slate-200",
  success: "bg-amber-50 text-amber-900 ring-amber-200",
  error: "bg-red-50 text-red-900 ring-red-200",
  warning: "bg-yellow-50 text-yellow-900 ring-yellow-200",
  info: "bg-blue-50 text-blue-900 ring-blue-200",
};

const VARIANT_ICON: Record<ToastVariant, React.ReactNode> = {
  default: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 8v5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M12 3l9 16H3L12 3z" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 9v4" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 10v6" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="7" r="1" fill="currentColor" />
    </svg>
  ),
};

// PUBLIC_INTERFACE
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timerId = timers.current.get(id);
    if (timerId) {
      window.clearTimeout(timerId);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (t: Omit<Toast, "id"> & { id?: string }) => {
      const id = t.id ?? Math.random().toString(36).slice(2);
      const toast: Toast = {
        id,
        variant: t.variant ?? "default",
        duration: t.duration ?? 3500,
        title: t.title,
        description: t.description,
      };
      setToasts((prev) => [...prev, toast]);

      // schedule removal
      if (toast.duration && toast.duration > 0) {
        const timeoutId = window.setTimeout(() => remove(id), toast.duration);
        timers.current.set(id, timeoutId);
      }

      return id;
    },
    [remove]
  );

  const clear = useCallback(() => {
    timers.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timers.current.clear();
    setToasts([]);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, show, remove, clear }),
    [toasts, show, remove, clear]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// PUBLIC_INTERFACE
export function Toaster() {
  const { toasts, remove } = useToast();
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-4 sm:justify-end sm:px-6"
    >
      <ul className="flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const role =
            t.variant === "error" || t.variant === "warning" ? "alert" : "status";
          return (
            <li
              key={t.id}
              role={role}
              className={`pointer-events-auto rounded-xl p-3 shadow-lg ring-1 ${VARIANT_CLASS[t.variant ?? "default"]}`}
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-slate-700">{VARIANT_ICON[t.variant ?? "default"]}</span>
                <div className="min-w-0 flex-1">
                  {t.title ? (
                    <p className="text-sm font-semibold leading-5">{t.title}</p>
                  ) : null}
                  {t.description ? (
                    <p className="mt-0.5 text-xs leading-5 text-slate-700/90">
                      {t.description}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => remove(t.id)}
                  aria-label="Dismiss notification"
                  className="rounded-md p-1 text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
