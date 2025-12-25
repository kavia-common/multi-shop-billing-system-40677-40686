/**
 * PUBLIC_INTERFACE
 * Home
 * @description Landing page placeholder for the dashboard content area.
 */
export default function Home() {
  return (
    <section className="card bg-white/90 p-6 sm:p-8">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome to Ocean Billing
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Use the sidebar to navigate across Dashboard, Shops, Invoices, Customers, and Payments.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
          <div className="text-sm font-medium text-slate-600">Shops</div>
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
