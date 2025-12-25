import { Shop } from "@/types";
import { db } from "./seed";
import { delay, nowISO, clone } from "./utils";

/**
 * PUBLIC_INTERFACE
 * listShops
 * Returns all shops in the mock database.
 */
export async function listShops(): Promise<Shop[]> {
  await delay();
  return db.shops.map((s) => clone(s));
}

/**
 * PUBLIC_INTERFACE
 * getShop
 * Returns a single shop by id. Undefined if not found.
 */
export async function getShop(id: string): Promise<Shop | undefined> {
  await delay();
  const found = db.shops.find((s) => s.id === id);
  return found ? clone(found) : undefined;
}

/**
 * PUBLIC_INTERFACE
 * createShop
 * Create a new shop with provided name and optional address.
 */
export async function createShop(input: { id: string; name: string; address?: string }): Promise<Shop> {
  await delay();
  const existing = db.shops.find((s) => s.id === input.id);
  if (existing) {
    // Mimic a conflict
    throw new Error("Shop with this id already exists");
  }
  const now = nowISO();
  const shop: Shop = {
    id: input.id,
    name: input.name,
    address: input.address,
    createdAt: now,
    updatedAt: now,
  };
  db.shops.push(shop);
  db.counters.shop += 1;
  return clone(shop);
}

/**
 * PUBLIC_INTERFACE
 * updateShop
 * Update a shop's fields. Returns updated shop or undefined if not found.
 */
export async function updateShop(id: string, input: Partial<Pick<Shop, "name" | "address">>): Promise<Shop | undefined> {
  await delay();
  const idx = db.shops.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  const updated: Shop = {
    ...db.shops[idx],
    ...input,
    updatedAt: nowISO(),
  };
  db.shops[idx] = updated;
  return clone(updated);
}

/**
 * PUBLIC_INTERFACE
 * removeShop
 * Delete a shop by id. Returns true if removed, false otherwise.
 */
export async function removeShop(id: string): Promise<boolean> {
  await delay();
  const lengthBefore = db.shops.length;
  const next = db.shops.filter((s) => s.id !== id);
  if (next.length === lengthBefore) return false;
  db.shops.splice(0, db.shops.length, ...next);

  // Also cascade delete related entities for consistency
  db.customers = db.customers.filter((c) => c.shopId !== id);
  db.invoices = db.invoices.filter((i) => i.shopId !== id);
  db.payments = db.payments.filter((p) => p.shopId !== id);

  return true;
}
