import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { onClinicChange, currentClinicId } from "@/lib/clinic-sync";

export interface Specialist {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  commissionPct: number; // 0-100
  active: boolean;
}

type DBSpecialist = {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  commission_pct: string | number;
  active: boolean;
};

const num = (v: string | number) => (typeof v === "number" ? v : parseFloat(v));

const fromDB = (s: DBSpecialist): Specialist => ({
  id: s.id,
  name: s.name,
  specialty: s.specialty ?? "",
  phone: s.phone ?? "",
  email: s.email ?? "",
  commissionPct: num(s.commission_pct),
  active: s.active,
});

let specialists: Specialist[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function fetchAll() {
  const clinicId = currentClinicId();
  if (!clinicId) { specialists = []; emit(); return; }
  const { data, error } = await supabase
    .from("specialists")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: true });
  if (error) { console.error("specialists.fetchAll", error); return; }
  specialists = (data ?? []).map((d) => fromDB(d as DBSpecialist));
  emit();
}

onClinicChange((clinicId) => {
  specialists = [];
  emit();
  if (clinicId) fetchAll();
});

export const specialistsStore = {
  getAll: () => specialists,
  get: (id: string) => specialists.find((s) => s.id === id),
  refresh: fetchAll,
  add: async (s: Omit<Specialist, "id">) => {
    const clinicId = currentClinicId();
    if (!clinicId) return;
    const { data, error } = await supabase
      .from("specialists")
      .insert({
        clinic_id: clinicId,
        name: s.name,
        specialty: s.specialty,
        phone: s.phone,
        email: s.email,
        commission_pct: s.commissionPct,
        active: s.active,
      })
      .select()
      .single();
    if (error) { console.error("specialists.add", error); return; }
    specialists = [...specialists, fromDB(data as DBSpecialist)];
    emit();
  },
  update: async (id: string, patch: Partial<Specialist>) => {
    specialists = specialists.map((s) => (s.id === id ? { ...s, ...patch } : s));
    emit();
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.specialty !== undefined) dbPatch.specialty = patch.specialty;
    if (patch.phone !== undefined) dbPatch.phone = patch.phone;
    if (patch.email !== undefined) dbPatch.email = patch.email;
    if (patch.commissionPct !== undefined) dbPatch.commission_pct = patch.commissionPct;
    if (patch.active !== undefined) dbPatch.active = patch.active;
    const { error } = await supabase.from("specialists").update(dbPatch as never).eq("id", id);
    if (error) console.error("specialists.update", error);
  },
  remove: async (id: string) => {
    specialists = specialists.filter((s) => s.id !== id);
    emit();
    const { error } = await supabase.from("specialists").delete().eq("id", id);
    if (error) console.error("specialists.remove", error);
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useSpecialists() {
  return useSyncExternalStore(specialistsStore.subscribe, () => specialists, () => specialists);
}
