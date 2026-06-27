// Local-storage backed data store for the Ajo MVP.
// All data lives in the browser. No backend.

import { useSyncExternalStore } from "react";

export type Frequency = "Daily" | "Weekly" | "Monthly";
export type CustomerStatus = "Active" | "Inactive";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  contributionAmount: number;
  frequency: Frequency;
  startDate: string; // ISO date
  status: CustomerStatus;
  createdAt: string;
}

export type TxnType = "IN" | "OUT";
export type PaymentMethod = "Cash" | "Transfer";
export type WithdrawalType =
  | "Customer Withdrawal"
  | "Office Expense"
  | "Bank Deposit"
  | "Refund"
  | "Other";

export interface Transaction {
  id: string;
  type: TxnType;
  customerId?: string; // required for IN, optional for OUT
  amount: number;
  paymentMethod?: PaymentMethod; // IN only
  withdrawalType?: WithdrawalType; // OUT only
  description?: string;
  reference?: string;
  date: string; // ISO datetime
  createdBy: string;
  createdAt: string;
}

interface DB {
  customers: Customer[];
  transactions: Transaction[];
}

const KEY = "ajo-mvp-db-v1";

function load(): DB {
  if (typeof window === "undefined") return { customers: [], transactions: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as DB;
  } catch {
    return { customers: [], transactions: [] };
  }
}

function save(db: DB) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(db));
  listeners.forEach((l) => l());
}

function seed(): DB {
  const today = new Date().toISOString();
  const customers: Customer[] = [
    {
      id: crypto.randomUUID(),
      name: "John Ade",
      phone: "08031234567",
      address: "Surulere, Lagos",
      contributionAmount: 5000,
      frequency: "Daily",
      startDate: today.slice(0, 10),
      status: "Active",
      createdAt: today,
    },
    {
      id: crypto.randomUUID(),
      name: "Mary James",
      phone: "08109876543",
      address: "Yaba, Lagos",
      contributionAmount: 3000,
      frequency: "Daily",
      startDate: today.slice(0, 10),
      status: "Active",
      createdAt: today,
    },
    {
      id: crypto.randomUUID(),
      name: "Tunde Bello",
      phone: "08025556677",
      address: "Ikeja, Lagos",
      contributionAmount: 10000,
      frequency: "Weekly",
      startDate: today.slice(0, 10),
      status: "Active",
      createdAt: today,
    },
  ];

  const txns: Transaction[] = [
    {
      id: crypto.randomUUID(),
      type: "IN",
      customerId: customers[0].id,
      amount: 5000,
      paymentMethod: "Cash",
      date: today,
      createdBy: "admin",
      createdAt: today,
    },
    {
      id: crypto.randomUUID(),
      type: "IN",
      customerId: customers[1].id,
      amount: 3000,
      paymentMethod: "Transfer",
      reference: "TRX-001",
      date: today,
      createdBy: "admin",
      createdAt: today,
    },
    {
      id: crypto.randomUUID(),
      type: "OUT",
      amount: 2000,
      withdrawalType: "Office Expense",
      description: "Printing receipts",
      date: today,
      createdBy: "admin",
      createdAt: today,
    },
  ];

  const db = { customers, transactions: txns };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(db));
  }
  return db;
}

// ---- Reactive subscription ----
const listeners = new Set<() => void>();
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, load, () => ({ customers: [], transactions: [] }));
}

// ---- Mutations ----
export function addCustomer(input: Omit<Customer, "id" | "createdAt">): Customer {
  const db = load();
  const c: Customer = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  db.customers.unshift(c);
  save(db);
  return c;
}

export function updateCustomer(id: string, patch: Partial<Customer>) {
  const db = load();
  db.customers = db.customers.map((c) => (c.id === id ? { ...c, ...patch } : c));
  save(db);
}

export function deactivateCustomer(id: string) {
  updateCustomer(id, { status: "Inactive" });
}

export function activateCustomer(id: string) {
  updateCustomer(id, { status: "Active" });
}

export function deleteCustomer(id: string) {
  const db = load();
  db.customers = db.customers.filter((c) => c.id !== id);
  save(db);
}

export function addTransaction(input: Omit<Transaction, "id" | "createdAt">): Transaction {
  const db = load();
  const t: Transaction = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  db.transactions.unshift(t);
  save(db);
  return t;
}

export function deleteTransaction(id: string) {
  const db = load();
  db.transactions = db.transactions.filter((t) => t.id !== id);
  save(db);
}

// ---- Selectors ----
export function cashBalance(txns: Transaction[]): number {
  return txns.reduce((s, t) => s + (t.type === "IN" ? t.amount : -t.amount), 0);
}

export function totalIn(txns: Transaction[]): number {
  return txns.filter((t) => t.type === "IN").reduce((s, t) => s + t.amount, 0);
}

export function totalOut(txns: Transaction[]): number {
  return txns.filter((t) => t.type === "OUT").reduce((s, t) => s + t.amount, 0);
}

export function customerById(db: DB, id?: string): Customer | undefined {
  if (!id) return undefined;
  return db.customers.find((c) => c.id === id);
}

export function resetDB() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  seed();
  listeners.forEach((l) => l());
}
