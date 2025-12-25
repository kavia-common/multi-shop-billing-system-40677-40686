"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { useShop } from "@/contexts/ShopContext";
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Breadcrumbs,
  Table,
  Badge,
  Modal,
  useToast,
} from "@/components/ui";
import type { Column } from "@/components/ui/Table";
import type { Customer, Invoice, InvoiceItem, InvoiceStatus } from "@/types";

// Helpers
function formatCurrency(value: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}
function formatDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString();
}
function toDateInputValue(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}
function fromDateInputValue(date: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}
function statusVariant(status: InvoiceStatus | string) {
  switch (status) {
    case "paid":
      return "success" as const;
    case "sent":
      return "primary" as const;
    case "void":
      return "error" as const;
    case "draft":
    default:
      return "neutral" as const;
  }
}

type CreateFormState = {
  id: string;
  customerId: string;
  amount: string; // as text input
  currency: string;
  status: InvoiceStatus;
  issueDate: string; // yyyy-mm-dd
  dueDate: string; // yyyy-mm-dd
  errors: Partial<Record<keyof Omit<CreateFormState, "errors">, string>>;
};

// PUBLIC_INTERFACE
export function InvoicesClient({ shopId }: { shopId: string }) {
  const { selectedShopId, setSelectedShopId } = useShop();
  const { show } = useToast();

  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateFormState>({
    id: "",
    customerId: "",
    amount: "",
    currency: "USD",
    status: "draft",
    issueDate: toDateInputValue(new Date().toISOString()),
    dueDate: toDateInputValue(new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()),
    errors: {},
  });

  // Sync ShopContext with path param
  useEffect(() => {
    if (selectedShopId !== shopId) {
      setSelectedShopId(shopId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, custs] = await Promise.all([
        apiClient.invoices.listByShop(shopId),
        apiClient.customers.listByShop(shopId),
      ]);
      setInvoices(list);
      setCustomers(custs);

      // Suggest next invoice id (e.g., INV-0003)
      const maxNum = list
        .map((i) => {
          const m = i.id.match(/(\d+)$/);
          return m ? parseInt(m[1], 10) : 0;
        })
        .reduce((a, b) => Math.max(a, b), 0);
      const next = `INV-${String(maxNum + 1).padStart(4, "0")}`;
      setForm((f) => ({ ...f, id: next }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    load();
  }, [load]);

  const crumbs = useMemo(
    () => [
      { label: "Dashboard", href: "/" },
      { label: "Shops", href: "/shops" },
      { label: shopId, href: `/shops/${encodeURIComponent(shopId)}` },
      { label: "Invoices" },
    ],
    [shopId]
  );

  const customersOptions = useMemo(
    () => [
      { label: "Select a customer", value: "", disabled: true },
      ...customers.map((c) => ({ label: c.name, value: c.id })),
    ],
    [customers]
  );

  const statusOptions = useMemo(
    () => [
      { label: "Draft", value: "draft" },
      { label: "Sent", value: "sent" },
      { label: "Paid", value: "paid" },
      { label: "Void", value: "void" },
    ],
    []
  );

  const currencyOptions = useMemo(
    () => [
      { label: "USD", value: "USD" },
      { label: "EUR", value: "EUR" },
      { label: "GBP", value: "GBP" },
    ],
    []
  );

  function validateForm(f: CreateFormState) {
    const errors: CreateFormState["errors"] = {};
    if (!f.id || f.id.trim().length === 0) errors.id = "Invoice ID is required";
    if (!f.customerId) errors.customerId = "Customer is required";
    const amt = parseFloat(f.amount);
    if (!(amt > 0)) errors.amount = "Amount must be greater than 0";
    if (!f.currency) errors.currency = "Currency is required";
    if (!f.status) errors.status = "Status is required";
    if (!f.issueDate) errors.issueDate = "Issue date is required";
    if (!f.dueDate) errors.dueDate = "Due date is required";
    if (f.issueDate && f.dueDate && new Date(f.dueDate) < new Date(f.issueDate)) {
      errors.dueDate = "Due date must be on or after issue date";
    }
    // Check duplicate ID for this shop (client-side guard)
    if (invoices.some((i) => i.id === f.id)) {
      errors.id = "Invoice ID already exists";
    }
    return errors;
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validateForm(form);
    setForm((prev) => ({ ...prev, errors: nextErrors }));
    if (Object.keys(nextErrors).length > 0) {
      show({ title: "Fix the highlighted fields", variant: "error" });
      return;
    }

    const amount = parseFloat(form.amount);
    const subtotal = Math.round(amount * 100) / 100;
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const total = subtotal + tax;
    const items: InvoiceItem[] = [
      {
        sku: "CUSTOM-001",
        description: "Custom line item",
        qty: 1,
        unitPrice: subtotal,
        total: subtotal,
      },
    ];
    const optimistic: Invoice = {
      id: form.id,
      shopId,
      customerId: form.customerId,
      items,
      issueDate: fromDateInputValue(form.issueDate),
      dueDate: fromDateInputValue(form.dueDate),
      status: form.status,
      subtotal,
      tax,
      total,
      currency: form.currency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCreating(true);
    // Optimistic add
    setInvoices((prev) => [...prev, optimistic]);
    try {
      const created = await apiClient.invoices.create({
        id: form.id,
        shopId,
        customerId: form.customerId,
        items,
        currency: form.currency,
        status: form.status,
        issueDate: fromDateInputValue(form.issueDate),
        dueDate: fromDateInputValue(form.dueDate),
      });
      // Replace optimistic with real created
      setInvoices((prev) => prev.map((i) => (i.id === optimistic.id ? created : i)));
      setCreateOpen(false);
      show({ title: "Invoice created", variant: "success" });
      // Stay on list for static export compatibility
    } catch (err: unknown) {
      // Rollback optimistic
      setInvoices((prev) => prev.filter((i) => i.id !== optimistic.id));
      show({
        title: "Failed to create invoice",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "error",
      });
    } finally {
      setCreating(false);
    }
  }

  const tableColumns = useMemo<Column<Invoice>[]>(
    () => [
      {
        key: "id",
        header: "Invoice",
        cell: (row: Invoice) => (
          <Link
            href={`/shops/${encodeURIComponent(shopId)}/invoices/${encodeURIComponent(row.id)}`}
            className="font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            {row.id}
          </Link>
        ),
      },
      {
        key: "customerId",
        header: "Customer",
        cell: (row: Invoice) => {
          const c = customers.find((x) => x.id === row.customerId);
          return c ? c.name : row.customerId;
        },
      },
      {
        key: "status",
        header: "Status",
        cell: (row: Invoice) => (
          <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
        ),
      },
      {
        key: "total",
        header: "Total",
        cell: (row: Invoice) => <span>{formatCurrency(row.total, row.currency)}</span>,
      },
      {
        key: "dueDate",
        header: "Due",
        cell: (row: Invoice) => <span>{formatDate(row.dueDate)}</span>,
      },
      {
        key: "actions",
        header: "Actions",
        cell: (row: Invoice) => (
          <div className="flex items-center gap-2">
            <Link
              href={`/shops/${encodeURIComponent(shopId)}/invoices/${encodeURIComponent(row.id)}`}
              className="text-sm text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1"
            >
              View/Edit
            </Link>
          </div>
        ),
      },
    ],
    [customers, shopId]
  );

  return (
    <div className="space-y-4">
      <Breadcrumbs items={crumbs} aria-label="Invoices breadcrumb" />
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle as="h1" className="text-xl">
                Invoices — <span className="text-blue-700">{shopId}</span>
              </CardTitle>
              <CardDescription>Manage and create invoices for this shop.</CardDescription>
            </div>
            <div>
              <Button onClick={() => setCreateOpen(true)} variant="primary">
                New Invoice
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-10 rounded-xl bg-slate-200" />
              <div className="h-10 rounded-xl bg-slate-200" />
              <div className="h-10 rounded-xl bg-slate-200" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
              <p className="font-medium">Unable to load invoices.</p>
              <p className="text-sm mt-1">{error}</p>
              <div className="mt-3">
                <Button variant="destructive" onClick={load}>
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <Table<Invoice>
              columns={tableColumns}
              data={invoices}
              empty={{
                title: "No invoices",
                description: "Get started by creating your first invoice.",
                action: (
                  <Button onClick={() => setCreateOpen(true)} variant="primary">
                    Create invoice
                  </Button>
                ),
              }}
              caption="Invoices list"
            />
          )}
        </CardContent>
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Invoice"
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
              label="Invoice ID"
              placeholder="INV-0003"
              value={form.id}
              onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
              error={form.errors.id}
              required
            />
            <Select
              label="Customer"
              value={form.customerId}
              onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))}
              options={customersOptions}
              error={form.errors.customerId}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Amount (subtotal)"
              type="number"
              step="0.01"
              min="0"
              placeholder="100.00"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              error={form.errors.amount}
              required
            />
            <Select
              label="Currency"
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              options={currencyOptions}
              error={form.errors.currency}
              required
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as InvoiceStatus }))}
              options={statusOptions}
              error={form.errors.status}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Issue date"
              type="date"
              value={form.issueDate}
              onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))}
              error={form.errors.issueDate}
              required
            />
            <Input
              label="Due date"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              error={form.errors.dueDate}
              required
            />
          </div>
        </form>
        <div className="mt-3 text-xs text-slate-500">
          Amount is treated as subtotal. A 10% tax is applied automatically in the mock API.
        </div>
      </Modal>
    </div>
  );
}
