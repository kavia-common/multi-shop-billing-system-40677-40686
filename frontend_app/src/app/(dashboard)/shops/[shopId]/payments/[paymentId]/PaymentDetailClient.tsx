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

type EditFormState = {
  amount: string;
  currency: string;
  method: PaymentMethod;
  date: string; // yyyy-mm-dd
  reference: string;
  invoiceStatus: InvoiceStatus;
  errors: Partial<Record<keyof Omit<EditFormState, "errors">, string>>;
};

// PUBLIC_INTERFACE
export function PaymentDetailClient({
  shopId,
  paymentId,
}: {
  shopId: string;
  paymentId: string;
}) {
  const { selectedShopId, setSelectedShopId } = useShop();
  const { show } = useToast();

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditFormState>({
    amount: "",
    currency: "USD",
    method: "card",
    date: "",
    reference: "",
    invoiceStatus: "sent",
    errors: {},
  });

  // Sync context with route
  useEffect(() => {
    if (selectedShopId !== shopId) setSelectedShopId(shopId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await apiClient.payments.get(paymentId);
      if (!p || p.shopId !== shopId) {
        setPayment(null);
        setInvoice(null);
        setError("Payment not found");
      } else {
        const inv = (await apiClient.invoices.get(p.invoiceId, shopId)) as Invoice | undefined;
        const custs = await apiClient.customers.listByShop(shopId);
        setCustomers(custs);
        if (!inv) {
          setError("Related invoice not found");
          setInvoice(null);
          setPayment(p);
        } else {
          setPayment(p);
          setInvoice(inv);
          setForm({
            amount: String(Math.round(p.amount * 100) / 100),
            currency: p.currency,
            method: p.method,
            date: toDateInputValue(p.date),
            reference: p.reference || "",
            invoiceStatus: inv.status,
            errors: {},
          });
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load payment");
    } finally {
      setLoading(false);
    }
  }, [paymentId, shopId]);

  useEffect(() => {
    load();
  }, [load]);

  const crumbs = useMemo(
    () => [
      { label: "Dashboard", href: "/" },
      { label: "Shops", href: "/shops" },
      { label: shopId, href: `/shops/${encodeURIComponent(shopId)}` },
      { label: "Payments", href: `/shops/${encodeURIComponent(shopId)}/payments` },
      { label: paymentId },
    ],
    [shopId, paymentId]
  );

  const customerName = useMemo(() => {
    if (!invoice) return undefined;
    const c = customers.find((x) => x.id === invoice.customerId);
    return c?.name || invoice.customerId;
  }, [customers, invoice]);

  function validate(f: EditFormState) {
    const errors: EditFormState["errors"] = {};
    const amt = parseFloat(f.amount);
    if (!(amt > 0)) errors.amount = "Amount must be greater than 0";
    if (!f.currency) errors.currency = "Currency is required";
    if (!f.method) errors.method = "Method is required";
    if (!f.date) errors.date = "Date is required";
    return errors;
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!payment) return;

    const nextErrors = validate(form);
    setForm((p) => ({ ...p, errors: nextErrors }));
    if (Object.keys(nextErrors).length > 0) {
      show({ title: "Fix the highlighted fields", variant: "error" });
      return;
    }

    const updatedPayment: Payment = {
      ...payment,
      amount: Math.round(parseFloat(form.amount) * 100) / 100,
      currency: form.currency,
      method: form.method,
      date: fromDateInputValue(form.date),
      reference: form.reference || undefined,
      updatedAt: new Date().toISOString(),
    };

    setSaving(true);
    const prevInvoice = invoice;
    const desiredStatus = form.invoiceStatus;
    // Optimistic update
    setPayment(updatedPayment);
    if (prevInvoice && prevInvoice.status !== desiredStatus) {
      setInvoice({ ...prevInvoice, status: desiredStatus });
    }

    try {
      const p = await apiClient.payments.update(payment.id, {
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
        method: updatedPayment.method,
        date: updatedPayment.date,
        reference: updatedPayment.reference,
      });
      setPayment(p as Payment);

      if (prevInvoice && prevInvoice.status !== desiredStatus) {
        const updatedInv = await apiClient.invoices.update(prevInvoice.id, shopId, {
          status: desiredStatus,
        });
        setInvoice(updatedInv as Invoice);
      }

      show({ title: "Payment updated", variant: "success" });
    } catch (err: unknown) {
      // rollback by reload
      await load();
      show({
        title: "Failed to update payment",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={crumbs} aria-label="Payment detail breadcrumb" />
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle as="h1" className="text-xl">
                Payment {paymentId} — <span className="text-blue-700">{shopId}</span>
              </CardTitle>
              <CardDescription>View and edit payment details.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/shops/${encodeURIComponent(shopId)}/payments`}
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
              <p className="font-medium">Unable to load payment.</p>
              <p className="text-sm mt-1">{error}</p>
              <div className="mt-3">
                <Button variant="destructive" onClick={load}>
                  Retry
                </Button>
              </div>
            </div>
          ) : !payment ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <h3 className="text-base font-semibold text-slate-900">Payment not found</h3>
              <p className="mt-1 text-sm text-slate-600">
                The requested payment does not exist or is unavailable.
              </p>
              <div className="mt-4">
                <Link
                  href={`/shops/${encodeURIComponent(shopId)}/payments`}
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
                        <div className="text-sm text-slate-600">Invoice</div>
                        <div className="mt-1">
                          {invoice ? (
                            <Link
                              href={`/shops/${encodeURIComponent(shopId)}/invoices/${encodeURIComponent(invoice.id)}`}
                              className="text-blue-700 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                              {invoice.id}
                            </Link>
                          ) : (
                            "-"
                          )}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="text-sm text-slate-600">Customer</div>
                        <div className="mt-1">{customerName || "-"}</div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="text-sm text-slate-600">Amount</div>
                        <div className="mt-1 font-semibold">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="text-sm text-slate-600">Date</div>
                        <div className="mt-1">{formatDate(payment.date)}</div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="text-sm text-slate-600">Method</div>
                        <div className="mt-1">
                          <Badge variant={methodVariant(payment.method)}>{payment.method}</Badge>
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="text-sm text-slate-600">Invoice Status</div>
                        <div className="mt-1">
                          {invoice ? (
                            <Badge variant={statusVariant(invoice.status)}>{invoice.status}</Badge>
                          ) : (
                            "-"
                          )}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:col-span-2">
                        <div className="text-sm text-slate-600">Reference</div>
                        <div className="mt-1 text-slate-800">{payment.reference || "-"}</div>
                      </div>
                    </div>
                  ),
                },
                {
                  value: "edit",
                  label: "Edit",
                  content: (
                    <form className="space-y-4" onSubmit={onSave}>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Input
                          label="Payment ID"
                          value={paymentId}
                          readOnly
                          aria-readonly
                          description="ID cannot be changed"
                        />
                        <Input
                          label="Invoice"
                          value={invoice?.id || ""}
                          readOnly
                          aria-readonly
                        />
                        <Input
                          label="Customer"
                          value={customerName || ""}
                          readOnly
                          aria-readonly
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
                          options={[
                            { label: "USD", value: "USD" },
                            { label: "EUR", value: "EUR" },
                            { label: "GBP", value: "GBP" },
                          ]}
                          error={form.errors.currency}
                          required
                        />
                        <Select
                          label="Method"
                          value={form.method}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, method: e.target.value as PaymentMethod }))
                          }
                          options={[
                            { label: "Card", value: "card" },
                            { label: "Cash", value: "cash" },
                            { label: "Bank", value: "bank" },
                            { label: "Other", value: "other" },
                          ]}
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
                            setForm((f) => ({
                              ...f,
                              invoiceStatus: e.target.value as InvoiceStatus,
                            }))
                          }
                          options={[
                            { label: "Draft", value: "draft" },
                            { label: "Sent", value: "sent" },
                            { label: "Paid", value: "paid" },
                            { label: "Void", value: "void" },
                          ]}
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Link
                          href={`/shops/${encodeURIComponent(shopId)}/payments`}
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
