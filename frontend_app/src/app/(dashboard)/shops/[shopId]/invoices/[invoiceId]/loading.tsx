/**
 * PUBLIC_INTERFACE
 * ShopInvoiceDetailLoading
 * @description Suspense loading UI for invoice detail.
 */
export default function ShopInvoiceDetailLoading() {
  return (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-80 rounded bg-slate-200" />
        <div className="h-24 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}
