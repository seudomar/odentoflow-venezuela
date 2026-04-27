import { useSyncExternalStore } from "react";

export type TreatmentStatus = "Pendiente" | "En curso" | "Finalizado";

export const TREATMENT_STATUSES: TreatmentStatus[] = ["Pendiente", "En curso", "Finalizado"];

export interface TreatmentItem {
  id: string;
  patientId: string;
  serviceId: string;
  name: string;        // snapshot del nombre
  priceUSD: number;    // snapshot del precio (editable)
  status: TreatmentStatus;
  createdAt: string;
  notes?: string;
}

let items: TreatmentItem[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const treatmentPlansStore = {
  getByPatient: (patientId: string) => items.filter((i) => i.patientId === patientId),
  add: (i: Omit<TreatmentItem, "id" | "createdAt">) => {
    items = [
      ...items,
      { ...i, id: `t${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, createdAt: new Date().toISOString() },
    ];
    emit();
  },
  update: (id: string, patch: Partial<TreatmentItem>) => {
    items = items.map((i) => (i.id === id ? { ...i, ...patch } : i));
    emit();
  },
  remove: (id: string) => {
    items = items.filter((i) => i.id !== id);
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function usePatientTreatments(patientId: string) {
  return useSyncExternalStore(
    treatmentPlansStore.subscribe,
    () => items.filter((i) => i.patientId === patientId),
    () => items.filter((i) => i.patientId === patientId),
  );
}
