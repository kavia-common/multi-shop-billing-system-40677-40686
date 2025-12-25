import Link from "next/link";

/**
 * PUBLIC_INTERFACE
 * ShopsPage
 * @description Displays a stubbed list of shops. Client-side data fetching can be added inside the page or via
 * a dedicated client component while preserving static export compatibility.
 */
export default function ShopsPage() {
  // Example demo ids to allow clicking through the flow in dev; real data would be fetched client-side.
  const demoShops = [
    { id: "north-harbor", name: "North Harbor Store" },
    { id: "central-plaza", name: "Central Plaza Outlet" },
    { id: "seaside", name: "Seaside Kiosk" },
  ];

  return (
    <section className="card bg-white/90 p-6 sm:p-8">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Shops</h1>
        <p className="mt-1 text-sm text-slate-600">
          Select a shop to view invoices, customers, and payments.
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {demoShops.map((s) => (
          <li key={s.id} className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900">{s.name}</div>
                <div className="text-xs text-slate-500">ID: {s.id}</div>
              </div>
              <Link
                href={`/shops/${encodeURIComponent(s.id)}`}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label={`Open ${s.name}`}
              >
                Open
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
