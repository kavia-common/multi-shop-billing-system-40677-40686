import { InvoicesClient } from "./InvoicesClient";

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
 * @description Invoices list for a shop. This page renders a client component to fetch data on the client side.
 */
export default async function ShopInvoicesPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;
  const shopIdDecoded = decodeURIComponent(shopId);
  return <InvoicesClient shopId={shopIdDecoded} />;
}
