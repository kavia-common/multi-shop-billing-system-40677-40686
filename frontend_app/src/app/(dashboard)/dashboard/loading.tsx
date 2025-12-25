/**
 * PUBLIC_INTERFACE
 * DashboardLoading
 * @description Suspense loading UI for the dashboard page.
 */
export default function DashboardLoading() {
  return (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-44 rounded bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-24 rounded-xl bg-slate-200" />
          <div className="h-24 rounded-xl bg-slate-200" />
          <div className="h-24 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
