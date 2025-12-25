"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { useShop } from "@/contexts/ShopContext";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Breadcrumbs,
  Table,
  Modal,
  useToast,
} from "@/components/ui";
import type { Column } from "@/components/ui/Table";
import type { Customer } from "@/types";
import { createLogger } from "@/lib/logger";

type CreateFormState = {
  id: string;
  name: string;
  email: string;
  phone: string;
  errors: Partial<Record<keyof Omit<CreateFormState, "errors">, string>>;
};

// PUBLIC_INTERFACE
export function CustomersClient({ shopId }: { shopId: string }) {
  const { selectedShopId, setSelectedShopId } = useShop();
  const { show } = useToast();
  const log = useMemo(() => createLogger("CustomersClient"), []);

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateFormState>({
    id: "",
    name: "",
    email: "",
    phone: "",
    errors: {},
  });

  // Sync context with route param
  useEffect(() => {
    if (selectedShopId !== shopId) {
      setSelectedShopId(shopId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const t0 = performance.now();
    log.debug("load: start", { shopId });
    try {
      const list = await apiClient.customers.listByShop(shopId);
      setCustomers(list);

      // Suggest next ID based on existing patterns like CUST-NH-3
      const prefix = shopId === "north-harbor" ? "CUST-NH" : shopId === "central-plaza" ? "CUST-CP" : "CUST-SS";
      const nums = list
        .map((c) => {
          const m = c.id.match(/(\d+)$/);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => Number.isFinite(n));
      const max = nums.reduce((a, b) => Math.max(a, b), 0);
      setForm((f) => ({ ...f, id: `${prefix}-${max + 1}` }));

      log.debug("load: success", { count: list.length, ms: Math.round(performance.now() - t0) });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load customers");
      log.error("load: error", e);
    } finally {
      setLoading(false);
      log.debug("load: finished", { ms: Math.round(performance.now() - t0) });
    }
  }, [shopId, log]);

  useEffect(() => {
    load();
  }, [load]);

  const crumbs = useMemo(
    () => [
      { label: "Dashboard", href: "/" },
      { label: "Shops", href: "/shops" },
      { label: shopId, href: `/shops/${encodeURIComponent(shopId)}` },
      { label: "Customers" },
    ],
    [shopId]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return customers;
    const q = query.toLowerCase();
    return customers.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    });
  }, [customers, query]);

  // Slice for client-side pagination
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageData = filtered.slice(start, end);

  useEffect(() => {
    // Reset to first page when query changes
    setPage(1);
  }, [query]);

  function validate(f: CreateFormState) {
    const errors: CreateFormState["errors"] = {};
    if (!f.id || f.id.trim().length === 0) errors.id = "ID is required";
    if (!f.name || f.name.trim().length === 0) errors.name = "Name is required";
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errors.email = "Email is invalid";
    // disallow duplicate id
    if (customers.some((c) => c.id === f.id)) errors.id = "Customer ID already exists";
    return errors;
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validate(form);
    setForm((p) => ({ ...p, errors: nextErrors }));
    if (Object.keys(nextErrors).length > 0) {
      show({ title: "Fix the highlighted fields", variant: "error" });
      return;
    }

    const optimistic: Customer = {
      id: form.id,
      shopId,
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCreating(true);
    setCustomers((prev) => [optimistic, ...prev]);
    try {
      const created = await apiClient.customers.create({
        id: form.id,
        shopId,
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
      });
      setCustomers((prev) => prev.map((c) => (c.id === optimistic.id ? created : c)));
      setCreateOpen(false);
      show({ title: "Customer created", variant: "success" });
      // reset create form except suggested id remains
      setForm((f) => ({ ...f, name: "", email: "", phone: "", errors: {} }));
    } catch (err: unknown) {
      // rollback
      setCustomers((prev) => prev.filter((c) => c.id !== optimistic.id));
      show({
        title: "Failed to create customer",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "error",
      });
    } finally {
      setCreating(false);
    }
  }

  const columns = useMemo<Column<Customer>[]>(() => {
    return [
      {
        key: "name",
        header: "Name",
        cell: (row: Customer) => (
          <Link
            href={`/shops/${encodeURIComponent(shopId)}/customers/${encodeURIComponent(row.id)}`}
            className="font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            {row.name}
          </Link>
        ),
      },
      {
        key: "email",
        header: "Email",
        cell: (row: Customer) => <span className="text-slate-700">{row.email || "-"}</span>,
      },
      {
        key: "phone",
        header: "Phone",
        cell: (row: Customer) => <span className="text-slate-700">{row.phone || "-"}</span>,
      },
      {
        key: "id",
        header: "ID",
        cell: (row: Customer) => <code className="text-xs text-slate-500">{row.id}</code>,
      },
      {
        key: "actions",
        header: "Actions",
        cell: (row: Customer) => (
          <div className="flex items-center gap-2">
            <Link
              href={`/shops/${encodeURIComponent(shopId)}/customers/${encodeURIComponent(row.id)}`}
              className="text-sm text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1"
            >
              View/Edit
            </Link>
          </div>
        ),
      },
    ];
  }, [shopId]);

  return (
    <div className="space-y-4">
      <Breadcrumbs items={crumbs} aria-label="Customers breadcrumb" />
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle as="h1" className="text-xl">
                Customers — <span className="text-blue-700">{shopId}</span>
              </CardTitle>
              <CardDescription>Search, paginate, and manage customers.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setCreateOpen(true)} variant="primary">
                New Customer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <Input
                type="search"
                inputMode="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customers..."
                aria-label="Search customers"
              />
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-10 rounded-xl bg-slate-200" />
              <div className="h-10 rounded-xl bg-slate-200" />
              <div className="h-10 rounded-xl bg-slate-200" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
              <p className="font-medium">Unable to load customers.</p>
              <p className="text-sm mt-1">{error}</p>
              <div className="mt-3">
                <Button variant="destructive" onClick={load}>
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <Table<Customer>
              columns={columns}
              data={pageData}
              empty={{
                title: "No customers",
                description: "Get started by creating your first customer.",
                action: (
                  <Button onClick={() => setCreateOpen(true)} variant="primary">
                    Create customer
                  </Button>
                ),
              }}
              pagination={{
                page,
                pageSize,
                total,
                onPageChange: (p) => setPage(p),
              }}
              caption="Customers list"
            />
          )}
        </CardContent>
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Customer"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={onCreate} loading={creating}>
              Create
            </Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={onCreate}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Customer ID"
              placeholder="CUST-NH-3"
              value={form.id}
              onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
              error={form.errors.id}
              required
            />
            <Input
              label="Name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              error={form.errors.name}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              error={form.errors.email}
            />
            <Input
              label="Phone"
              placeholder="555-1234"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
        </form>
        <div className="mt-3 text-xs text-slate-500">
          The mock API stores customers in-memory; refresh resets to seeds.
        </div>
      </Modal>
    </div>
  );
}
