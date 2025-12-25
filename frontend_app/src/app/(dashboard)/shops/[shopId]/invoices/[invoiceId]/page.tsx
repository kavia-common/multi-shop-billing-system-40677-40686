// Static export compatibility for double-dynamic route
export const dynamic = "force-static";
export const dynamicParams = false;
export async function generateStaticParams(): Promise<Array<{ shopId: string; invoiceId: string }>> {
  const shops = ["north-harbor", "central-plaza", "seaside"];
  const invoiceIds = ["INV-0001", "INV-0002"];
  return shops.flatMap((shopId) =>
    invoiceIds.map((invoiceId) => ({ shopId, invoiceId }))
  );
}

/**
 * PUBLIC_INTERFACE
 * ShopInvoiceDetailPage
 * @description Invoice detail page stub for a specific invoice.
 */
export default async function ShopInvoiceDetailPage({
  params,
}: {
  params: Promise<{ shopId: string; invoiceId: string }>;
}) {
  const { shopId, invoiceId } = await params;
  const shopIdDecoded = decodeURIComponent(shopId);
  const invoiceIdDecoded = decodeURIComponent(invoiceId);
  return (
    <section className="card bg-white/90 p-6 sm:p-8">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Invoice {invoiceIdDecoded} —{" "}
          <span className="text-blue-700">{shopIdDecoded}</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600">Client-side data stub.</p>
      </header>
      <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="text-sm text-slate-600">Status</div>
        <div className="text-slate-900">—</div>
      </div>
    </section>
  );
}
