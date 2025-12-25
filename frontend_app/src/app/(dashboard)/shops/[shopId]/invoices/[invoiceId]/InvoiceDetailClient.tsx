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
  Badge,
  Tabs,
  useToast,
} from "@/components/ui";
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

type EditFormState = {
  customerId: string;
  amount: string; // subtotal as text input
  currency: string;
  status: InvoiceStatus;
  issueDate: string; // yyyy-mm-dd
  dueDate: string; // yyyy-mm-dd
  errors: Partial<Record<keyof Omit<EditFormState, "errors">, string>>;
};

// PUBLIC_INTERFACE
export function InvoiceDetailClient({
  shopId,
  invoiceId,
}: {
  shopId: string;
  invoiceId: string;
}) {
  const { selectedShopId, setSelectedShopId } = useShop();
  const { show } = useToast();

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditFormState>({
    customerId: "",
    amount: "",
    currency: "USD",
    status: "draft",
    issueDate: "",
    dueDate: "",
    errors: {},
  });

  // Sync ShopContext
  useEffect(() => {
    if (selectedShopId !== shopId) setSelectedShopId(shopId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inv, custs] = await Promise.all([
        apiClient.invoices.get(invoiceId, shopId) as Promise<Invoice | undefined>,
        apiClient.customers.listByShop(shopId),
      ]);
      if (!inv) {
        setError("Invoice not found");
        setInvoice(null);
      } else {
        setInvoice(inv);
        setForm({
          customerId: inv.customerId,
          amount: String(Math.round(inv.subtotal * 100) / 100),
          currency: inv.currency,
          status: inv.status,
          issueDate: toDateInputValue(inv.issueDate),
          dueDate: toDateInputValue(inv.dueDate),
          errors: {},
        });
      }
      setCustomers(custs);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  }, [invoiceId, shopId]);

  useEffect(() => {
    load();
  }, [load]);

  const crumbs = useMemo(
    () => [
      { label: "Dashboard", href: "/" },
      { label: "Shops", href: "/shops" },
      { label: shopId, href: `/shops/${encodeURIComponent(shopId)}` },
      { label: "Invoices", href: `/shops/${encodeURIComponent(shopId)}/invoices` },
      { label: invoiceId },
    ],
    [shopId, invoiceId]
  );

  const customersOptions = useMemo(
    () => [
      { label: "Select a customer", value: "", disabled: true },
      ...customers.map((c) => ({ label: c.name, value: c.id })),
    ],
    [customers]
  );
  const currencyOptions = useMemo(
    () => [
      { label: "USD", value: "USD" },
      { label: "EUR", value: "EUR" },
      { label: "GBP", value: "GBP" },
    ],
    []
  );

  function validate(f: EditFormState) {
    const errors: EditFormState["errors"] = {};
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
    return errors;
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!invoice) return;

    const nextErrors = validate(form);
    setForm((p) => ({ ...p, errors: nextErrors }));
    if (Object.keys(nextErrors).length > 0) {
      show({ title: "Fix the highlighted fields", variant: "error" });
      return;
    }

    const subtotal = Math.round(parseFloat(form.amount) * 100) / 100;
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
      ...invoice,
      customerId: form.customerId,
      status: form.status,
      currency: form.currency,
      items,
      subtotal,
      tax,
      total,
      issueDate: fromDateInputValue(form.issueDate),
      dueDate: fromDateInputValue(form.dueDate),
      updatedAt: new Date().toISOString(),
    };

    setSaving(true);
    // Optimistic update
    setInvoice(optimistic);
    try {
      const updateInput: Partial<Omit<Invoice, "id" | "shopId" | "createdAt" | "updatedAt">> = {
        customerId: optimistic.customerId,
        status: optimistic.status,
        currency: optimistic.currency,
        items: optimistic.items,
        subtotal: optimistic.subtotal,
        tax: optimistic.tax,
        total: optimistic.total,
        issueDate: optimistic.issueDate,
        dueDate: optimistic.dueDate,
      };
      const updated = await apiClient.invoices.update(invoice.id, shopId, updateInput);
      setInvoice(updated);
      show({ title: "Invoice updated", variant: "success" });
      // Remain on this page; static export safe
    } catch (err: unknown) {
      // Rollback by reloading
      await load();
      show({
        title: "Failed to update invoice",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={crumbs} aria-label="Invoice detail breadcrumb" />
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle as="h1" className="text-xl">
                Invoice {invoiceId} — <span className="text-blue-700">{shopId}</span>
              </CardTitle>
              <CardDescription>View and edit invoice details.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/shops/${encodeURIComponent(shopId)}/invoices`}
                className="text-sm text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1"
              >
                Back to list
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-80 rounded bg-slate-200" />
              <div className="h-24 rounded-xl bg-slate-200" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
              <p className="font-medium">Unable to load invoice.</p>
              <p className="text-sm mt-1">{error}</p>
              <div className="mt-3">
                <Button variant="destructive" onClick={load}>
                  Retry
                </Button>
              </div>
            </div>
          ) : !invoice ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <h3 className="text-base font-semibold text-slate-900">Invoice not found</h3>
              <p className="mt-1 text-sm text-slate-600">
                The requested invoice does not exist or is unavailable.
              </p>
              <div className="mt-4">
                <Link
                  href={`/shops/${encodeURIComponent(shopId)}/invoices`}
                  className="text-sm text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-3 py-1.5"
                >
                  Go back
                </Link>
              </div>
            </div>
          ) : (
            <Tabs
              items={[
                {
                  value: "overview",
                  label: "Overview",
                  content: (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="text-sm text-slate-600">Status</div>
                        <div className="mt-1">
                          <Badge variant={statusVariant(invoice.status)}>{invoice.status}</Badge>
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="text-sm text-slate-600">Customer</div>
                        <div className="mt-1">
                          {customers.find((c) => c.id === invoice.customerId)?.name ||
                            invoice.customerId}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="text-sm text-slate-600">Total</div>
                        <div className="mt-1 font-semibold">
                          {formatCurrency(invoice.total, invoice.currency)}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="text-sm text-slate-600">Due</div>
                        <div className="mt-1">{formatDate(invoice.dueDate)}</div>
                      </div>
                    </div>
                  ),
                },
                {
                  value: "edit",
                  label: "Edit",
                  content: (
                    <form className="space-y-4" onSubmit={onSave}>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Select
                          label="Customer"
                          value={form.customerId}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, customerId: e.target.value }))
                          }
                          options={customersOptions}
                          error={form.errors.customerId}
                          required
                        />
                        <Select
                          label="Status"
                          value={form.status}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, status: e.target.value as InvoiceStatus }))
                          }
                          options={[
                            { label: "Draft", value: "draft" },
                            { label: "Sent", value: "sent" },
                            { label: "Paid", value: "paid" },
                            { label: "Void", value: "void" },
                          ]}
                          error={form.errors.status}
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
                          onChange={(e) =>
                            setForm((f) => ({ ...f, amount: e.target.value }))
                          }
                          error={form.errors.amount}
                          required
                        />
                        <Select
                          label="Currency"
                          value={form.currency}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, currency: e.target.value }))
                          }
                          options={currencyOptions}
                          error={form.errors.currency}
                          required
                        />
                        <div />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                          label="Issue date"
                          type="date"
                          value={form.issueDate}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, issueDate: e.target.value }))
                          }
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
                      <div className="text-xs text-slate-500">
                        Amount is treated as subtotal. A 10% tax is applied in totals.
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Link
                          href={`/shops/${encodeURIComponent(shopId)}/invoices`}
                          className="text-sm text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-3 py-1.5"
                        >
                          Cancel
                        </Link>
                        <Button type="submit" loading={saving}>
                          Save changes
                        </Button>
                      </div>
                    </form>
                  ),
                },
              ]}
              defaultValue="overview"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
