import { Payment } from "@/types";
import { db } from "./seed";
import { delay, nowISO, clone } from "./utils";

/**
 * PUBLIC_INTERFACE
 * listPaymentsByShop
 * Returns payments for a given shop.
 */
export async function listPaymentsByShop(shopId: string): Promise<Payment[]> {
  await delay();
  return db.payments.filter((p) => p.shopId === shopId).map((p) => clone(p));
}

/**
 * PUBLIC_INTERFACE
 * getPayment
 * Returns a payment by id.
 */
export async function getPayment(id: string): Promise<Payment | undefined> {
  await delay();
  const found = db.payments.find((p) => p.id === id);
  return found ? clone(found) : undefined;
}

/**
 * PUBLIC_INTERFACE
 * createPayment
 * Create a payment for an invoice.
 */
export async function createPayment(input: Omit<Payment, "createdAt" | "updatedAt">): Promise<Payment> {
  await delay();
  const exists = db.payments.find((p) => p.id === input.id);
  if (exists) {
    throw new Error("Payment with this id already exists");
  }
  const now = nowISO();
  const payment: Payment = { ...input, createdAt: now, updatedAt: now };
  db.payments.push(payment);
  db.counters.payment += 1;
  return clone(payment);
}

/**
 * PUBLIC_INTERFACE
 * updatePayment
 * Update fields for an existing payment.
 */
export async function updatePayment(
  id: string,
  input: Partial<Omit<Payment, "id" | "shopId" | "invoiceId" | "createdAt" | "updatedAt">>
): Promise<Payment | undefined> {
  await delay();
  const idx = db.payments.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  const next = { ...db.payments[idx], ...input, updatedAt: nowISO() };
  db.payments[idx] = next;
  return clone(next);
}

/**
 * PUBLIC_INTERFACE
 * removePayment
 * Removes a payment by id.
 */
export async function removePayment(id: string): Promise<boolean> {
  await delay();
  const before = db.payments.length;
  const next = db.payments.filter((p) => p.id !== id);
  if (next.length === before) return false;
  db.payments.splice(0, db.payments.length, ...next);
  return true;
}
