import { PaymentsClient } from "./PaymentsClient";

// Static export compatibility for dynamic routes
export const dynamic = "force-static";
export const dynamicParams = false;
export async function generateStaticParams(): Promise<Array<{ shopId: string }>> {
  const shops = ["north-harbor", "central-plaza", "seaside"];
  return shops.map((shopId) => ({ shopId }));
}

/**
 * PUBLIC_INTERFACE
 * ShopPaymentsPage
 * @description Payments list for a shop. Renders a client component that provides search, filtering, pagination and create/delete flows.
 */
export default async function ShopPaymentsPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;
  const shopIdDecoded = decodeURIComponent(shopId);
  return <PaymentsClient shopId={shopIdDecoded} />;
}
