import { useSyncExternalStore } from "react";

export type TreatmentStatus = "Pendiente" | "En curso" | "Finalizado";
export type CommissionStatus = "Pendiente" | "Pagada";

export const TREATMENT_STATUSES: TreatmentStatus[] = ["Pendiente", "En curso", "Finalizado"];
export const COMMISSION_STATUSES: CommissionStatus[] = ["Pendiente", "Pagada"];

export interface TreatmentItem {
  id: string;
  patientId: string;
  serviceId: string;
  name: string;
  priceUSD: number;
  status: TreatmentStatus;
  createdAt: string;
  notes?: string;
  specialistId?: string;
  commissionStatus?: CommissionStatus; // por defecto "Pendiente" cuando hay specialistId
  commissionPaidAt?: string;
}

let items: TreatmentItem[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const treatmentPlansStore = {
  getAll: () => items,
  getByPatient: (patientId: string) => items.filter((i) => i.patientId === patientId),
  add: (i: Omit<TreatmentItem, "id" | "createdAt">) => {
    items = [
      ...items,
      {
        ...i,
        commissionStatus: i.specialistId ? (i.commissionStatus ?? "Pendiente") : i.commissionStatus,
        id: `t${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
      },
    ];
    emit();
  },
  update: (id: string, patch: Partial<TreatmentItem>) => {
    items = items.map((i) => {
      if (i.id !== id) return i;
      const next = { ...i, ...patch };
      // Si se asigna especialista por primera vez, inicializa el estado de comisión
      if (patch.specialistId && !i.commissionStatus) next.commissionStatus = "Pendiente";
      // Si se quita el especialista, limpia el estado
      if (patch.specialistId === undefined && "specialistId" in patch) {
        next.commissionStatus = undefined;
        next.commissionPaidAt = undefined;
      }
      return next;
    });
    emit();
  },
  setCommissionStatus: (id: string, status: CommissionStatus) => {
    items = items.map((i) =>
      i.id === id
        ? { ...i, commissionStatus: status, commissionPaidAt: status === "Pagada" ? new Date().toISOString() : undefined }
        : i,
    );
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

export function useAllTreatments() {
  return useSyncExternalStore(treatmentPlansStore.subscribe, () => items, () => items);
}
