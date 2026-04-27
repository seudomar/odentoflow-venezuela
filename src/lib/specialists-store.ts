import { useSyncExternalStore } from "react";

export interface Specialist {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  commissionPct: number; // 0-100
  active: boolean;
}

const DEFAULT: Specialist[] = [
  { id: "sp1", name: "Dra. Laura Méndez", specialty: "Endodoncia", phone: "+58 414-1112233", email: "laura.m@odontoflow.ve", commissionPct: 40, active: true },
  { id: "sp2", name: "Dr. Andrés Rivas", specialty: "Ortodoncia", phone: "+58 412-4445566", email: "andres.r@odontoflow.ve", commissionPct: 45, active: true },
  { id: "sp3", name: "Dra. Sofía Caro", specialty: "Estética dental", phone: "+58 416-7778899", email: "sofia.c@odontoflow.ve", commissionPct: 50, active: true },
];

let specialists: Specialist[] = [...DEFAULT];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const specialistsStore = {
  getAll: () => specialists,
  get: (id: string) => specialists.find((s) => s.id === id),
  add: (s: Omit<Specialist, "id">) => {
    specialists = [...specialists, { ...s, id: `sp${Date.now()}` }];
    emit();
  },
  update: (id: string, patch: Partial<Specialist>) => {
    specialists = specialists.map((s) => (s.id === id ? { ...s, ...patch } : s));
    emit();
  },
  remove: (id: string) => {
    specialists = specialists.filter((s) => s.id !== id);
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useSpecialists() {
  return useSyncExternalStore(specialistsStore.subscribe, () => specialists, () => specialists);
}
