import { Customer } from "@/types";
import { db } from "./seed";
import { delay, nowISO, clone } from "./utils";

/**
 * PUBLIC_INTERFACE
 * listCustomersByShop
 * Returns customers for a given shop.
 */
export async function listCustomersByShop(shopId: string): Promise<Customer[]> {
  await delay();
  return db.customers.filter((c) => c.shopId === shopId).map((c) => clone(c));
}

/**
 * PUBLIC_INTERFACE
 * getCustomer
 * Returns a single customer by id.
 */
export async function getCustomer(id: string): Promise<Customer | undefined> {
  await delay();
  const found = db.customers.find((c) => c.id === id);
  return found ? clone(found) : undefined;
}

/**
 * PUBLIC_INTERFACE
 * createCustomer
 * Create a customer.
 */
export async function createCustomer(input: Omit<Customer, "createdAt" | "updatedAt">): Promise<Customer> {
  await delay();
  const exists = db.customers.find((c) => c.id === input.id);
  if (exists) {
    throw new Error("Customer with this id already exists");
  }
  const now = nowISO();
  const customer: Customer = { ...input, createdAt: now, updatedAt: now };
  db.customers.push(customer);
  db.counters.customer += 1;
  return clone(customer);
}

/**
 * PUBLIC_INTERFACE
 * updateCustomer
 * Update existing customer.
 */
export async function updateCustomer(id: string, input: Partial<Omit<Customer, "id" | "shopId" | "createdAt" | "updatedAt">>): Promise<Customer | undefined> {
  await delay();
  const idx = db.customers.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  const updated: Customer = { ...db.customers[idx], ...input, updatedAt: nowISO() };
  db.customers[idx] = updated;
  return clone(updated);
}

/**
 * PUBLIC_INTERFACE
 * removeCustomer
 * Deletes a customer by id.
 */
export async function removeCustomer(id: string): Promise<boolean> {
  await delay();
  const lengthBefore = db.customers.length;
  const next = db.customers.filter((c) => c.id !== id);
  if (next.length === lengthBefore) return false;
  db.customers.splice(0, db.customers.length, ...next);

  // Cascade delete invoices and payments for this customer
  const invoiceIds = new Set(db.invoices.filter((i) => i.customerId === id).map((i) => i.id));
  db.invoices = db.invoices.filter((i) => i.customerId !== id);
  db.payments = db.payments.filter((p) => !invoiceIds.has(p.invoiceId));

  return true;
}
