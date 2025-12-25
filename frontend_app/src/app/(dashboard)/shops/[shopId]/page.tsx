"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Shop } from "@/types";
import { apiClient } from "@/lib/apiClient";
import { Breadcrumbs, Button, Card, CardContent, CardHeader, CardTitle, useToast } from "@/components/ui";
import { useShop } from "@/contexts/ShopContext";

/**
 * PUBLIC_INTERFACE
 * ShopOverviewPage
 * @description Client-side shop overview. Fetches shop details in the browser (compatible with static export),
 * displays breadcrumbs, skeleton/error states, and provides navigation to invoices, customers, and payments.
 * Integrates ShopContext to sync the active shop to URL/localStorage and shows toasts for actions.
 */
export default function ShopOverviewPage() {
  const params = useParams<{ shopId: string }>();
  const shopIdParam = decodeURIComponent(params.shopId);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedShopId, setSelectedShopId } = useShop();
  const { show } = useToast();

  const fetchShop = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.shops.get(shopIdParam as string);
      if (!data) {
        setShop(null);
        setError("Shop not found.");
      } else {
        setShop(data as Shop);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load shop.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [shopIdParam]);

  useEffect(() => {
    // Ensure the active shop reflects the current route
    if (shopIdParam && shopIdParam !== selectedShopId) {
      setSelectedShopId(shopIdParam);
    }
  }, [shopIdParam, selectedShopId, setSelectedShopId]);

  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  const onCopyId = async () => {
    try {
      await navigator.clipboard.writeText(shopIdParam);
      show({ variant: "success", title: "Copied", description: "Shop ID copied to clipboard." });
    } catch {
      show({ variant: "error", title: "Copy failed", description: "Could not copy to clipboard." });
    }
  };

  const onSetActive = () => {
    setSelectedShopId(shopIdParam);
    show({
      variant: "success",
      title: "Active shop updated",
      description: `Selected shop is now "${shopIdParam}".`,
    });
  };

  const crumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Shops", href: "/shops" },
    { label: shop?.name || shopIdParam },
  ];

  if (loading) {
    return (
      <section className="space-y-4">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Shops", href: "/shops" }, { label: "Loading…" }]} />
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Shop</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-64 rounded bg-slate-200" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="h-20 rounded-xl bg-slate-200" />
                <div className="h-20 rounded-xl bg-slate-200" />
                <div className="h-20 rounded-xl bg-slate-200" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (error || !shop) {
    return (
      <section className="space-y-4">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Shops", href: "/shops" }, { label: shopIdParam }]} />
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <h2 className="font-semibold">Unable to load this shop</h2>
          <p className="mt-1 text-sm">{error || "Shop not found."}</p>
          <div className="mt-3 flex gap-2">
            <Button variant="destructive" onClick={fetchShop}>
              Retry
            </Button>
            <Link
              href="/shops"
              className="inline-flex items-center rounded-xl bg-blue-600 px-3 py-1.5 text-sm text-white shadow hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Back to Shops
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <Breadcrumbs items={crumbs} />
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className="text-2xl">
            {shop.name}{" "}
            {selectedShopId === shop.id ? (
              <span className="ml-2 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
                Active
              </span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600">
              ID:{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">
                {shop.id}
              </code>
              {shop.address ? <span className="ml-3 text-slate-500">• {shop.address}</span> : null}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onCopyId}>
                Copy ID
              </Button>
              <Button variant="secondary" onClick={onSetActive}>
                Set active
              </Button>
              <Button variant="outline" onClick={fetchShop}>
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href={`/shops/${encodeURIComponent(shop.id)}/invoices`}
              className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="text-sm font-medium text-slate-600">Invoices</div>
              <div className="mt-1 text-slate-900">View and create invoices</div>
            </Link>
            <Link
              href={`/shops/${encodeURIComponent(shop.id)}/customers`}
              className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="text-sm font-medium text-slate-600">Customers</div>
              <div className="mt-1 text-slate-900">Manage customer profiles</div>
            </Link>
            <Link
              href={`/shops/${encodeURIComponent(shop.id)}/payments`}
              className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="text-sm font-medium text-slate-600">Payments</div>
              <div className="mt-1 text-slate-900">Track incoming payments</div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
