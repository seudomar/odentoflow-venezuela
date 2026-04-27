import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { authStore } from "@/lib/auth-store";

export type Currency = "USD" | "VEF";
export type PaymentMethod = "Zelle" | "Efectivo" | "Pago Móvil" | "Transferencia" | "Binance";

export interface Payment {
  id: string;
  patientName: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  rate: number;
  amountUSD: number;
  date: string;
  note?: string;
}

type DBPayment = {
  id: string;
  patient_name: string;
  amount: string | number;
  currency: Currency;
  method: PaymentMethod;
  rate: string | number;
  amount_usd: string | number;
  payment_date: string;
  note: string | null;
};

const num = (v: string | number) => (typeof v === "number" ? v : parseFloat(v));

function fromDB(p: DBPayment): Payment {
  return {
    id: p.id,
    patientName: p.patient_name,
    amount: num(p.amount),
    currency: p.currency,
    method: p.method,
    rate: num(p.rate),
    amountUSD: num(p.amount_usd),
    date: p.payment_date,
    note: p.note ?? undefined,
  };
}

let payments: Payment[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function fetchAll() {
  const { clinicId } = authStore.get();
  if (!clinicId) { payments = []; emit(); return; }
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("payment_date", { ascending: false });
  if (error) { console.error("payments.fetchAll", error); return; }
  payments = (data ?? []).map((d) => fromDB(d as DBPayment));
  emit();
}

let lastClinicId: string | null = null;
authStore.subscribe(() => {
  const { clinicId } = authStore.get();
  if (clinicId !== lastClinicId) {
    lastClinicId = clinicId;
    payments = [];
    emit();
    if (clinicId) fetchAll();
  }
});

export const paymentsStore = {
  getAll: () => payments,
  refresh: fetchAll,
  add: async (p: Omit<Payment, "id" | "date" | "amountUSD"> & { date?: string }) => {
    const { clinicId } = authStore.get();
    if (!clinicId) throw new Error("Sin clínica activa");
    const amountUSD = p.currency === "USD" ? p.amount : p.amount / p.rate;
    const { data, error } = await supabase
      .from("payments")
      .insert({
        clinic_id: clinicId,
        patient_name: p.patientName,
        amount: p.amount,
        currency: p.currency,
        method: p.method,
        rate: p.rate,
        amount_usd: amountUSD,
        payment_date: p.date ?? new Date().toISOString(),
        note: p.note ?? null,
      })
      .select()
      .single();
    if (error) { console.error(error); throw error; }
    payments = [fromDB(data as DBPayment), ...payments];
    emit();
  },
  remove: async (id: string) => {
    payments = payments.filter((p) => p.id !== id);
    emit();
    await supabase.from("payments").delete().eq("id", id);
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function usePayments() {
  return useSyncExternalStore(paymentsStore.subscribe, () => payments, () => payments);
}

export const METHOD_OPTIONS: PaymentMethod[] = ["Zelle", "Efectivo", "Pago Móvil", "Transferencia", "Binance"];
