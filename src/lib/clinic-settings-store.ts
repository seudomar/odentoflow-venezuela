import { useSyncExternalStore } from "react";

export type RateSource = "manual" | "bcv";

export interface ClinicSettings {
  // Perfil
  clinicName: string;
  doctorName: string;
  rif: string;
  address: string;
  phone: string;
  email: string;
  logoDataUrl: string; // base64 data URL
  // Tasa
  rateSource: RateSource;
  // Documentos
  legalNote: string;
  paymentInstructions: string;
  // Cuenta
  timezone: string;
  // Suscripción
  plan: "Inicial" | "Profesional" | "Clínica";
  planRenewsAt: string; // ISO date
  adminWhatsapp: string; // sin "+"
}

const STORAGE_KEY = "odontoflow.clinic.settings.v1";

const DEFAULTS: ClinicSettings = {
  clinicName: "OdontoFlow · Consultorio Dental",
  doctorName: "Dr. Carlos Mendoza",
  rif: "J-12345678-9",
  address: "Av. Francisco de Miranda, Caracas, Venezuela",
  phone: "+58 212-555-1234",
  email: "contacto@odontoflow.ve",
  logoDataUrl: "",
  rateSource: "manual",
  legalNote:
    "Presupuesto válido por 15 días. Los precios en bolívares se ajustan según la tasa del día.",
  paymentInstructions:
    "Pago Móvil: 0414-1234567 · Banco Mercantil · CI V-12.345.678\nZelle: pagos@odontoflow.ve",
  timezone: "America/Caracas",
  plan: "Profesional",
  planRenewsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
  adminWhatsapp: "584140000000",
};

function load(): ClinicSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

let state: ClinicSettings = load();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota */
    }
  }
}

export const clinicSettingsStore = {
  get: () => state,
  set: (patch: Partial<ClinicSettings>) => {
    state = { ...state, ...patch };
    persist();
    listeners.forEach((l) => l());
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useClinicSettings(): [
  ClinicSettings,
  (patch: Partial<ClinicSettings>) => void,
] {
  const value = useSyncExternalStore(
    clinicSettingsStore.subscribe,
    () => state,
    () => state,
  );
  return [value, clinicSettingsStore.set];
}
