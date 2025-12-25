/**
 * PUBLIC_INTERFACE
 * ShopsLoading
 * @description Suspense loading UI for the shops list.
 */
export default function ShopsLoading() {
  return (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-24 rounded bg-slate-200" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-20 rounded-xl bg-slate-200" />
          <div className="h-20 rounded-xl bg-slate-200" />
          <div className="h-20 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
