import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { authStore } from "@/lib/auth-store";

export type ToothStatus = "sano" | "caries" | "tratado" | "ausente";

export interface PatientFile {
  id: string;
  name: string;
  type: string;
  dataUrl: string;
  uploadedAt: string;
}

export interface Patient {
  id: string;
  name: string;
  cedula: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: "M" | "F" | "Otro";
  address: string;
  lastVisit: string;
  history: string;
  files: PatientFile[];
  teeth: Record<number, ToothStatus>;
}

export const TOOTH_NUMBERS = [
  ...Array.from({ length: 8 }, (_, i) => 18 - i),
  ...Array.from({ length: 8 }, (_, i) => 21 + i),
  ...Array.from({ length: 8 }, (_, i) => 48 - i),
  ...Array.from({ length: 8 }, (_, i) => 31 + i),
];

export const STATUS_META: Record<ToothStatus, { label: string; color: string; bg: string }> = {
  sano: { label: "Sano", color: "oklch(0.65 0.15 155)", bg: "oklch(0.65 0.15 155 / 0.15)" },
  caries: { label: "Caries", color: "oklch(0.6 0.22 25)", bg: "oklch(0.6 0.22 25 / 0.15)" },
  tratado: { label: "Tratado", color: "oklch(0.58 0.18 245)", bg: "oklch(0.58 0.18 245 / 0.15)" },
  ausente: { label: "Ausente", color: "oklch(0.5 0.02 250)", bg: "oklch(0.5 0.02 250 / 0.15)" },
};

const initialTeeth = (): Record<number, ToothStatus> =>
  Object.fromEntries(TOOTH_NUMBERS.map((n) => [n, "sano" as ToothStatus]));

// ---------- Mapper DB <-> UI ----------
type DBPatient = {
  id: string;
  name: string;
  cedula: string | null;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  gender: string | null;
  address: string | null;
  history: string | null;
  last_visit: string | null;
  teeth: Record<string, ToothStatus> | null;
  files: PatientFile[] | null;
};

function fromDB(p: DBPatient): Patient {
  const teeth = initialTeeth();
  if (p.teeth) for (const [k, v] of Object.entries(p.teeth)) teeth[Number(k)] = v;
  return {
    id: p.id,
    name: p.name,
    cedula: p.cedula ?? "",
    phone: p.phone ?? "",
    email: p.email ?? "",
    birthDate: p.birth_date ?? "",
    gender: (p.gender as Patient["gender"]) ?? "Otro",
    address: p.address ?? "",
    lastVisit: p.last_visit ?? "",
    history: p.history ?? "",
    files: p.files ?? [],
    teeth,
  };
}

// ---------- Estado ----------
let patients: Patient[] = [];
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function fetchAll() {
  const { clinicId } = authStore.get();
  if (!clinicId) { patients = []; loaded = true; emit(); return; }
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false });
  if (error) { console.error("patients.fetchAll", error); return; }
  patients = (data ?? []).map((d) => fromDB(d as DBPatient));
  loaded = true;
  emit();
}

// recargar cuando cambia clinicId
let lastClinicId: string | null = null;
authStore.subscribe(() => {
  const { clinicId } = authStore.get();
  if (clinicId !== lastClinicId) {
    lastClinicId = clinicId;
    loaded = false;
    patients = [];
    emit();
    if (clinicId) fetchAll();
  }
});

export const patientsStore = {
  getAll: () => patients,
  get: (id: string) => patients.find((p) => p.id === id),
  isLoaded: () => loaded,
  refresh: fetchAll,
  add: async (
    p: Omit<Patient, "id" | "files" | "teeth" | "history" | "lastVisit"> & Partial<Patient>,
  ) => {
    const { clinicId } = authStore.get();
    if (!clinicId) throw new Error("Sin clínica activa");
    const { data, error } = await supabase
      .from("patients")
      .insert({
        clinic_id: clinicId,
        name: p.name,
        cedula: p.cedula ?? "",
        phone: p.phone ?? "",
        email: p.email ?? "",
        birth_date: p.birthDate || null,
        gender: p.gender ?? "Otro",
        address: p.address ?? "",
        history: p.history ?? "",
        last_visit: p.lastVisit ?? new Date().toISOString().slice(0, 10),
        teeth: {},
        files: [],
      })
      .select()
      .single();
    if (error) throw error;
    const np = fromDB(data as DBPatient);
    patients = [np, ...patients];
    emit();
    return np.id;
  },
  update: async (id: string, patch: Partial<Patient>) => {
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.cedula !== undefined) dbPatch.cedula = patch.cedula;
    if (patch.phone !== undefined) dbPatch.phone = patch.phone;
    if (patch.email !== undefined) dbPatch.email = patch.email;
    if (patch.birthDate !== undefined) dbPatch.birth_date = patch.birthDate || null;
    if (patch.gender !== undefined) dbPatch.gender = patch.gender;
    if (patch.address !== undefined) dbPatch.address = patch.address;
    if (patch.history !== undefined) dbPatch.history = patch.history;
    if (patch.lastVisit !== undefined) dbPatch.last_visit = patch.lastVisit || null;
    if (patch.teeth !== undefined) dbPatch.teeth = patch.teeth;
    if (patch.files !== undefined) dbPatch.files = patch.files;
    patients = patients.map((p) => (p.id === id ? { ...p, ...patch } : p));
    emit();
    const { error } = await supabase.from("patients").update(dbPatch).eq("id", id);
    if (error) console.error("patients.update", error);
  },
  setTooth: async (id: string, tooth: number, status: ToothStatus) => {
    const target = patients.find((p) => p.id === id);
    if (!target) return;
    const newTeeth = { ...target.teeth, [tooth]: status };
    patients = patients.map((p) => (p.id === id ? { ...p, teeth: newTeeth } : p));
    emit();
    const { error } = await supabase.from("patients").update({ teeth: newTeeth }).eq("id", id);
    if (error) console.error("patients.setTooth", error);
  },
  addFile: async (id: string, file: PatientFile) => {
    const target = patients.find((p) => p.id === id);
    if (!target) return;
    const newFiles = [file, ...target.files];
    patients = patients.map((p) => (p.id === id ? { ...p, files: newFiles } : p));
    emit();
    await supabase.from("patients").update({ files: newFiles }).eq("id", id);
  },
  removeFile: async (id: string, fileId: string) => {
    const target = patients.find((p) => p.id === id);
    if (!target) return;
    const newFiles = target.files.filter((f) => f.id !== fileId);
    patients = patients.map((p) => (p.id === id ? { ...p, files: newFiles } : p));
    emit();
    await supabase.from("patients").update({ files: newFiles }).eq("id", id);
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function usePatients() {
  return useSyncExternalStore(patientsStore.subscribe, () => patients, () => patients);
}

export function usePatient(id: string) {
  return useSyncExternalStore(
    patientsStore.subscribe,
    () => patients.find((p) => p.id === id),
    () => patients.find((p) => p.id === id),
  );
}
