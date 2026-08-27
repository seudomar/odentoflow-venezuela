import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { onClinicChange, currentClinicId } from "@/lib/clinic-sync";

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
  rateValue: number;
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

const DEFAULTS: ClinicSettings = {
  clinicName: "OdontoFlow · Consultorio Dental",
  doctorName: "",
  rif: "",
  address: "",
  phone: "",
  email: "",
  logoDataUrl: "",
  rateSource: "manual",
  rateValue: 36.5,
  legalNote:
    "Presupuesto válido por 15 días. Los precios en bolívares se ajustan según la tasa del día.",
  paymentInstructions: "",
  timezone: "America/Caracas",
  plan: "Profesional",
  planRenewsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
  adminWhatsapp: "584140000000",
};

type DBSettings = {
  clinic_name: string;
  doctor_name: string;
  rif: string;
  address: string;
  phone: string;
  email: string;
  logo_data_url: string;
  rate_source: string;
  rate_value: string | number;
  legal_note: string;
  payment_instructions: string;
  timezone: string;
  plan: string;
  plan_renews_at: string;
  admin_whatsapp: string;
};

const num = (v: string | number) => (typeof v === "number" ? v : parseFloat(v));

const fromDB = (s: DBSettings): ClinicSettings => ({
  clinicName: s.clinic_name || DEFAULTS.clinicName,
  doctorName: s.doctor_name ?? "",
  rif: s.rif ?? "",
  address: s.address ?? "",
  phone: s.phone ?? "",
  email: s.email ?? "",
  logoDataUrl: s.logo_data_url ?? "",
  rateSource: (s.rate_source as RateSource) ?? "manual",
  rateValue: num(s.rate_value ?? 36.5),
  legalNote: s.legal_note ?? "",
  paymentInstructions: s.payment_instructions ?? "",
  timezone: s.timezone || "America/Caracas",
  plan: (s.plan as ClinicSettings["plan"]) ?? "Profesional",
  planRenewsAt: s.plan_renews_at ?? DEFAULTS.planRenewsAt,
  adminWhatsapp: s.admin_whatsapp ?? DEFAULTS.adminWhatsapp,
});

function toDB(p: Partial<ClinicSettings>): Record<string, unknown> {
  const d: Record<string, unknown> = {};
  if (p.clinicName !== undefined) d.clinic_name = p.clinicName;
  if (p.doctorName !== undefined) d.doctor_name = p.doctorName;
  if (p.rif !== undefined) d.rif = p.rif;
  if (p.address !== undefined) d.address = p.address;
  if (p.phone !== undefined) d.phone = p.phone;
  if (p.email !== undefined) d.email = p.email;
  if (p.logoDataUrl !== undefined) d.logo_data_url = p.logoDataUrl;
  if (p.rateSource !== undefined) d.rate_source = p.rateSource;
  if (p.rateValue !== undefined) d.rate_value = p.rateValue;
  if (p.legalNote !== undefined) d.legal_note = p.legalNote;
  if (p.paymentInstructions !== undefined) d.payment_instructions = p.paymentInstructions;
  if (p.timezone !== undefined) d.timezone = p.timezone;
  if (p.plan !== undefined) d.plan = p.plan;
  if (p.planRenewsAt !== undefined) d.plan_renews_at = p.planRenewsAt;
  if (p.adminWhatsapp !== undefined) d.admin_whatsapp = p.adminWhatsapp;
  return d;
}

let state: ClinicSettings = DEFAULTS;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function fetchSettings() {
  const clinicId = currentClinicId();
  if (!clinicId) { state = DEFAULTS; emit(); return; }
  const { data, error } = await supabase
    .from("clinic_settings")
    .select("*")
    .eq("clinic_id", clinicId)
    .maybeSingle();
  if (error) { console.error("clinicSettings.fetch", error); return; }
  if (data) { state = fromDB(data as unknown as DBSettings); emit(); }
}

onClinicChange((clinicId) => {
  state = DEFAULTS;
  emit();
  if (clinicId) fetchSettings();
});

let saveTimer: ReturnType<typeof setTimeout> | undefined;
let pending: Record<string, unknown> = {};

function flush() {
  const clinicId = currentClinicId();
  const payload = pending;
  pending = {};
  if (!clinicId || Object.keys(payload).length === 0) return;
  void supabase
    .from("clinic_settings")
    .upsert({ clinic_id: clinicId, ...payload } as never, { onConflict: "clinic_id" })
    .then(({ error }) => { if (error) console.error("clinicSettings.save", error); });
}

export const clinicSettingsStore = {
  get: () => state,
  refresh: fetchSettings,
  set: (patch: Partial<ClinicSettings>) => {
    state = { ...state, ...patch };
    emit();
    pending = { ...pending, ...toDB(patch) };
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 500);
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
