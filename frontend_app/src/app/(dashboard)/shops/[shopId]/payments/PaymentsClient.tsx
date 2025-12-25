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
import type { SelectOption } from "@/components/ui/Select";
import type { Customer, Invoice, InvoiceStatus, Payment, PaymentMethod } from "@/types";

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
function methodVariant(method: PaymentMethod) {
  switch (method) {
    case "cash":
      return "success" as const;
    case "card":
      return "primary" as const;
    case "bank":
      return "neutral" as const;
    default:
      return "neutral" as const;
  }
}

type CreateFormState = {
  id: string;
  invoiceId: string;
  amount: string;
  currency: string;
  method: PaymentMethod;
  date: string; // yyyy-mm-dd
  reference: string;
  invoiceStatus: InvoiceStatus; // editing related invoice status (optional)
  errors: Partial<Record<keyof Omit<CreateFormState, "errors">, string>>;
};

// PUBLIC_INTERFACE
export function PaymentsClient({ shopId }: { shopId: string }) {
  const { selectedShopId, setSelectedShopId } = useShop();
  const { show } = useToast();

  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | InvoiceStatus>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState<CreateFormState>({
    id: "",
    invoiceId: "",
    amount: "",
    currency: "USD",
    method: "card",
    date: toDateInputValue(new Date().toISOString()),
    reference: "",
    invoiceStatus: "sent",
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
    try {
      const [list, invs, custs] = await Promise.all([
        apiClient.payments.listByShop(shopId),
        apiClient.invoices.listByShop(shopId),
        apiClient.customers.listByShop(shopId),
      ]);
      // Sort by date desc by default for display
      list.sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        return db - da;
      });
      setPayments(list);
      setInvoices(invs);
      setCustomers(custs);

      // Suggest next payment id (e.g., PAY-0004)
      const maxNum = list
        .map((p) => {
          const m = p.id.match(/(\d+)$/);
          return m ? parseInt(m[1], 10) : 0;
        })
        .reduce((a, b) => Math.max(a, b), 0);
      const next = `PAY-${String(maxNum + 1).padStart(4, "0")}`;
      setForm((f) => ({ ...f, id: next }));

      // If invoices exist, set defaults tied to first invoice
      if (invs.length > 0) {
        const first = invs[0];
        setForm((f) => ({
          ...f,
          invoiceId: first.id,
          currency: first.currency,
          invoiceStatus: first.status,
        }));
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    load();
  }, [load]);

  // react to invoice selection to update currency/status defaults
  useEffect(() => {
    const inv = invoices.find((i) => i.id === form.invoiceId);
    if (inv) {
      setForm((f) => ({
        ...f,
        currency: inv.currency,
        invoiceStatus: inv.status,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.invoiceId]);

  const crumbs = useMemo(
    () => [
      { label: "Dashboard", href: "/" },
      { label: "Shops", href: "/shops" },
      { label: shopId, href: `/shops/${encodeURIComponent(shopId)}` },
      { label: "Payments" },
    ],
    [shopId]
  );

  const invoiceMap = useMemo(() => {
    const m = new Map<string, Invoice>();
    for (const inv of invoices) m.set(inv.id, inv);
    return m;
  }, [invoices]);

  const customerMap = useMemo(() => {
    const m = new Map<string, Customer>();
    for (const c of customers) m.set(c.id, c);
    return m;
  }, [customers]);

  // Filters: query (id/invoiceId/reference/method), invoice status, date range
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const startMs = startDate ? new Date(startDate).getTime() : null;
    const endMs = endDate ? new Date(endDate).getTime() : null;
    return payments.filter((p) => {
      if (q) {
        const inv = invoiceMap.get(p.invoiceId);
        const match =
          p.id.toLowerCase().includes(q) ||
          p.invoiceId.toLowerCase().includes(q) ||
          (p.reference || "").toLowerCase().includes(q) ||
          p.method.toLowerCase().includes(q) ||
          (inv?.id.toLowerCase().includes(q) ?? false) ||
          (customerMap.get(inv?.customerId || "")?.name.toLowerCase().includes(q) ?? false);
        if (!match) return false;
      }
      if (statusFilter) {
        const inv = invoiceMap.get(p.invoiceId);
        if (!inv || inv.status !== statusFilter) return false;
      }
      if (startMs != null || endMs != null) {
        const d = new Date(p.date).getTime();
        if (startMs != null && d < startMs) return false;
        if (endMs != null && d > endMs + 24 * 3600 * 1000 - 1) return false; // inclusive end
      }
      return true;
    });
  }, [payments, query, statusFilter, startDate, endDate, invoiceMap, customerMap]);

  // Slice for client-side pagination
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageData = filtered.slice(start, end);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, startDate, endDate]);

  // Options for the filter select (includes "All statuses")
  const statusFilterOptions: SelectOption[] = useMemo(
    () => [
      { label: "All statuses", value: "" },
      { label: "Draft", value: "draft" },
      { label: "Sent", value: "sent" },
      { label: "Paid", value: "paid" },
      { label: "Void", value: "void" },
    ],
    []
  );

  // Options for invoice status fields (no "All statuses")
  const invoiceStatusOptions: SelectOption[] = useMemo(
    () => [
      { label: "Draft", value: "draft" },
      { label: "Sent", value: "sent" },
      { label: "Paid", value: "paid" },
      { label: "Void", value: "void" },
    ],
    []
  );

  const invoiceOptions = useMemo(
    () => [
      { label: "Select an invoice", value: "", disabled: true },
      ...invoices.map((i) => {
        const c = customerMap.get(i.customerId);
        return { label: `${i.id} — ${c?.name || i.customerId}`, value: i.id };
      }),
    ],
    [invoices, customerMap]
  );

  const methodOptions: SelectOption[] = useMemo(
    () => [
      { label: "Card", value: "card" },
      { label: "Cash", value: "cash" },
      { label: "Bank", value: "bank" },
      { label: "Other", value: "other" },
    ],
    []
  );

  const currencyOptions: SelectOption[] = useMemo(
    () => [
      { label: "USD", value: "USD" },
      { label: "EUR", value: "EUR" },
      { label: "GBP", value: "GBP" },
    ],
    []
  );

  function validate(f: CreateFormState) {
    const errors: CreateFormState["errors"] = {};
    if (!f.id || f.id.trim().length === 0) errors.id = "Payment ID is required";
    if (payments.some((p) => p.id === f.id)) errors.id = "Payment ID already exists";
    if (!f.invoiceId) errors.invoiceId = "Invoice is required";
    const amt = parseFloat(f.amount);
    if (!(amt > 0)) errors.amount = "Amount must be greater than 0";
    if (!f.method) errors.method = "Method is required";
    if (!f.date) errors.date = "Date is required";
    if (!f.currency) errors.currency = "Currency is required";
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

    const optimistic: Payment = {
      id: form.id,
      shopId,
      invoiceId: form.invoiceId,
      amount: Math.round(parseFloat(form.amount) * 100) / 100,
      currency: form.currency,
      date: fromDateInputValue(form.date),
      method: form.method,
      reference: form.reference || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCreating(true);
    setPayments((prev) => [optimistic, ...prev]);
    try {
      const created = await apiClient.payments.create({
        id: optimistic.id,
        shopId,
        invoiceId: optimistic.invoiceId,
        amount: optimistic.amount,
        currency: optimistic.currency,
        date: optimistic.date,
        method: optimistic.method,
        reference: optimistic.reference,
      });
      setPayments((prev) => prev.map((p) => (p.id === optimistic.id ? created : p)));

      // If invoice status changed, update invoice
      const inv = invoiceMap.get(form.invoiceId);
      if (inv && inv.status !== form.invoiceStatus) {
        const updated = await apiClient.invoices.update(inv.id, shopId, { status: form.invoiceStatus });
        setInvoices((prev) => prev.map((i) => (i.id === inv.id ? (updated as Invoice) : i)));
      }

      setCreateOpen(false);
      show({ title: "Payment created", variant: "success" });
      // Reset form but keep suggested next id
      const maxNum = [...payments, optimistic]
        .map((p) => {
          const m = p.id.match(/(\d+)$/);
          return m ? parseInt(m[1], 10) : 0;
        })
        .reduce((a, b) => Math.max(a, b), 0);
      const next = `PAY-${String(maxNum + 1).padStart(4, "0")}`;
      setForm((f) => ({
        ...f,
        id: next,
        amount: "",
        reference: "",
        errors: {},
      }));
    } catch (err: unknown) {
      // rollback
      setPayments((prev) => prev.filter((p) => p.id !== optimistic.id));
      show({
        title: "Failed to create payment",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "error",
      });
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(id: string) {
    setDeletingId(id);
    const prev = payments;
    setPayments((cur) => cur.filter((p) => p.id !== id));
    try {
      const ok = await apiClient.payments.remove(id);
      if (!ok) throw new Error("Delete failed");
      show({ title: "Payment deleted", variant: "success" });
    } catch (err: unknown) {
      // rollback
      setPayments(prev);
      show({
        title: "Failed to delete payment",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "error",
      });
    } finally {
      setDeletingId(null);
    }
  }

  const columns = useMemo<Column<Payment>[]>(() => {
    return [
      {
        key: "id",
        header: "Payment",
        cell: (row: Payment) => (
          <Link
            href={`/shops/${encodeURIComponent(shopId)}/payments/${encodeURIComponent(row.id)}`}
            className="font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            {row.id}
          </Link>
        ),
      },
      {
        key: "invoiceId",
        header: "Invoice",
        cell: (row: Payment) => (
          <Link
            href={`/shops/${encodeURIComponent(shopId)}/invoices/${encodeURIComponent(row.invoiceId)}`}
            className="text-blue-700 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {row.invoiceId}
          </Link>
        ),
      },
      {
        key: "customer",
        header: "Customer",
        cell: (row: Payment) => {
          const inv = invoiceMap.get(row.invoiceId);
          const name = inv ? customerMap.get(inv.customerId)?.name : undefined;
          return <span className="text-slate-800">{name || (inv?.customerId ?? "-")}</span>;
        },
      },
      {
        key: "method",
        header: "Method",
        cell: (row: Payment) => <Badge variant={methodVariant(row.method)}>{row.method}</Badge>,
      },
      {
        key: "amount",
        header: "Amount",
        cell: (row: Payment) => <span>{formatCurrency(row.amount, row.currency)}</span>,
      },
      {
        key: "date",
        header: "Date",
        cell: (row: Payment) => <span>{formatDate(row.date)}</span>,
      },
      {
        key: "status",
        header: "Invoice Status",
        cell: (row: Payment) => {
          const inv = invoiceMap.get(row.invoiceId);
          return inv ? <Badge variant={statusVariant(inv.status)}>{inv.status}</Badge> : <span>-</span>;
        },
      },
      {
        key: "actions",
        header: "Actions",
        cell: (row: Payment) => (
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              loading={deletingId === row.id}
              onClick={() => onDelete(row.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ];
  }, [shopId, invoiceMap, customerMap, deletingId, onDelete]);

  return (
    <div className="space-y-4">
      <Breadcrumbs items={crumbs} aria-label="Payments breadcrumb" />
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle as="h1" className="text-xl">
                Payments — <span className="text-blue-700">{shopId}</span>
              </CardTitle>
              <CardDescription>Search, filter, paginate, and manage payments.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setCreateOpen(true)} variant="primary">
                New Payment
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
            <Input
              type="search"
              inputMode="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search payments, invoice or customer…"
              aria-label="Search payments"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "" | InvoiceStatus)}
              options={statusFilterOptions}
              aria-label="Filter by invoice status"
            />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Start date"
              placeholder="Start date"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="End date"
              placeholder="End date"
            />
          </div>

          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-10 rounded-xl bg-slate-200" />
              <div className="h-10 rounded-xl bg-slate-200" />
              <div className="h-10 rounded-xl bg-slate-200" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
              <p className="font-medium">Unable to load payments.</p>
              <p className="text-sm mt-1">{error}</p>
              <div className="mt-3">
                <Button variant="destructive" onClick={load}>
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <Table<Payment>
              columns={columns}
              data={pageData}
              empty={{
                title: "No payments",
                description: "Create a payment to record customer remittances.",
                action: (
                  <Button onClick={() => setCreateOpen(true)} variant="primary">
                    Create payment
                  </Button>
                ),
              }}
              pagination={{
                page,
                pageSize,
                total,
                onPageChange: (p) => setPage(p),
              }}
              caption="Payments list"
              rowKey={(row) => row.id}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Payment"
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
              label="Payment ID"
              placeholder="PAY-0004"
              value={form.id}
              onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
              error={form.errors.id}
              required
            />
            <Select
              label="Invoice"
              value={form.invoiceId}
              onChange={(e) => setForm((f) => ({ ...f, invoiceId: e.target.value }))}
              options={invoiceOptions}
              error={form.errors.invoiceId}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="50.00"
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
              label="Method"
              value={form.method}
              onChange={(e) => setForm((f) => ({ ...f, method: e.target.value as PaymentMethod }))}
              options={methodOptions}
              error={form.errors.method}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              error={form.errors.date}
              required
            />
            <Input
              label="Reference"
              placeholder="AUTH123 or TRX-998"
              value={form.reference}
              onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
            />
            <Select
              label="Invoice Status"
              value={form.invoiceStatus}
              onChange={(e) =>
                setForm((f) => ({ ...f, invoiceStatus: e.target.value as InvoiceStatus }))
              }
              options={invoiceStatusOptions}
            />
          </div>
        </form>
        <div className="mt-3 text-xs text-slate-500">
          Payments are stored in-memory via the mock API; refreshing resets data to seeds.
        </div>
      </Modal>
    </div>
  );
}
