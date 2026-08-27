import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { onClinicChange, currentClinicId } from "@/lib/clinic-sync";

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

const DEFAULT_SERVICES: Omit<Service, "id">[] = [
  { name: "Consulta y Diagnóstico", category: "Diagnóstico", priceUSD: 20 },
  { name: "Limpieza Ultrasónica", category: "Preventiva", priceUSD: 30 },
  { name: "Resina / Calzadura", category: "Estética", priceUSD: 40 },
  { name: "Extracción Simple", category: "Cirugía", priceUSD: 30 },
  { name: "Tratamiento de Conducto", category: "Endodoncia", priceUSD: 120 },
  { name: "Corona de Porcelana", category: "Prótesis", priceUSD: 250 },
  { name: "Blanqueamiento Dental", category: "Estética", priceUSD: 80 },
  { name: "Ortodoncia (Instalación)", category: "Ortodoncia", priceUSD: 300 },
  { name: "Control de Ortodoncia", category: "Ortodoncia", priceUSD: 25 },
];

type DBService = { id: string; name: string; category: string; price_usd: string | number };

const num = (v: string | number) => (typeof v === "number" ? v : parseFloat(v));

const fromDB = (s: DBService): Service => ({
  id: s.id,
  name: s.name,
  category: (s.category as ServiceCategory) ?? "Otros",
  priceUSD: num(s.price_usd),
});

let services: Service[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function fetchAll() {
  const clinicId = currentClinicId();
  if (!clinicId) { services = []; emit(); return; }
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: true });
  if (error) { console.error("services.fetchAll", error); return; }
  services = (data ?? []).map((d) => fromDB(d as DBService));
  emit();
}

onClinicChange((clinicId) => {
  services = [];
  emit();
  if (clinicId) fetchAll();
});

export const servicesStore = {
  getAll: () => services,
  get: (id: string) => services.find((s) => s.id === id),
  refresh: fetchAll,
  add: async (s: Omit<Service, "id">) => {
    const clinicId = currentClinicId();
    if (!clinicId) return;
    const { data, error } = await supabase
      .from("services")
      .insert({ clinic_id: clinicId, name: s.name, category: s.category, price_usd: s.priceUSD })
      .select()
      .single();
    if (error) { console.error("services.add", error); return; }
    services = [...services, fromDB(data as DBService)];
    emit();
  },
  update: async (id: string, patch: Partial<Service>) => {
    services = services.map((s) => (s.id === id ? { ...s, ...patch } : s));
    emit();
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    if (patch.priceUSD !== undefined) dbPatch.price_usd = patch.priceUSD;
    const { error } = await supabase.from("services").update(dbPatch as never).eq("id", id);
    if (error) console.error("services.update", error);
  },
  remove: async (id: string) => {
    services = services.filter((s) => s.id !== id);
    emit();
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) console.error("services.remove", error);
  },
  reset: async () => {
    const clinicId = currentClinicId();
    if (!clinicId) return;
    await supabase.from("services").delete().eq("clinic_id", clinicId);
    const { error } = await supabase.from("services").insert(
      DEFAULT_SERVICES.map((s) => ({
        clinic_id: clinicId,
        name: s.name,
        category: s.category,
        price_usd: s.priceUSD,
      })),
    );
    if (error) console.error("services.reset", error);
    await fetchAll();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useServices() {
  return useSyncExternalStore(servicesStore.subscribe, () => services, () => services);
}
