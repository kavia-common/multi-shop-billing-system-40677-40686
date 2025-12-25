import Link from "next/link";

// Ensure compatibility with `output: "export"` by forcing static and generating no paths by default.
// You can later implement generateStaticParams to pre-render known shops.
export const dynamic = "force-static";
export const dynamicParams = false;
export async function generateStaticParams(): Promise<Array<{ shopId: string }>> {
  const shops = ["north-harbor", "central-plaza", "seaside"];
  return shops.map((shopId) => ({ shopId }));
}

/**
 * PUBLIC_INTERFACE
 * ShopOverviewPage
 * @description Shop overview page. Displays navigation to child resources.
 */
export default async function ShopOverviewPage({
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
          Shop: <span className="text-blue-700">{shopIdDecoded}</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Choose a section to manage this shop.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href={`/shops/${encodeURIComponent(shopIdDecoded)}/invoices`}
          className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <div className="text-sm font-medium text-slate-600">Invoices</div>
          <div className="mt-1 text-slate-900">View and create invoices</div>
        </Link>
        <Link
          href={`/shops/${encodeURIComponent(shopIdDecoded)}/customers`}
          className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <div className="text-sm font-medium text-slate-600">Customers</div>
          <div className="mt-1 text-slate-900">Manage customer profiles</div>
        </Link>
        <Link
          href={`/shops/${encodeURIComponent(shopIdDecoded)}/payments`}
          className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <div className="text-sm font-medium text-slate-600">Payments</div>
          <div className="mt-1 text-slate-900">Track incoming payments</div>
        </Link>
      </div>
    </section>
  );
}
