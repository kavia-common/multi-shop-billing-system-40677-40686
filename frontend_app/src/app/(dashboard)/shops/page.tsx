"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Shop } from "@/types";
import { apiClient } from "@/lib/apiClient";
import { Breadcrumbs, Button, Card, CardContent, CardHeader, CardTitle, Table, useToast } from "@/components/ui";
import type { Column } from "@/components/ui/Table";
import { useShop } from "@/contexts/ShopContext";
import { createLogger } from "@/lib/logger";

/**
 * PUBLIC_INTERFACE
 * ShopsPage
 * @description Lists all shops using client-side data fetching via apiClient with mock fallback.
 * Includes breadcrumbs, skeletons, empty and error states, and toasts. Integrates ShopContext to allow
 * selecting an active shop (synced to URL/localStorage).
 */
export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedShopId, setSelectedShopId } = useShop();
  const { show } = useToast();
  const log = useMemo(() => createLogger("ShopsPage"), []);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    setError(null);
    const t0 = performance.now();
    log.debug("fetchShops: start");
    try {
      const data = await apiClient.shops.list();
      setShops(data);
      log.debug("fetchShops: success", { count: data.length, ms: Math.round(performance.now() - t0) });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load shops.";
      setError(msg);
      // Emit as error so it is visible regardless of log level (unless silent)
      log.error("fetchShops: error", e);
    } finally {
      setLoading(false);
      log.debug("fetchShops: finished", { ms: Math.round(performance.now() - t0) });
    }
  }, [log]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const onSetActive = useCallback(
    (id: string) => {
      setSelectedShopId(id);
      show({
        variant: "success",
        title: "Active shop updated",
        description: `Selected shop is now "${id}".`,
      });
    },
    [setSelectedShopId, show]
  );

  const onCopyId = useCallback(
    async (id: string) => {
      try {
        await navigator.clipboard.writeText(id);
        show({ variant: "success", title: "Copied", description: "Shop ID copied to clipboard." });
      } catch {
        show({ variant: "error", title: "Copy failed", description: "Could not copy to clipboard." });
      }
    },
    [show]
  );

  const columns: Column<Shop>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        cell: (s: Shop) => (
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">{s.name}</span>
            {selectedShopId === s.id ? (
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
                Active
              </span>
            ) : null}
          </div>
        ),
      },
      {
        key: "id",
        header: "ID",
        cell: (s: Shop) => (
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">
            {s.id}
          </code>
        ),
      },
      {
        key: "address",
        header: "Address",
        cell: (s: Shop) => s.address || <span className="text-slate-500">—</span>,
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        cell: (s: Shop) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopyId(s.id)}
              aria-label={`Copy ID for ${s.name}`}
            >
              Copy ID
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onSetActive(s.id)}
              aria-label={`Set ${s.name} as active shop`}
            >
              Set active
            </Button>
            <Link
              href={`/shops/${encodeURIComponent(s.id)}`}
              className="inline-flex items-center rounded-xl bg-blue-600 px-3 py-1.5 text-sm text-white shadow hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label={`Open ${s.name}`}
            >
              Open
            </Link>
          </div>
        ),
      },
    ],
    [onCopyId, onSetActive, selectedShopId]
  );

  if (loading) {
    // Local skeleton while client is fetching
    return (
      <section className="space-y-4">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Shops" }]} />
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Shops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-48 rounded bg-slate-200" />
              <div className="h-10 rounded bg-slate-100" />
              <div className="h-10 rounded bg-slate-100" />
              <div className="h-10 rounded bg-slate-100" />
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Shops" }]} />
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <h2 className="font-semibold">Unable to load shops</h2>
          <p className="mt-1 text-sm">{error}</p>
          <div className="mt-3">
            <Button variant="destructive" onClick={fetchShops}>
              Retry
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Shops" }]} />
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className="text-2xl">Shops</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Select a shop to view invoices, customers, and payments.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={fetchShops} aria-label="Refresh shops">
                Refresh
              </Button>
            </div>
          </div>

          <Table<Shop>
            columns={columns}
            data={shops}
            caption="List of shops"
            empty={{
              title: "No shops",
              description: "There are no shops to display right now.",
              action: (
                <Button variant="outline" onClick={fetchShops}>
                  Refresh
                </Button>
              ),
            }}
          />
        </CardContent>
      </Card>
    </section>
  );
}
