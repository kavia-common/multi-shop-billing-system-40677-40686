import React from "react";

/**
 * PUBLIC_INTERFACE
 * ShopSegmentLayout
 * @description Layout for a specific shop segment. Declares static export segment config for [shopId]
 * so all nested routes (/customers, /payments, /invoices, etc.) are compatible with `output: "export"`.
 * Renders an optional contextual header and wraps child routes.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

// Provide build-time params for the [shopId] segment.
// You can return known shop IDs here to pre-render specific paths.
export async function generateStaticParams(): Promise<Array<{ shopId: string }>> {
  const shops = ["north-harbor", "central-plaza", "seaside"];
  return shops.map((shopId) => ({ shopId }));
}

export default async function ShopSegmentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;
  const shopIdDecoded = decodeURIComponent(shopId);

  return (
    <section className="px-4 pb-4 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 rounded-xl border border-blue-200/40 bg-blue-50/60 px-4 py-2 text-sm text-blue-800 shadow-sm">
          <span className="font-semibold">Shop Context:</span>
          <span className="ml-2">{shopIdDecoded}</span>
        </div>
        {children}
      </div>
    </section>
  );
}
