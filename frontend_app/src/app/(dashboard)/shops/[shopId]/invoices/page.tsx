// Static export compatibility for dynamic routes
export const dynamic = "force-static";
export const dynamicParams = false;
export async function generateStaticParams(): Promise<Array<{ shopId: string }>> {
  const shops = ["north-harbor", "central-plaza", "seaside"];
  return shops.map((shopId) => ({ shopId }));
}

/**
 * PUBLIC_INTERFACE
 * ShopInvoicesPage
 * @description Invoices list for a shop. Intended for client-side data fetch; currently a static stub.
 */
export default async function ShopInvoicesPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;
  const shopIdDecoded = decodeURIComponent(shopId);
  return (
    <section className="card bg-white/90 p-6 sm:p-8">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Invoices — <span className="text-blue-700">{shopIdDecoded}</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          This list is a client-side data loading stub.
        </p>
      </header>
      <ul className="space-y-2">
        <li className="rounded-lg border border-slate-200/70 bg-white p-3 shadow-sm">
          INV-0001 — —
        </li>
        <li className="rounded-lg border border-slate-200/70 bg-white p-3 shadow-sm">
          INV-0002 — —
        </li>
      </ul>
    </section>
  );
}
