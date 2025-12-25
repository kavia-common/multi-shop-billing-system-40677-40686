// Static export compatibility for dynamic routes
export const dynamic = "force-static";
export const dynamicParams = false;
export async function generateStaticParams(): Promise<Array<{ shopId: string }>> {
  const shops = ["north-harbor", "central-plaza", "seaside"];
  return shops.map((shopId) => ({ shopId }));
}

/**
 * PUBLIC_INTERFACE
 * ShopCustomersPage
 * @description Customers list for a shop. Static stub that can be enhanced with client-side fetching.
 */
export default async function ShopCustomersPage({
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
          Customers — <span className="text-blue-700">{shopIdDecoded}</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600">Client-side data stub.</p>
      </header>
      <ul className="space-y-2">
        <li className="rounded-lg border border-slate-200/70 bg-white p-3 shadow-sm">
          Jane Doe — —
        </li>
        <li className="rounded-lg border border-slate-200/70 bg-white p-3 shadow-sm">
          John Smith — —
        </li>
      </ul>
    </section>
  );
}
