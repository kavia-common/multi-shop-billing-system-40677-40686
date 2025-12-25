import { InvoiceDetailClient } from "./InvoiceDetailClient";

// Static export compatibility for double-dynamic route
export const dynamic = "force-static";
export const dynamicParams = false;
export async function generateStaticParams(): Promise<Array<{ shopId: string; invoiceId: string }>> {
  const shops = ["north-harbor", "central-plaza", "seaside"];
  const invoiceIds = ["INV-0001", "INV-0002"];
  return shops.flatMap((shopId) => invoiceIds.map((invoiceId) => ({ shopId, invoiceId })));
}

/**
 * PUBLIC_INTERFACE
 * ShopInvoiceDetailPage
 * @description Invoice detail page for a specific invoice; renders a client component for fetching/mutations.
 */
export default async function ShopInvoiceDetailPage({
  params,
}: {
  params: Promise<{ shopId: string; invoiceId: string }>;
}) {
  const { shopId, invoiceId } = await params;
  const shopIdDecoded = decodeURIComponent(shopId);
  const invoiceIdDecoded = decodeURIComponent(invoiceId);
  return <InvoiceDetailClient shopId={shopIdDecoded} invoiceId={invoiceIdDecoded} />;
}
