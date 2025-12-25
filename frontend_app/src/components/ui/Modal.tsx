"use client";

import React, { useEffect, useRef } from "react";

/**
 * PUBLIC_INTERFACE
 * Modal
 * Accessible modal dialog with overlay, Escape/overlay click to dismiss, and focus management.
 */

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** id for aria-labelledby assignment; generated if not supplied */
  titleId?: string;
  /** Optional footer actions */
  footer?: React.ReactNode;
}

// PUBLIC_INTERFACE
export function Modal({ open, onClose, title, children, titleId, footer }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const internalTitleId = titleId || "modal-title";

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
      onMouseDown={onBackdrop}
      aria-hidden={false}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={internalTitleId}
        tabIndex={-1}
        className="w-full max-w-lg rounded-xl bg-white shadow-2xl ring-1 ring-slate-200"
      >
        <div className="px-4 py-3 border-b border-slate-200/70">
          <h2 id={internalTitleId} className="text-base font-semibold text-slate-900">
            {title}
          </h2>
        </div>
        <div className="px-4 py-4">{children}</div>
        {footer ? <div className="px-4 py-3 border-t border-slate-200/70">{footer}</div> : null}
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Drawer
 * A slide-in panel (right by default) with dialog semantics.
 */
export interface DrawerProps extends Omit<ModalProps, "footer"> {
  side?: "right" | "left" | "bottom" | "top";
  widthClassName?: string; // e.g. w-80
}

// PUBLIC_INTERFACE
export function Drawer({
  open,
  onClose,
  title,
  titleId,
  children,
  side = "right",
  widthClassName = "w-80",
}: DrawerProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const internalTitleId = titleId || "drawer-title";

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const sideClass =
    side === "right"
      ? "right-0 top-0 h-full"
      : side === "left"
      ? "left-0 top-0 h-full"
      : side === "bottom"
      ? "bottom-0 left-0 w-full"
      : "top-0 left-0 w-full";

  const translateClass =
    side === "right"
      ? "translate-x-0"
      : side === "left"
      ? "translate-x-0"
      : side === "bottom"
      ? "translate-y-0"
      : "-translate-y-0";

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[60] bg-slate-900/40"
      onMouseDown={onBackdrop}
      aria-hidden={false}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={internalTitleId}
        tabIndex={-1}
        className={`fixed ${sideClass} bg-white shadow-2xl ring-1 ring-slate-200 focus:outline-none ${widthClassName} transition-transform duration-300 ${translateClass}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/70">
          <h2 id={internalTitleId} className="text-base font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
