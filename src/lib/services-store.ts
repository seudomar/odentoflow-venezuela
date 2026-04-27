import { useSyncExternalStore } from "react";

export interface Service {
  id: string;
  name: string;
  priceUSD: number;
}

const DEFAULT_SERVICES: Service[] = [
  { id: "s1", name: "Consulta y Diagnóstico", priceUSD: 20 },
  { id: "s2", name: "Limpieza Ultrasónica / Profunda", priceUSD: 30 },
  { id: "s3", name: "Resina Fotocurado (Calzadura)", priceUSD: 40 },
  { id: "s4", name: "Extracción Simple", priceUSD: 30 },
  { id: "s5", name: "Tratamiento de Conducto / Endodoncia", priceUSD: 120 },
  { id: "s6", name: "Corona de Porcelana / Zirconio", priceUSD: 250 },
  { id: "s7", name: "Blanqueamiento Dental", priceUSD: 80 },
  { id: "s8", name: "Ortodoncia (Instalación)", priceUSD: 300 },
  { id: "s9", name: "Control de Ortodoncia", priceUSD: 25 },
];

let services: Service[] = [...DEFAULT_SERVICES];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const servicesStore = {
  getAll: () => services,
  add: (s: Omit<Service, "id">) => {
    services = [...services, { ...s, id: `s${Date.now()}` }];
    emit();
  },
  update: (id: string, patch: Partial<Service>) => {
    services = services.map((s) => (s.id === id ? { ...s, ...patch } : s));
    emit();
  },
  remove: (id: string) => {
    services = services.filter((s) => s.id !== id);
    emit();
  },
  reset: () => {
    services = [...DEFAULT_SERVICES];
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useServices() {
  return useSyncExternalStore(servicesStore.subscribe, () => services, () => services);
}
