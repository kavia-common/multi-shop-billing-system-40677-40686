import { PaymentDetailClient } from "./PaymentDetailClient";

// Static export compatibility for double-dynamic route
export const dynamic = "force-static";
export const dynamicParams = false;
export async function generateStaticParams(): Promise<Array<{ shopId: string; paymentId: string }>> {
  // Align with seeds in src/mocks/seed.ts
  return [
    { shopId: "north-harbor", paymentId: "PAY-0001" },
    { shopId: "central-plaza", paymentId: "PAY-0002" },
    { shopId: "seaside", paymentId: "PAY-0003" },
  ];
}

/**
 * PUBLIC_INTERFACE
 * ShopPaymentDetailPage
 * @description Payment detail page for a specific payment; renders a client component for fetching/mutations.
 */
export default async function ShopPaymentDetailPage({
  params,
}: {
  params: Promise<{ shopId: string; paymentId: string }>;
}) {
  const { shopId, paymentId } = await params;
  const shopIdDecoded = decodeURIComponent(shopId);
  const paymentIdDecoded = decodeURIComponent(paymentId);
  return <PaymentDetailClient shopId={shopIdDecoded} paymentId={paymentIdDecoded} />;
}
