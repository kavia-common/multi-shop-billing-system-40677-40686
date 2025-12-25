/**
 * PUBLIC_INTERFACE
 * ShopPaymentsLoading
 * @description Suspense loading UI for shop payments.
 */
export default function ShopPaymentsLoading() {
  return (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-60 rounded bg-slate-200" />
        <div className="space-y-2">
          <div className="h-10 rounded-lg bg-slate-200" />
          <div className="h-10 rounded-lg bg-slate-200" />
          <div className="h-10 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
