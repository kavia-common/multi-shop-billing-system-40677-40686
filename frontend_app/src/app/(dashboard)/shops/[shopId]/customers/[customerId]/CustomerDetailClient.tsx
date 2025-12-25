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
  useToast,
} from "@/components/ui";
import type { Customer } from "@/types";

type EditFormState = {
  name: string;
  email: string;
  phone: string;
  errors: Partial<Record<keyof Omit<EditFormState, "errors">, string>>;
};

// PUBLIC_INTERFACE
export function CustomerDetailClient({
  shopId,
  customerId,
}: {
  shopId: string;
  customerId: string;
}) {
  const { selectedShopId, setSelectedShopId } = useShop();
  const { show } = useToast();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditFormState>({
    name: "",
    email: "",
    phone: "",
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
      const c = await apiClient.customers.get(customerId);
      if (!c || c.shopId !== shopId) {
        setCustomer(null);
        setError("Customer not found");
      } else {
        setCustomer(c);
        setForm({
          name: c.name,
          email: c.email || "",
          phone: c.phone || "",
          errors: {},
        });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load customer");
    } finally {
      setLoading(false);
    }
  }, [customerId, shopId]);

  useEffect(() => {
    load();
  }, [load]);

  const crumbs = useMemo(
    () => [
      { label: "Dashboard", href: "/" },
      { label: "Shops", href: "/shops" },
      { label: shopId, href: `/shops/${encodeURIComponent(shopId)}` },
      { label: "Customers", href: `/shops/${encodeURIComponent(shopId)}/customers` },
      { label: customerId },
    ],
    [shopId, customerId]
  );

  function validate(f: EditFormState) {
    const errors: EditFormState["errors"] = {};
    if (!f.name || f.name.trim().length === 0) errors.name = "Name is required";
    if (f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) errors.email = "Email is invalid";
    return errors;
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!customer) return;

    const nextErrors = validate(form);
    setForm((p) => ({ ...p, errors: nextErrors }));
    if (Object.keys(nextErrors).length > 0) {
      show({ title: "Fix the highlighted fields", variant: "error" });
      return;
    }

    const optimistic: Customer = {
      ...customer,
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    setSaving(true);
    setCustomer(optimistic);
    try {
      const updated = await apiClient.customers.update(customer.id, {
        name: optimistic.name,
        email: optimistic.email,
        phone: optimistic.phone,
      });
      setCustomer(updated);
      show({ title: "Customer updated", variant: "success" });
    } catch (err: unknown) {
      await load(); // rollback
      show({
        title: "Failed to update customer",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={crumbs} aria-label="Customer detail breadcrumb" />
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle as="h1" className="text-xl">
                Customer {customerId} — <span className="text-blue-700">{shopId}</span>
              </CardTitle>
              <CardDescription>View and edit customer details.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/shops/${encodeURIComponent(shopId)}/customers`}
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
              <p className="font-medium">Unable to load customer.</p>
              <p className="text-sm mt-1">{error}</p>
              <div className="mt-3">
                <Button variant="destructive" onClick={load}>
                  Retry
                </Button>
              </div>
            </div>
          ) : !customer ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <h3 className="text-base font-semibold text-slate-900">Customer not found</h3>
              <p className="mt-1 text-sm text-slate-600">
                The requested customer does not exist or is unavailable.
              </p>
              <div className="mt-4">
                <Link
                  href={`/shops/${encodeURIComponent(shopId)}/customers`}
                  className="text-sm text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-3 py-1.5"
                >
                  Go back
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={onSave}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Customer ID"
                  value={customerId}
                  readOnly
                  aria-readonly
                  description="ID cannot be changed"
                />
                <Input
                  label="Name"
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
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  error={form.errors.email}
                />
                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Link
                  href={`/shops/${encodeURIComponent(shopId)}/customers`}
                  className="text-sm text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-3 py-1.5"
                >
                  Cancel
                </Link>
                <Button type="submit" loading={saving}>
                  Save changes
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
