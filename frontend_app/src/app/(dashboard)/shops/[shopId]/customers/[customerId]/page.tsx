import { CustomerDetailClient } from "./CustomerDetailClient";

// Static export compatibility for double-dynamic route
export const dynamic = "force-static";
export const dynamicParams = false;
export async function generateStaticParams(): Promise<
  Array<{ shopId: string; customerId: string }>
> {
  const shops = ["north-harbor", "central-plaza", "seaside"];
  const byShop: Record<string, string[]> = {
    "north-harbor": ["CUST-NH-1", "CUST-NH-2"],
    "central-plaza": ["CUST-CP-1", "CUST-CP-2"],
    seaside: ["CUST-SS-1", "CUST-SS-2"],
  };
  return shops.flatMap((shopId) =>
    (byShop[shopId] || []).map((customerId) => ({ shopId, customerId }))
  );
}

/**
 * PUBLIC_INTERFACE
 * ShopCustomerDetailPage
 * @description Customer detail page for a specific customer; renders a client component for fetching/mutations.
 */
export default async function ShopCustomerDetailPage({
  params,
}: {
  params: Promise<{ shopId: string; customerId: string }>;
}) {
  const { shopId, customerId } = await params;
  const shopIdDecoded = decodeURIComponent(shopId);
  const customerIdDecoded = decodeURIComponent(customerId);
  return <CustomerDetailClient shopId={shopIdDecoded} customerId={customerIdDecoded} />;
}
