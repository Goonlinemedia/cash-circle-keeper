import { useSyncExternalStore } from "react";
import { supabase } from "./supabase";

export type Frequency = "Daily" | "Weekly" | "Monthly";
export type CustomerStatus = "Active" | "Inactive";

export interface AjoPackage {
  id: string;
  name: string;
  contributionAmount: number;
  targetAmount?: number;
  frequency: Frequency;
  durationDays?: number;
  description?: string;
  status: "Active" | "Completed" | "Inactive";
  createdAt: string;
}

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
  ajoPackageId?: string;
  isApproved?: boolean;
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
  ajoPackages: AjoPackage[];
}

let fetched = false;
let cachedDB: DB = { customers: [], transactions: [], ajoPackages: [] };

function load(): DB {
  if (typeof window === "undefined") return { customers: [], transactions: [], ajoPackages: [] };
  if (!fetched) {
    fetched = true;
    fetchFromSupabase();
  }
  return cachedDB;
}

export async function fetchFromSupabase() {
  try {
    const { data: custs } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: txns } = await supabase
      .from("transactions")
      .select("*, profiles(name)")
      .order("date", { ascending: false });

    const { data: pkgs } = await supabase
      .from("ajo_packages")
      .select("*")
      .order("created_at", { ascending: false });

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
        ajoPackageId: c.ajo_package_id || undefined,
        isApproved: c.is_approved !== false,
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
      ajoPackages: (pkgs || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        contributionAmount: Number(p.contribution_amount),
        targetAmount: p.target_amount ? Number(p.target_amount) : undefined,
        frequency: p.frequency as Frequency,
        durationDays: p.duration_days || undefined,
        description: p.description || undefined,
        status: p.status as "Active" | "Completed" | "Inactive",
        createdAt: p.created_at,
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
  return useSyncExternalStore(subscribe, load, () => ({ customers: [], transactions: [], ajoPackages: [] }));
}

// ---- Mutations ----
export async function addCustomer(input: Omit<Customer, "id" | "createdAt">): Promise<Customer> {
  const tempId = crypto.randomUUID();
  const tempCreatedAt = new Date().toISOString();
  const newCustomer: Customer = {
    ...input,
    id: tempId,
    createdAt: tempCreatedAt,
    isApproved: input.isApproved !== false,
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
        ajo_package_id: input.ajoPackageId || null,
        is_approved: input.isApproved !== false,
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
  if (patch.ajoPackageId !== undefined) dbPatch.ajo_package_id = patch.ajoPackageId || null;
  if (patch.isApproved !== undefined) dbPatch.is_approved = patch.isApproved;

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

export async function addAjoPackage(
  input: Omit<AjoPackage, "id" | "createdAt">,
): Promise<AjoPackage> {
  const tempId = crypto.randomUUID();
  const tempCreatedAt = new Date().toISOString();
  const newPackage: AjoPackage = {
    ...input,
    id: tempId,
    createdAt: tempCreatedAt,
  };

  // Optimistic update
  cachedDB = {
    ...cachedDB,
    ajoPackages: [newPackage, ...cachedDB.ajoPackages],
  };
  listeners.forEach((l) => l());

  supabase
    .from("ajo_packages")
    .insert([
      {
        id: tempId,
        name: input.name,
        contribution_amount: input.contributionAmount,
        target_amount: input.targetAmount || null,
        frequency: input.frequency,
        duration_days: input.durationDays || null,
        description: input.description || null,
        status: input.status,
        created_at: tempCreatedAt,
      },
    ])
    .then(({ error }) => {
      if (error) {
        console.error("Error adding Ajo Package to Supabase:", error);
        cachedDB = {
          ...cachedDB,
          ajoPackages: cachedDB.ajoPackages.filter((p) => p.id !== tempId),
        };
        listeners.forEach((l) => l());
      }
    });

  return newPackage;
}

export async function updateAjoPackage(id: string, patch: Partial<AjoPackage>): Promise<void> {
  const oldPackages = [...cachedDB.ajoPackages];

  // Optimistic update
  cachedDB = {
    ...cachedDB,
    ajoPackages: cachedDB.ajoPackages.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  };
  listeners.forEach((l) => l());

  const dbPatch: any = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.contributionAmount !== undefined)
    dbPatch.contribution_amount = patch.contributionAmount;
  if (patch.targetAmount !== undefined) dbPatch.target_amount = patch.targetAmount || null;
  if (patch.frequency !== undefined) dbPatch.frequency = patch.frequency;
  if (patch.durationDays !== undefined) dbPatch.duration_days = patch.durationDays || null;
  if (patch.description !== undefined) dbPatch.description = patch.description || null;
  if (patch.status !== undefined) dbPatch.status = patch.status;

  supabase
    .from("ajo_packages")
    .update(dbPatch)
    .eq("id", id)
    .then(({ error }) => {
      if (error) {
        console.error("Error updating Ajo Package in Supabase:", error);
        cachedDB = {
          ...cachedDB,
          ajoPackages: oldPackages,
        };
        listeners.forEach((l) => l());
      }
    });
}

export async function deleteAjoPackage(id: string): Promise<void> {
  const oldPackages = [...cachedDB.ajoPackages];

  // Optimistic update
  cachedDB = {
    ...cachedDB,
    ajoPackages: cachedDB.ajoPackages.filter((p) => p.id !== id),
  };
  listeners.forEach((l) => l());

  supabase
    .from("ajo_packages")
    .delete()
    .eq("id", id)
    .then(({ error }) => {
      if (error) {
        console.error("Error deleting Ajo Package from Supabase:", error);
        cachedDB = {
          ...cachedDB,
          ajoPackages: oldPackages,
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

export interface AjoProgress {
  hasPackage: boolean;
  packageName?: string;
  durationDays?: number;
  contributionAmount: number;
  totalContributed: number;
  paidDays: number;
  progressPercent: number;
  isCompleted: boolean;
}

export function getCustomerAjoProgress(db: DB, customer: Customer): AjoProgress {
  const pkg = customer.ajoPackageId ? db.ajoPackages.find((p) => p.id === customer.ajoPackageId) : undefined;
  
  // Calculate total contributed (IN transactions)
  const custTxns = db.transactions.filter((t) => t.customerId === customer.id && t.type === "IN");
  const totalContributed = custTxns.reduce((s, t) => s + t.amount, 0);
  
  const contributionAmount = customer.contributionAmount || pkg?.contributionAmount || 0;
  
  // Count how many complete units have been paid
  const divisor = contributionAmount || 1;
  const paidDays = Math.floor(totalContributed / divisor);
  
  const durationDays = pkg?.durationDays;
  const progressPercent = durationDays ? Math.min(100, Math.round((paidDays / durationDays) * 100)) : 0;
  
  return {
    hasPackage: !!pkg,
    packageName: pkg?.name,
    durationDays,
    contributionAmount,
    totalContributed,
    paidDays,
    progressPercent,
    isCompleted: durationDays ? paidDays >= durationDays : false,
  };
}

export async function resetDB() {
  cachedDB = { customers: [], transactions: [], ajoPackages: [] };
  listeners.forEach((l) => l());

  try {
    await supabase.from("transactions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("customers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("ajo_packages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  } catch (e) {
    console.error("Error resetting database:", e);
  }
}
