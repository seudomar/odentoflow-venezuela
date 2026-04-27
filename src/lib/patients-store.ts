import { useSyncExternalStore } from "react";

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

// Numeración FDI simplificada: 32 dientes (1-8 por cuadrante)
export const TOOTH_NUMBERS = [
  ...Array.from({ length: 8 }, (_, i) => 18 - i), // 18..11
  ...Array.from({ length: 8 }, (_, i) => 21 + i), // 21..28
  ...Array.from({ length: 8 }, (_, i) => 48 - i), // 48..41
  ...Array.from({ length: 8 }, (_, i) => 31 + i), // 31..38
];

export const STATUS_META: Record<ToothStatus, { label: string; color: string; bg: string }> = {
  sano: { label: "Sano", color: "oklch(0.65 0.15 155)", bg: "oklch(0.65 0.15 155 / 0.15)" },
  caries: { label: "Caries", color: "oklch(0.6 0.22 25)", bg: "oklch(0.6 0.22 25 / 0.15)" },
  tratado: { label: "Tratado", color: "oklch(0.58 0.18 245)", bg: "oklch(0.58 0.18 245 / 0.15)" },
  ausente: { label: "Ausente", color: "oklch(0.5 0.02 250)", bg: "oklch(0.5 0.02 250 / 0.15)" },
};

const initialTeeth = (): Record<number, ToothStatus> =>
  Object.fromEntries(TOOTH_NUMBERS.map((n) => [n, "sano" as ToothStatus]));

let patients: Patient[] = [
  {
    id: "p1",
    name: "María González",
    cedula: "V-15.234.567",
    phone: "+58 414-1234567",
    email: "maria.g@email.com",
    birthDate: "1985-04-12",
    gender: "F",
    address: "Av. Francisco de Miranda, Caracas",
    lastVisit: "2025-04-22",
    history: "Paciente con historial de gingivitis leve. Última limpieza profesional realizada en marzo. Refiere sensibilidad ocasional al frío en molares superiores derechos.",
    files: [],
    teeth: { ...initialTeeth(), 16: "caries", 26: "tratado" },
  },
  {
    id: "p2",
    name: "Carlos Pérez",
    cedula: "V-12.456.789",
    phone: "+58 412-7654321",
    email: "cperez@email.com",
    birthDate: "1978-09-03",
    gender: "M",
    address: "Urb. La Trinidad, Caracas",
    lastVisit: "2025-04-25",
    history: "Endodoncia en pieza 36 en curso. Segunda sesión programada. Sin alergias conocidas.",
    files: [],
    teeth: { ...initialTeeth(), 36: "tratado", 37: "caries" },
  },
  {
    id: "p3",
    name: "Ana Rodríguez",
    cedula: "V-20.111.333",
    phone: "+58 424-9988776",
    email: "ana.r@email.com",
    birthDate: "1995-11-20",
    gender: "F",
    address: "Los Palos Grandes, Caracas",
    lastVisit: "2025-04-26",
    history: "Primera consulta. Solicita evaluación para ortodoncia.",
    files: [],
    teeth: initialTeeth(),
  },
  {
    id: "p4",
    name: "Luis Hernández",
    cedula: "V-18.555.222",
    phone: "+58 416-3344556",
    email: "luish@email.com",
    birthDate: "1990-02-15",
    gender: "M",
    address: "El Hatillo, Caracas",
    lastVisit: "2025-04-20",
    history: "Blanqueamiento dental en proceso. Sin patologías relevantes.",
    files: [],
    teeth: initialTeeth(),
  },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const patientsStore = {
  getAll: () => patients,
  get: (id: string) => patients.find((p) => p.id === id),
  add: (p: Omit<Patient, "id" | "files" | "teeth" | "history" | "lastVisit"> & Partial<Patient>) => {
    const id = `p${Date.now()}`;
    patients = [
      {
        id,
        files: [],
        teeth: initialTeeth(),
        history: "",
        lastVisit: new Date().toISOString().slice(0, 10),
        ...p,
      } as Patient,
      ...patients,
    ];
    emit();
    return id;
  },
  update: (id: string, patch: Partial<Patient>) => {
    patients = patients.map((p) => (p.id === id ? { ...p, ...patch } : p));
    emit();
  },
  setTooth: (id: string, tooth: number, status: ToothStatus) => {
    patients = patients.map((p) =>
      p.id === id ? { ...p, teeth: { ...p.teeth, [tooth]: status } } : p,
    );
    emit();
  },
  addFile: (id: string, file: PatientFile) => {
    patients = patients.map((p) => (p.id === id ? { ...p, files: [file, ...p.files] } : p));
    emit();
  },
  removeFile: (id: string, fileId: string) => {
    patients = patients.map((p) =>
      p.id === id ? { ...p, files: p.files.filter((f) => f.id !== fileId) } : p,
    );
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function usePatients() {
  return useSyncExternalStore(
    patientsStore.subscribe,
    () => patients,
    () => patients,
  );
}

export function usePatient(id: string) {
  return useSyncExternalStore(
    patientsStore.subscribe,
    () => patients.find((p) => p.id === id),
    () => patients.find((p) => p.id === id),
  );
}
