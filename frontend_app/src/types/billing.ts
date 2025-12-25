//
// Billing domain types for the multi-shop billing app
//

/**
 * A generic identifier string.
 */
export type ID = string;

/**
 * A simple ISO date string type alias.
 */
export type ISODateString = string;

/**
 * Currency code like "USD", "EUR", etc.
 */
export type CurrencyCode = string;

/**
 * PUBLIC_INTERFACE
 * Shop
 * A retail shop that owns customers, invoices, and payments.
 */
export interface Shop {
  /** Unique identifier (e.g., 'north-harbor') */
  id: ID;
  /** Human-friendly display name */
  name: string;
  /** Optional address or location info */
  address?: string;
  /** ISO timestamp for creation */
  createdAt: ISODateString;
  /** ISO timestamp for last update */
  updatedAt: ISODateString;
}

/**
 * PUBLIC_INTERFACE
 * Customer
 * Represents a customer associated with a shop.
 */
export interface Customer {
  id: ID;
  shopId: ID;
  name: string;
  email?: string;
  phone?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * PUBLIC_INTERFACE
 * InvoiceItem
 * An item line within an invoice.
 */
export interface InvoiceItem {
  sku: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

/**
 * PUBLIC_INTERFACE
 * InvoiceStatus
 * Lifecycle statuses for an invoice.
 */
export type InvoiceStatus = "draft" | "sent" | "paid" | "void";

/**
 * PUBLIC_INTERFACE
 * Invoice
 * Billing invoice linked to a customer for a given shop.
 */
export interface Invoice {
  id: ID; // e.g., "INV-0001"
  shopId: ID;
  customerId: ID;
  issueDate: ISODateString;
  dueDate: ISODateString;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: CurrencyCode;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * PUBLIC_INTERFACE
 * PaymentMethod
 * Allowed payment methods in the mock.
 */
export type PaymentMethod = "card" | "cash" | "bank" | "other";

/**
 * PUBLIC_INTERFACE
 * Payment
 * A payment applied to a specific invoice.
 */
export interface Payment {
  id: ID; // e.g., "PAY-0001"
  shopId: ID;
  invoiceId: ID;
  amount: number;
  currency: CurrencyCode;
  date: ISODateString;
  method: PaymentMethod;
  reference?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
