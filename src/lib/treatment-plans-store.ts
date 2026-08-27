import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { onClinicChange, currentClinicId } from "@/lib/clinic-sync";

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
  commissionStatus?: CommissionStatus;
  commissionPaidAt?: string;
}

type DBItem = {
  id: string;
  patient_id: string;
  service_id: string | null;
  name: string;
  price_usd: string | number;
  status: string;
  notes: string | null;
  specialist_id: string | null;
  commission_status: string | null;
  commission_paid_at: string | null;
  created_at: string;
};

const num = (v: string | number) => (typeof v === "number" ? v : parseFloat(v));

const fromDB = (i: DBItem): TreatmentItem => ({
  id: i.id,
  patientId: i.patient_id,
  serviceId: i.service_id ?? "",
  name: i.name,
  priceUSD: num(i.price_usd),
  status: (i.status as TreatmentStatus) ?? "Pendiente",
  createdAt: i.created_at,
  notes: i.notes ?? undefined,
  specialistId: i.specialist_id ?? undefined,
  commissionStatus: (i.commission_status as CommissionStatus) ?? undefined,
  commissionPaidAt: i.commission_paid_at ?? undefined,
});

let items: TreatmentItem[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function fetchAll() {
  const clinicId = currentClinicId();
  if (!clinicId) { items = []; emit(); return; }
  const { data, error } = await supabase
    .from("treatment_items")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: true });
  if (error) { console.error("treatments.fetchAll", error); return; }
  items = (data ?? []).map((d) => fromDB(d as DBItem));
  emit();
}

onClinicChange((clinicId) => {
  items = [];
  emit();
  if (clinicId) fetchAll();
});

export const treatmentPlansStore = {
  getAll: () => items,
  getByPatient: (patientId: string) => items.filter((i) => i.patientId === patientId),
  refresh: fetchAll,
  add: async (i: Omit<TreatmentItem, "id" | "createdAt">) => {
    const clinicId = currentClinicId();
    if (!clinicId) return;
    const { data, error } = await supabase
      .from("treatment_items")
      .insert({
        clinic_id: clinicId,
        patient_id: i.patientId,
        service_id: i.serviceId || null,
        name: i.name,
        price_usd: i.priceUSD,
        status: i.status,
        notes: i.notes ?? null,
        specialist_id: i.specialistId ?? null,
        commission_status: i.specialistId ? (i.commissionStatus ?? "Pendiente") : null,
      })
      .select()
      .single();
    if (error) { console.error("treatments.add", error); return; }
    items = [...items, fromDB(data as DBItem)];
    emit();
  },
  update: async (id: string, patch: Partial<TreatmentItem>) => {
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.priceUSD !== undefined) dbPatch.price_usd = patch.priceUSD;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.notes !== undefined) dbPatch.notes = patch.notes ?? null;
    if ("specialistId" in patch) {
      dbPatch.specialist_id = patch.specialistId ?? null;
      if (patch.specialistId) {
        const prev = items.find((i) => i.id === id);
        if (!prev?.commissionStatus) dbPatch.commission_status = "Pendiente";
      } else {
        dbPatch.commission_status = null;
        dbPatch.commission_paid_at = null;
      }
    }

    items = items.map((i) => {
      if (i.id !== id) return i;
      const next: TreatmentItem = { ...i, ...patch };
      if (patch.specialistId && !i.commissionStatus) next.commissionStatus = "Pendiente";
      if ("specialistId" in patch && !patch.specialistId) {
        next.commissionStatus = undefined;
        next.commissionPaidAt = undefined;
      }
      return next;
    });
    emit();

    const { error } = await supabase.from("treatment_items").update(dbPatch as never).eq("id", id);
    if (error) console.error("treatments.update", error);
  },
  setCommissionStatus: async (id: string, status: CommissionStatus) => {
    const paidAt = status === "Pagada" ? new Date().toISOString() : null;
    items = items.map((i) =>
      i.id === id ? { ...i, commissionStatus: status, commissionPaidAt: paidAt ?? undefined } : i,
    );
    emit();
    const { error } = await supabase
      .from("treatment_items")
      .update({ commission_status: status, commission_paid_at: paidAt } as never)
      .eq("id", id);
    if (error) console.error("treatments.setCommissionStatus", error);
  },
  remove: async (id: string) => {
    items = items.filter((i) => i.id !== id);
    emit();
    const { error } = await supabase.from("treatment_items").delete().eq("id", id);
    if (error) console.error("treatments.remove", error);
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
