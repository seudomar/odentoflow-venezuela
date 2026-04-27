import { useSyncExternalStore } from "react";

export type Currency = "USD" | "VEF";
export type PaymentMethod = "Zelle" | "Efectivo" | "Pago Móvil" | "Transferencia" | "Binance";

export interface Payment {
  id: string;
  patientName: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  rate: number; // tasa BCV usada al registrar
  amountUSD: number; // equivalente en USD al momento del pago
  date: string;
  note?: string;
}

let payments: Payment[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const paymentsStore = {
  getAll: () => payments,
  add: (p: Omit<Payment, "id" | "date" | "amountUSD"> & { date?: string }) => {
    const amountUSD = p.currency === "USD" ? p.amount : p.amount / p.rate;
    payments = [
      {
        ...p,
        id: `pay${Date.now()}`,
        date: p.date ?? new Date().toISOString(),
        amountUSD,
      },
      ...payments,
    ];
    emit();
  },
  remove: (id: string) => {
    payments = payments.filter((p) => p.id !== id);
    emit();
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
