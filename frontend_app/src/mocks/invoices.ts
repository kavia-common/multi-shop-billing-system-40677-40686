import { Invoice, InvoiceItem, InvoiceStatus } from "@/types";
import { db } from "./seed";
import { delay, nowISO, clone } from "./utils";

/**
 * PUBLIC_INTERFACE
 * listInvoicesByShop
 * Return invoices for a given shop.
 */
export async function listInvoicesByShop(shopId: string): Promise<Invoice[]> {
  await delay();
  return db.invoices.filter((i) => i.shopId === shopId).map((i) => clone(i));
}

/**
 * PUBLIC_INTERFACE
 * getInvoice
 * Returns a single invoice by id (and optional shop check).
 */
export async function getInvoice(id: string, shopId?: string): Promise<Invoice | undefined> {
  await delay();
  const found = db.invoices.find((i) => i.id === id && (shopId ? i.shopId === shopId : true));
  return found ? clone(found) : undefined;
}

/**
 * PUBLIC_INTERFACE
 * createInvoice
 * Create a new invoice. Caller provides id to match static routes patterns (e.g., 'INV-0003').
 */
export async function createInvoice(input: {
  id: string;
  shopId: string;
  customerId: string;
  items: InvoiceItem[];
  currency: string;
  status?: InvoiceStatus;
  issueDate?: string;
  dueDate?: string;
}): Promise<Invoice> {
  await delay();
  const exists = db.invoices.find((i) => i.id === input.id && i.shopId === input.shopId);
  if (exists) {
    throw new Error("Invoice with this id already exists for this shop");
  }
  const now = nowISO();
  const subtotal = input.items.reduce((sum, it) => sum + it.total, 0);
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + tax;
  const invoice: Invoice = {
    id: input.id,
    shopId: input.shopId,
    customerId: input.customerId,
    items: input.items,
    currency: input.currency,
    status: input.status ?? "draft",
    issueDate: input.issueDate ?? now,
    dueDate: input.dueDate ?? now,
    subtotal,
    tax,
    total,
    createdAt: now,
    updatedAt: now,
  };
  db.invoices.push(invoice);
  db.counters.invoice += 1;
  return clone(invoice);
}

/**
 * PUBLIC_INTERFACE
 * updateInvoice
 * Update fields for an existing invoice.
 */
export async function updateInvoice(
  id: string,
  shopId: string,
  input: Partial<Omit<Invoice, "id" | "shopId" | "createdAt" | "updatedAt">>
): Promise<Invoice | undefined> {
  await delay();
  const idx = db.invoices.findIndex((i) => i.id === id && i.shopId === shopId);
  if (idx === -1) return undefined;
  const next = { ...db.invoices[idx], ...input, updatedAt: nowISO() };
  db.invoices[idx] = next;
  return clone(next);
}

/**
 * PUBLIC_INTERFACE
 * removeInvoice
 * Delete an invoice by id for a shop.
 */
export async function removeInvoice(id: string, shopId: string): Promise<boolean> {
  await delay();
  const before = db.invoices.length;
  const invoice = db.invoices.find((i) => i.id === id && i.shopId === shopId);
  const next = db.invoices.filter((i) => !(i.id === id && i.shopId === shopId));
  if (next.length === before) return false;
  db.invoices.splice(0, db.invoices.length, ...next);

  // Cascade delete payments for this invoice
  if (invoice) {
    db.payments = db.payments.filter((p) => p.invoiceId !== invoice.id || p.shopId !== invoice.shopId);
  }
  return true;
}
