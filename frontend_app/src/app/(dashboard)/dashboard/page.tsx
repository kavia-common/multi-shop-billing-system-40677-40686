/**
 * PUBLIC_INTERFACE
 * DashboardPage
 * @description Top-level dashboard page stub. Uses static markup to remain compatible with static export.
 */
export default function DashboardPage() {
  return (
    <section className="card bg-white/90 p-6 sm:p-8">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Quick overview of your multi-shop billing activity.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
          <div className="text-sm font-medium text-slate-600">Revenue (30d)</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">—</div>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
          <div className="text-sm font-medium text-slate-600">Invoices</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">—</div>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
          <div className="text-sm font-medium text-slate-600">Customers</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">—</div>
        </div>
      </div>
    </section>
  );
}
