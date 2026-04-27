import { useSyncExternalStore } from "react";
import type { PaymentMethod } from "./payments-store";

export interface PaymentAccount {
  id: string;
  method: PaymentMethod;
  label: string; // Ej: "Zelle Principal"
  holder: string; // Titular
  // Campos opcionales según método
  email?: string; // Zelle
  bank?: string; // Pago Móvil
  phone?: string; // Pago Móvil
  idNumber?: string; // Cédula/RIF (Pago Móvil)
  instructions?: string; // Efectivo u otros
  active: boolean;
}

let accounts: PaymentAccount[] = [
  {
    id: "acc1",
    method: "Zelle",
    label: "Zelle Principal",
    holder: "Dr. Juan Pérez",
    email: "pagos@odontoflow.com",
    active: true,
  },
  {
    id: "acc2",
    method: "Pago Móvil",
    label: "Pago Móvil BDV",
    holder: "Dr. Juan Pérez",
    bank: "0102 - Banco de Venezuela",
    phone: "04141234567",
    idNumber: "V-12.345.678",
    active: true,
  },
  {
    id: "acc3",
    method: "Efectivo",
    label: "Efectivo en consultorio",
    holder: "Recepción",
    instructions: "Entregar en caja al finalizar la consulta. Se acepta USD y Bs.",
    active: true,
  },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const paymentAccountsStore = {
  getAll: () => accounts,
  add: (a: Omit<PaymentAccount, "id">) => {
    accounts = [...accounts, { ...a, id: `acc${Date.now()}` }];
    emit();
  },
  update: (id: string, patch: Partial<PaymentAccount>) => {
    accounts = accounts.map((a) => (a.id === id ? { ...a, ...patch } : a));
    emit();
  },
  remove: (id: string) => {
    accounts = accounts.filter((a) => a.id !== id);
    emit();
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
