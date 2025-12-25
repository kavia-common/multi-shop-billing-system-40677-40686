"use client";

import React, { useEffect, useMemo, useRef } from "react";
import Link from "next/link";

type SidebarProps = {
  /** Unique id for aria-controls */
  id?: string;
  /** Current path from the router to apply active link style */
  currentPath: string;
  /** Collapsed state for desktop (icon-only) */
  collapsedDesktop: boolean;
  /** Whether the mobile sidebar is open */
  openMobile: boolean;
  /** Callback to close the mobile sidebar */
  onCloseMobile: () => void;
  /** Toggle collapse for desktop */
  onToggleCollapse: () => void;
};

/**
 * PUBLIC_INTERFACE
 * Sidebar
 * @description Responsive sidebar that is collapsible on desktop and presented as an overlay drawer on mobile.
 * Provides semantic navigation, Escape-to-close on mobile, and robust focus styles.
 */
export default function Sidebar({
  id = "app-sidebar",
  currentPath,
  collapsedDesktop,
  openMobile,
  onCloseMobile,
  onToggleCollapse,
}: SidebarProps) {
  // Close on Escape when mobile is open
  useEffect(() => {
    if (!openMobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseMobile();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openMobile, onCloseMobile]);

  // Autofocus the first link when mobile drawer opens
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (openMobile && firstLinkRef.current) {
      firstLinkRef.current.focus();
    }
  }, [openMobile]);

  const items = useMemo(
    () => [
      { name: "Dashboard", href: "/dashboard", icon: IconHome },
      { name: "Shops", href: "/shops", icon: IconStore },
      { name: "Invoices", href: "/invoices", icon: IconInvoice },
      { name: "Customers", href: "/customers", icon: IconUsers },
      { name: "Payments", href: "/payments", icon: IconCreditCard },
    ],
    []
  );

  const NavList = ({
    collapsed,
    forMobile = false,
  }: {
    collapsed: boolean;
    forMobile?: boolean;
  }) => (
    <nav
      aria-label="Primary"
      className="mt-2 flex-1 overflow-y-auto"
    >
      <ul className="space-y-1 px-2">
        {items.map((item, idx) => {
          const active = currentPath === item.href;
          const Icon = item.icon;
          const base =
            "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition";
          const state = active
            ? "bg-blue-100/70 text-blue-800 ring-1 ring-inset ring-blue-200"
            : "text-slate-700 hover:bg-blue-50 hover:text-blue-800";
          const labelClass = collapsed
            ? "sr-only"
            : "block";

          return (
            <li key={item.href}>
              <Link
                ref={idx === 0 && forMobile ? firstLinkRef : undefined}
                href={item.href}
                className={`${base} ${state}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={`h-5 w-5 flex-none ${
                    active ? "text-blue-700" : "text-slate-500 group-hover:text-blue-700"
                  }`}
                />
                <span className={labelClass}>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Mobile overlay drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          openMobile ? "" : "pointer-events-none"
        }`}
        aria-hidden={openMobile ? false : true}
      >
        {/* overlay */}
        <div
          className={`absolute inset-0 bg-slate-900/40 transition-opacity ${
            openMobile ? "opacity-100" : "opacity-0"
          }`}
          onClick={onCloseMobile}
        />
        {/* drawer */}
        <aside
          id={id}
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col border-r border-slate-200/70 bg-white p-3 shadow-xl transition-transform duration-300 will-change-transform ${
            openMobile ? "translate-x-0" : "-translate-x-full"
          }`}
          role="navigation"
          aria-label="Mobile sidebar"
        >
          <div className="flex items-center justify-between gap-3 px-1 py-1">
            <div className="inline-flex items-center gap-2 px-1">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow">
                OB
              </span>
              <span className="text-[15px] font-semibold text-slate-900">
                Ocean Billing
              </span>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Close sidebar"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>
          <NavList collapsed={false} forMobile />
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside
        id={id}
        className={`sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 border-r border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 lg:block ${
          collapsedDesktop ? "w-20" : "w-64"
        }`}
        role="navigation"
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col p-3">
          {/* Brand collapsed indicator */}
          <div className="px-1 py-1">
            <div className="inline-flex items-center gap-2 rounded-lg px-1">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow">
                OB
              </span>
              <span
                className={`${collapsedDesktop ? "sr-only" : "text-[15px] font-semibold text-slate-900"}`}
              >
                Ocean Billing
              </span>
            </div>
          </div>

          <NavList collapsed={collapsedDesktop} />

          {/* Collapse control */}
          <div className="mt-auto border-t border-slate-200/70 pt-3">
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-pressed={collapsedDesktop}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {collapsedDesktop ? (
                <>
                  <IconSidebarExpand className="h-5 w-5 text-slate-600 group-hover:text-blue-700" />
                  <span className="sr-only">Expand sidebar</span>
                </>
              ) : (
                <>
                  <IconSidebarCollapse className="h-5 w-5 text-slate-600 group-hover:text-blue-700" />
                  <span>Collapse sidebar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

/* Inline icons (no external dependencies) */
function IconHome({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function IconStore({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M3 10h18l-1.6-5.6A2 2 0 0 0 17.48 3H6.52A2 2 0 0 0 4.6 4.4L3 10Z" />
      <path d="M4 10v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M8 14h8" />
    </svg>
  );
}

function IconInvoice({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M7 3h8l4 4v14H7z" />
      <path d="M15 3v5h5" />
      <path d="M10 13h6M10 17h6M10 9h2" />
    </svg>
  );
}

function IconUsers({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconCreditCard({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </svg>
  );
}

function IconX({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconSidebarCollapse({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M4 4h16v16H4z" />
      <path d="M14 7v10M10 12l-2 2 2 2" />
    </svg>
  );
}

function IconSidebarExpand({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M4 4h16v16H4z" />
      <path d="M10 7v10M14 12l2 2-2 2" />
    </svg>
  );
}
