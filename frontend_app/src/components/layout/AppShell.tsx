"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import TopNav from "./TopNav";
import Sidebar from "./Sidebar";
import { ToastProvider } from "@/components/ui";

/**
 * PUBLIC_INTERFACE
 * AppShell
 * @description Root application shell that renders the top navigation, responsive/collapsible sidebar,
 * and the main content area. Ensures mobile responsiveness, keyboard accessibility (Escape to close
 * mobile sidebar, focus-visible rings), and applies Ocean Professional theme visual styles via Tailwind.
 */
export default function AppShell({
  children,
}: {
  /** React children content rendered in the main content area. */
  children: React.ReactNode;
}) {
  /** Tracks whether the mobile sidebar is open (for screens < lg). */
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);
  /** Tracks whether the desktop sidebar is collapsed (icon-only). */
  const [collapsedDesktop, setCollapsedDesktop] = useState(false);

  const pathname = usePathname();

  // Prevent body scroll when the mobile sidebar is open
  useEffect(() => {
    if (openMobileSidebar) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [openMobileSidebar]);

  // Compute main container padding-left dynamically for large screens only when we choose fixed sidebars
  // We are using a flex layout, so no explicit margin is required here. This is reserved for future tweaks.
  const containerClass = useMemo(() => {
    return "min-h-screen bg-gradient-to-br from-blue-500/10 to-gray-50 text-slate-900";
  }, []);

  return (
    <ToastProvider>
      <div className={containerClass}>
        {/* Top Navigation */}
        <TopNav
          onOpenSidebar={() => setOpenMobileSidebar(true)}
          isSidebarOpen={openMobileSidebar}
        />

        {/* Content area with a fixed header height compensation */}
        <div className="pt-16">
          <div className="relative flex">
            {/* Sidebar: mobile overlay + desktop inline */}
            <Sidebar
              id="app-sidebar"
              currentPath={pathname ?? "/"}
              collapsedDesktop={collapsedDesktop}
              openMobile={openMobileSidebar}
              onCloseMobile={() => setOpenMobileSidebar(false)}
              onToggleCollapse={() =>
                setCollapsedDesktop((prev) => !prev)
              }
            />

            {/* Main content */}
            <main
              id="main-content"
              role="main"
              className="flex-1 p-4 lg:p-6"
              tabIndex={-1}
              aria-label="Main content"
            >
              <div className="mx-auto max-w-7xl space-y-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
