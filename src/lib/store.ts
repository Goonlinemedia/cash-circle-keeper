import { useSyncExternalStore } from "react";
import { supabase } from "./supabase";

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
  "Customer Withdrawal" | "Office Expense" | "Bank Deposit" | "Refund" | "Other";

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

let fetched = false;
let cachedDB: DB = { customers: [], transactions: [] };

function load(): DB {
  if (typeof window === "undefined") return { customers: [], transactions: [] };
  if (!fetched) {
    fetched = true;
    fetchFromSupabase();
  }
  return cachedDB;
}

async function fetchFromSupabase() {
  try {
    const { data: custs } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: txns } = await supabase
      .from("transactions")
      .select("*, profiles(name)")
      .order("date", { ascending: false });

    cachedDB = {
      customers: (custs || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        address: c.address,
        contributionAmount: Number(c.contribution_amount),
        frequency: c.frequency as Frequency,
        startDate: c.start_date,
        status: c.status as CustomerStatus,
        createdAt: c.created_at,
      })),
      transactions: (txns || []).map((t: any) => ({
        id: t.id,
        type: t.type as TxnType,
        customerId: t.customer_id,
        amount: Number(t.amount),
        paymentMethod: t.payment_method as PaymentMethod,
        withdrawalType: t.withdrawal_type as WithdrawalType,
        description: t.description,
        reference: t.reference,
        date: t.date,
        createdBy: t.profiles?.name || "unknown",
        createdAt: t.created_at,
      })),
    };

    listeners.forEach((l) => l());
  } catch (e) {
    console.error("Error loading data from Supabase:", e);
  }
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
export async function addCustomer(input: Omit<Customer, "id" | "createdAt">): Promise<Customer> {
  const tempId = crypto.randomUUID();
  const tempCreatedAt = new Date().toISOString();
  const newCustomer: Customer = {
    ...input,
    id: tempId,
    createdAt: tempCreatedAt,
  };

  // Optimistic update
  cachedDB = {
    ...cachedDB,
    customers: [newCustomer, ...cachedDB.customers],
  };
  listeners.forEach((l) => l());

  // Supabase background write
  supabase
    .from("customers")
    .insert([
      {
        id: tempId,
        name: input.name,
        phone: input.phone,
        address: input.address,
        contribution_amount: input.contributionAmount,
        frequency: input.frequency,
        start_date: input.startDate,
        status: input.status,
        created_at: tempCreatedAt,
      },
    ])
    .then(({ error }) => {
      if (error) {
        console.error("Error adding customer to Supabase:", error);
        // Rollback
        cachedDB = {
          ...cachedDB,
          customers: cachedDB.customers.filter((c) => c.id !== tempId),
        };
        listeners.forEach((l) => l());
      }
    });

  return newCustomer;
}

export async function updateCustomer(id: string, patch: Partial<Customer>): Promise<void> {
  const oldCustomers = [...cachedDB.customers];

  // Optimistic update
  cachedDB = {
    ...cachedDB,
    customers: cachedDB.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  };
  listeners.forEach((l) => l());

  const dbPatch: any = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.phone !== undefined) dbPatch.phone = patch.phone;
  if (patch.address !== undefined) dbPatch.address = patch.address;
  if (patch.contributionAmount !== undefined)
    dbPatch.contribution_amount = patch.contributionAmount;
  if (patch.frequency !== undefined) dbPatch.frequency = patch.frequency;
  if (patch.startDate !== undefined) dbPatch.start_date = patch.startDate;
  if (patch.status !== undefined) dbPatch.status = patch.status;

  supabase
    .from("customers")
    .update(dbPatch)
    .eq("id", id)
    .then(({ error }) => {
      if (error) {
        console.error("Error updating customer in Supabase:", error);
        cachedDB = {
          ...cachedDB,
          customers: oldCustomers,
        };
        listeners.forEach((l) => l());
      }
    });
}

export function deactivateCustomer(id: string) {
  updateCustomer(id, { status: "Inactive" });
}

export function activateCustomer(id: string) {
  updateCustomer(id, { status: "Active" });
}

export async function deleteCustomer(id: string): Promise<void> {
  const oldCustomers = [...cachedDB.customers];

  // Optimistic update
  cachedDB = {
    ...cachedDB,
    customers: cachedDB.customers.filter((c) => c.id !== id),
  };
  listeners.forEach((l) => l());

  supabase
    .from("customers")
    .delete()
    .eq("id", id)
    .then(({ error }) => {
      if (error) {
        console.error("Error deleting customer in Supabase:", error);
        cachedDB = {
          ...cachedDB,
          customers: oldCustomers,
        };
        listeners.forEach((l) => l());
      }
    });
}

export async function addTransaction(
  input: Omit<Transaction, "id" | "createdAt">,
): Promise<Transaction> {
  const tempId = crypto.randomUUID();
  const tempCreatedAt = new Date().toISOString();

  let creatorId: string | null = null;
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    creatorId = session?.user?.id || null;
  } catch {
    // ignore
  }

  const newTxn: Transaction = {
    ...input,
    id: tempId,
    createdAt: tempCreatedAt,
  };

  // Optimistic update
  cachedDB = {
    ...cachedDB,
    transactions: [newTxn, ...cachedDB.transactions],
  };
  listeners.forEach((l) => l());

  supabase
    .from("transactions")
    .insert([
      {
        id: tempId,
        customer_id: input.customerId || null,
        type: input.type,
        amount: input.amount,
        payment_method: input.paymentMethod || null,
        withdrawal_type: input.withdrawalType || null,
        description: input.description || null,
        reference: input.reference || null,
        date: input.date,
        created_by: creatorId,
        created_at: tempCreatedAt,
      },
    ])
    .then(({ error }) => {
      if (error) {
        console.error("Error adding transaction to Supabase:", error);
        cachedDB = {
          ...cachedDB,
          transactions: cachedDB.transactions.filter((t) => t.id !== tempId),
        };
        listeners.forEach((l) => l());
      }
    });

  return newTxn;
}

export async function deleteTransaction(id: string): Promise<void> {
  const oldTxns = [...cachedDB.transactions];

  // Optimistic update
  cachedDB = {
    ...cachedDB,
    transactions: cachedDB.transactions.filter((t) => t.id !== id),
  };
  listeners.forEach((l) => l());

  supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .then(({ error }) => {
      if (error) {
        console.error("Error deleting transaction from Supabase:", error);
        cachedDB = {
          ...cachedDB,
          transactions: oldTxns,
        };
        listeners.forEach((l) => l());
      }
    });
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

export async function resetDB() {
  cachedDB = { customers: [], transactions: [] };
  listeners.forEach((l) => l());

  try {
    await supabase.from("transactions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("customers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  } catch (e) {
    console.error("Error resetting database:", e);
  }
}
