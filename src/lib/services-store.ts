import { useSyncExternalStore } from "react";

export type ServiceCategory =
  | "Diagnóstico"
  | "Preventiva"
  | "Estética"
  | "Cirugía"
  | "Endodoncia"
  | "Prótesis"
  | "Ortodoncia"
  | "Otros";

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "Diagnóstico",
  "Preventiva",
  "Estética",
  "Cirugía",
  "Endodoncia",
  "Prótesis",
  "Ortodoncia",
  "Otros",
];

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  priceUSD: number;
}

const DEFAULT_SERVICES: Service[] = [
  { id: "s1", name: "Consulta y Diagnóstico", category: "Diagnóstico", priceUSD: 20 },
  { id: "s2", name: "Limpieza Ultrasónica", category: "Preventiva", priceUSD: 30 },
  { id: "s3", name: "Resina / Calzadura", category: "Estética", priceUSD: 40 },
  { id: "s4", name: "Extracción Simple", category: "Cirugía", priceUSD: 30 },
  { id: "s5", name: "Tratamiento de Conducto", category: "Endodoncia", priceUSD: 120 },
  { id: "s6", name: "Corona de Porcelana", category: "Prótesis", priceUSD: 250 },
  { id: "s7", name: "Blanqueamiento Dental", category: "Estética", priceUSD: 80 },
  { id: "s8", name: "Ortodoncia (Instalación)", category: "Ortodoncia", priceUSD: 300 },
  { id: "s9", name: "Control de Ortodoncia", category: "Ortodoncia", priceUSD: 25 },
];

let services: Service[] = [...DEFAULT_SERVICES];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const servicesStore = {
  getAll: () => services,
  get: (id: string) => services.find((s) => s.id === id),
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
