import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { onClinicChange, currentClinicId } from "@/lib/clinic-sync";
import type { PaymentMethod } from "./payments-store";

export interface PaymentAccount {
  id: string;
  method: PaymentMethod;
  label: string;
  holder: string;
  // Zelle
  email?: string;
  // Pago Móvil
  bank?: string;
  phone?: string;
  idNumber?: string;
  // Transferencia bancaria
  accountNumber?: string;
  accountType?: "Corriente" | "Ahorro";
  swiftCode?: string;
  // Binance
  binanceId?: string;
  binanceNetwork?: string;
  binanceEmail?: string;
  // Genérico
  instructions?: string;
  active: boolean;
}

type DBAccount = {
  id: string;
  method: PaymentMethod;
  label: string;
  holder: string;
  email: string | null;
  bank: string | null;
  phone: string | null;
  id_number: string | null;
  account_number: string | null;
  account_type: string | null;
  swift_code: string | null;
  binance_id: string | null;
  binance_network: string | null;
  binance_email: string | null;
  instructions: string | null;
  active: boolean;
};

const fromDB = (a: DBAccount): PaymentAccount => ({
  id: a.id,
  method: a.method,
  label: a.label,
  holder: a.holder ?? "",
  email: a.email ?? undefined,
  bank: a.bank ?? undefined,
  phone: a.phone ?? undefined,
  idNumber: a.id_number ?? undefined,
  accountNumber: a.account_number ?? undefined,
  accountType: (a.account_type as PaymentAccount["accountType"]) ?? undefined,
  swiftCode: a.swift_code ?? undefined,
  binanceId: a.binance_id ?? undefined,
  binanceNetwork: a.binance_network ?? undefined,
  binanceEmail: a.binance_email ?? undefined,
  instructions: a.instructions ?? undefined,
  active: a.active,
});

function toDB(a: Partial<PaymentAccount>): Record<string, unknown> {
  const d: Record<string, unknown> = {};
  if (a.method !== undefined) d.method = a.method;
  if (a.label !== undefined) d.label = a.label;
  if (a.holder !== undefined) d.holder = a.holder;
  if (a.email !== undefined) d.email = a.email ?? null;
  if (a.bank !== undefined) d.bank = a.bank ?? null;
  if (a.phone !== undefined) d.phone = a.phone ?? null;
  if (a.idNumber !== undefined) d.id_number = a.idNumber ?? null;
  if (a.accountNumber !== undefined) d.account_number = a.accountNumber ?? null;
  if (a.accountType !== undefined) d.account_type = a.accountType ?? null;
  if (a.swiftCode !== undefined) d.swift_code = a.swiftCode ?? null;
  if (a.binanceId !== undefined) d.binance_id = a.binanceId ?? null;
  if (a.binanceNetwork !== undefined) d.binance_network = a.binanceNetwork ?? null;
  if (a.binanceEmail !== undefined) d.binance_email = a.binanceEmail ?? null;
  if (a.instructions !== undefined) d.instructions = a.instructions ?? null;
  if (a.active !== undefined) d.active = a.active;
  return d;
}

let accounts: PaymentAccount[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function fetchAll() {
  const clinicId = currentClinicId();
  if (!clinicId) { accounts = []; emit(); return; }
  const { data, error } = await supabase
    .from("payment_accounts")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: true });
  if (error) { console.error("paymentAccounts.fetchAll", error); return; }
  accounts = (data ?? []).map((d) => fromDB(d as DBAccount));
  emit();
}

onClinicChange((clinicId) => {
  accounts = [];
  emit();
  if (clinicId) fetchAll();
});

export const paymentAccountsStore = {
  getAll: () => accounts,
  refresh: fetchAll,
  add: async (a: Omit<PaymentAccount, "id">) => {
    const clinicId = currentClinicId();
    if (!clinicId) return;
    const { data, error } = await supabase
      .from("payment_accounts")
      .insert({ clinic_id: clinicId, ...toDB(a) } as never)
      .select()
      .single();
    if (error) { console.error("paymentAccounts.add", error); return; }
    accounts = [...accounts, fromDB(data as DBAccount)];
    emit();
  },
  update: async (id: string, patch: Partial<PaymentAccount>) => {
    accounts = accounts.map((a) => (a.id === id ? { ...a, ...patch } : a));
    emit();
    const { error } = await supabase.from("payment_accounts").update(toDB(patch) as never).eq("id", id);
    if (error) console.error("paymentAccounts.update", error);
  },
  remove: async (id: string) => {
    accounts = accounts.filter((a) => a.id !== id);
    emit();
    const { error } = await supabase.from("payment_accounts").delete().eq("id", id);
    if (error) console.error("paymentAccounts.remove", error);
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function usePaymentAccounts() {
  return useSyncExternalStore(paymentAccountsStore.subscribe, () => accounts, () => accounts);
}

export function getActiveByMethod(method: PaymentMethod) {
  return accounts.filter((a) => a.active && a.method === method);
}
