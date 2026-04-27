import { useSyncExternalStore } from "react";

export type AppointmentStatus = "pendiente" | "confirmado" | "completado" | "cancelado";

export interface Appointment {
  id: string;
  patientId?: string;
  patientName: string;
  patientPhone: string; // E.164 sin "+", ej: 584141234567
  treatment: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
}

export const STATUS_META: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  pendiente: { label: "Pendiente", color: "oklch(0.55 0.15 75)", bg: "oklch(0.75 0.15 75 / 0.18)" },
  confirmado: { label: "Confirmado", color: "oklch(0.5 0.15 155)", bg: "oklch(0.65 0.15 155 / 0.18)" },
  completado: { label: "Completado", color: "oklch(0.45 0.04 250)", bg: "oklch(0.5 0.02 250 / 0.15)" },
  cancelado: { label: "Cancelado", color: "oklch(0.55 0.22 25)", bg: "oklch(0.6 0.22 25 / 0.15)" },
};

const today = () => new Date().toISOString().slice(0, 10);
const inDays = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().slice(0, 10);
};

let appointments: Appointment[] = [
  { id: "a1", patientId: "p1", patientName: "María González", patientPhone: "584141234567", treatment: "Limpieza dental", date: today(), time: "09:00", status: "confirmado" },
  { id: "a2", patientId: "p2", patientName: "Carlos Pérez", patientPhone: "584127654321", treatment: "Endodoncia · Sesión 2", date: today(), time: "10:30", status: "confirmado" },
  { id: "a3", patientId: "p3", patientName: "Ana Rodríguez", patientPhone: "584249988776", treatment: "Consulta inicial", date: today(), time: "12:00", status: "pendiente" },
  { id: "a4", patientId: "p4", patientName: "Luis Hernández", patientPhone: "584163344556", treatment: "Blanqueamiento", date: today(), time: "14:30", status: "pendiente" },
  { id: "a5", patientName: "Sofía Martínez", patientPhone: "584145556677", treatment: "Ortodoncia · Control", date: today(), time: "16:00", status: "confirmado" },
  { id: "a6", patientId: "p1", patientName: "María González", patientPhone: "584141234567", treatment: "Control post-limpieza", date: inDays(1), time: "11:00", status: "pendiente" },
  { id: "a7", patientId: "p2", patientName: "Carlos Pérez", patientPhone: "584127654321", treatment: "Endodoncia · Sesión 3", date: inDays(2), time: "09:30", status: "confirmado" },
  { id: "a8", patientName: "Pedro Linares", patientPhone: "584142223344", treatment: "Extracción", date: inDays(3), time: "15:00", status: "pendiente" },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const appointmentsStore = {
  getAll: () => appointments,
  add: (a: Omit<Appointment, "id">) => {
    appointments = [...appointments, { ...a, id: `a${Date.now()}` }];
    emit();
  },
  update: (id: string, patch: Partial<Appointment>) => {
    appointments = appointments.map((a) => (a.id === id ? { ...a, ...patch } : a));
    emit();
  },
  remove: (id: string) => {
    appointments = appointments.filter((a) => a.id !== id);
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useAppointments() {
  return useSyncExternalStore(
    appointmentsStore.subscribe,
    () => appointments,
    () => appointments,
  );
}

export function buildWhatsAppLink(a: Appointment) {
  const formatted = new Date(a.date + "T00:00:00").toLocaleDateString("es-VE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const msg = `Hola ${a.patientName}, le recordamos su cita para el día ${formatted} a las ${a.time}. Por favor confirme su asistencia.`;
  const phone = a.patientPhone.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}
