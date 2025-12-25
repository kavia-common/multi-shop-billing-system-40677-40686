import { CustomersClient } from "./CustomersClient";

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
 * @description Customers list for a shop. Renders a client component that provides search, pagination and create flow.
 */
export default async function ShopCustomersPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;
  const shopIdDecoded = decodeURIComponent(shopId);
  return <CustomersClient shopId={shopIdDecoded} />;
}
