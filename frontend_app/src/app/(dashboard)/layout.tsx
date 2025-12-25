import React from "react";

/**
 * PUBLIC_INTERFACE
 * DashboardLayout
 * @description Section-level layout applied to the "dashboard" route group. It renders a lightweight
 * workspace banner and provides consistent padding and container width inside the AppShell-provided
 * chrome (top nav + sidebar). This layout remains compatible with static export.
 */
export default function DashboardLayout({
  children,
}: {
  /** React subtree rendered for dashboard-related routes */
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 pt-2 pb-8 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 rounded-xl border border-blue-200/40 bg-gradient-to-r from-blue-50/80 to-white px-4 py-3 text-sm text-blue-800 shadow-sm">
          <strong className="font-semibold">Dashboard Workspace</strong>
          <span className="ml-2 text-blue-700/80">
            Manage shops, invoices, customers, and payments.
          </span>
        </div>
        {children}
      </div>
    </section>
  );
}
