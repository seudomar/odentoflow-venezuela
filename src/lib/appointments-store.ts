import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { authStore } from "@/lib/auth-store";

export type AppointmentStatus = "pendiente" | "confirmado" | "completado" | "cancelado";

export interface Appointment {
  id: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  treatment: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  paymentAccountId?: string;
}

export const STATUS_META: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  pendiente: { label: "Pendiente", color: "oklch(0.55 0.15 75)", bg: "oklch(0.75 0.15 75 / 0.18)" },
  confirmado: { label: "Confirmado", color: "oklch(0.5 0.15 155)", bg: "oklch(0.65 0.15 155 / 0.18)" },
  completado: { label: "Completado", color: "oklch(0.45 0.04 250)", bg: "oklch(0.5 0.02 250 / 0.15)" },
  cancelado: { label: "Cancelado", color: "oklch(0.55 0.22 25)", bg: "oklch(0.6 0.22 25 / 0.15)" },
};

type DBAppt = {
  id: string;
  patient_id: string | null;
  patient_name: string;
  patient_phone: string;
  treatment: string;
  appt_date: string;
  appt_time: string;
  status: AppointmentStatus;
  notes: string | null;
  payment_account_id: string | null;
};

function fromDB(a: DBAppt): Appointment {
  return {
    id: a.id,
    patientId: a.patient_id ?? undefined,
    patientName: a.patient_name,
    patientPhone: a.patient_phone,
    treatment: a.treatment,
    date: a.appt_date,
    time: a.appt_time?.slice(0, 5) ?? "",
    status: a.status,
    notes: a.notes ?? undefined,
    paymentAccountId: a.payment_account_id ?? undefined,
  };
}

let appointments: Appointment[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function fetchAll() {
  const { clinicId } = authStore.get();
  if (!clinicId) { appointments = []; emit(); return; }
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("appt_date", { ascending: true })
    .order("appt_time", { ascending: true });
  if (error) { console.error("appointments.fetchAll", error); return; }
  appointments = (data ?? []).map((d) => fromDB(d as DBAppt));
  emit();
}

let lastClinicId: string | null = null;
authStore.subscribe(() => {
  const { clinicId } = authStore.get();
  if (clinicId !== lastClinicId) {
    lastClinicId = clinicId;
    appointments = [];
    emit();
    if (clinicId) fetchAll();
  }
});

export const appointmentsStore = {
  getAll: () => appointments,
  refresh: fetchAll,
  add: async (a: Omit<Appointment, "id">) => {
    const { clinicId } = authStore.get();
    if (!clinicId) throw new Error("Sin clínica activa");
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        clinic_id: clinicId,
        patient_id: a.patientId ?? null,
        patient_name: a.patientName,
        patient_phone: a.patientPhone,
        treatment: a.treatment,
        appt_date: a.date,
        appt_time: a.time,
        status: a.status,
        notes: a.notes ?? null,
        payment_account_id: a.paymentAccountId ?? null,
      })
      .select()
      .single();
    if (error) { console.error(error); throw error; }
    appointments = [...appointments, fromDB(data as DBAppt)].sort((x, y) =>
      (x.date + x.time).localeCompare(y.date + y.time),
    );
    emit();
  },
  update: async (id: string, patch: Partial<Appointment>) => {
    const dbPatch: Record<string, unknown> = {};
    if (patch.patientId !== undefined) dbPatch.patient_id = patch.patientId ?? null;
    if (patch.patientName !== undefined) dbPatch.patient_name = patch.patientName;
    if (patch.patientPhone !== undefined) dbPatch.patient_phone = patch.patientPhone;
    if (patch.treatment !== undefined) dbPatch.treatment = patch.treatment;
    if (patch.date !== undefined) dbPatch.appt_date = patch.date;
    if (patch.time !== undefined) dbPatch.appt_time = patch.time;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.notes !== undefined) dbPatch.notes = patch.notes ?? null;
    if (patch.paymentAccountId !== undefined) dbPatch.payment_account_id = patch.paymentAccountId ?? null;
    appointments = appointments.map((a) => (a.id === id ? { ...a, ...patch } : a));
    emit();
    const { error } = await supabase.from("appointments").update(dbPatch as never).eq("id", id);
    if (error) console.error("appointments.update", error);
  },
  remove: async (id: string) => {
    appointments = appointments.filter((a) => a.id !== id);
    emit();
    await supabase.from("appointments").delete().eq("id", id);
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useAppointments() {
  return useSyncExternalStore(appointmentsStore.subscribe, () => appointments, () => appointments);
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
