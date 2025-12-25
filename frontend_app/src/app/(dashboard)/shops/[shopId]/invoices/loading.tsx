/**
 * PUBLIC_INTERFACE
 * ShopInvoicesLoading
 * @description Suspense loading UI for shop invoices list.
 */
export default function ShopInvoicesLoading() {
  return (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-64 rounded bg-slate-200" />
        <div className="space-y-2">
          <div className="h-10 rounded-lg bg-slate-200" />
          <div className="h-10 rounded-lg bg-slate-200" />
          <div className="h-10 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
