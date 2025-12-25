import { Customer, Invoice, InvoiceItem, Payment, Shop } from "@/types";
import { nowISO } from "./utils";

/**
 * In-memory "database" to back the mock services.
 * This module holds singletons so state is shared across imports.
 */

const createdAt = nowISO();
const updatedAt = createdAt;

// Seed shops to align with static routes already present in the app.
const shopSeeds: Shop[] = [
  { id: "north-harbor", name: "North Harbor Store", address: "123 Wharf St", createdAt, updatedAt },
  { id: "central-plaza", name: "Central Plaza Outlet", address: "45 Central Ave", createdAt, updatedAt },
  { id: "seaside", name: "Seaside Kiosk", address: "9 Ocean Blvd", createdAt, updatedAt },
];

const customersSeeds: Customer[] = [
  { id: "CUST-NH-1", shopId: "north-harbor", name: "Jane Doe", email: "jane@example.com", phone: "555-1111", createdAt, updatedAt },
  { id: "CUST-NH-2", shopId: "north-harbor", name: "John Smith", email: "john@example.com", phone: "555-2222", createdAt, updatedAt },
  { id: "CUST-CP-1", shopId: "central-plaza", name: "Alice Johnson", email: "alice@example.com", phone: "555-3333", createdAt, updatedAt },
  { id: "CUST-CP-2", shopId: "central-plaza", name: "Bob Williams", email: "bob@example.com", phone: "555-4444", createdAt, updatedAt },
  { id: "CUST-SS-1", shopId: "seaside", name: "Charlie Brown", email: "charlie@example.com", phone: "555-5555", createdAt, updatedAt },
  { id: "CUST-SS-2", shopId: "seaside", name: "Diane Green", email: "diane@example.com", phone: "555-6666", createdAt, updatedAt },
];

// Helper to build invoice line items.
function makeItems(): InvoiceItem[] {
  const items: InvoiceItem[] = [
    { sku: "SKU-001", description: "Widget A", qty: 1, unitPrice: 50, total: 50 },
    { sku: "SKU-002", description: "Widget B", qty: 2, unitPrice: 35, total: 70 },
  ];
  return items;
}

function totalOf(items: InvoiceItem[]): number {
  return items.reduce((sum, it) => sum + it.total, 0);
}

function makeInvoice(shopId: string, id: string, customerId: string): Invoice {
  const items = makeItems();
  const subtotal = totalOf(items);
  const tax = Math.round(subtotal * 0.1 * 100) / 100; // 10% tax
  const total = subtotal + tax;
  const issueDate = new Date().toISOString();
  const dueDate = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  return {
    id,
    shopId,
    customerId,
    issueDate,
    dueDate,
    status: "sent",
    items,
    subtotal,
    tax,
    total,
    currency: "USD",
    createdAt,
    updatedAt,
  };
}

const invoicesSeeds: Invoice[] = [
  makeInvoice("north-harbor", "INV-0001", "CUST-NH-1"),
  makeInvoice("north-harbor", "INV-0002", "CUST-NH-2"),
  makeInvoice("central-plaza", "INV-0001", "CUST-CP-1"),
  makeInvoice("central-plaza", "INV-0002", "CUST-CP-2"),
  makeInvoice("seaside", "INV-0001", "CUST-SS-1"),
  makeInvoice("seaside", "INV-0002", "CUST-SS-2"),
];

const paymentsSeeds: Payment[] = [
  {
    id: "PAY-0001",
    shopId: "north-harbor",
    invoiceId: "INV-0001",
    amount: 40,
    currency: "USD",
    date: createdAt,
    method: "card",
    reference: "AUTH123",
    createdAt,
    updatedAt,
  },
  {
    id: "PAY-0002",
    shopId: "central-plaza",
    invoiceId: "INV-0002",
    amount: 30,
    currency: "USD",
    date: createdAt,
    method: "cash",
    createdAt,
    updatedAt,
  },
  {
    id: "PAY-0003",
    shopId: "seaside",
    invoiceId: "INV-0001",
    amount: 25,
    currency: "USD",
    date: createdAt,
    method: "bank",
    reference: "TRX-998",
    createdAt,
    updatedAt,
  },
];

/**
 * Singleton in-memory data stores
 */
export const db = {
  shops: [...shopSeeds],
  customers: [...customersSeeds],
  invoices: [...invoicesSeeds],
  payments: [...paymentsSeeds],
  counters: {
    shop: shopSeeds.length,
    customer: customersSeeds.length,
    invoice: invoicesSeeds.length,
    payment: paymentsSeeds.length,
  },
};

/**
 * PUBLIC_INTERFACE
 * resetDb
 * Reset the mock in-memory database back to its initial seeded state.
 */
export function resetDb(): void {
  db.shops.splice(0, db.shops.length, ...shopSeeds);
  db.customers.splice(0, db.customers.length, ...customersSeeds);
  db.invoices.splice(0, db.invoices.length, ...invoicesSeeds);
  db.payments.splice(0, db.payments.length, ...paymentsSeeds);
  db.counters.shop = shopSeeds.length;
  db.counters.customer = customersSeeds.length;
  db.counters.invoice = invoicesSeeds.length;
  db.counters.payment = paymentsSeeds.length;
}
