import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PatientLayout } from "@/components/PatientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MessageCircle,
  Trash2,
  CalendarDays,
} from "lucide-react";
import {
  appointmentsStore,
  buildWhatsAppLink,
  STATUS_META,
  useAppointments,
  type Appointment,
  type AppointmentStatus,
} from "@/lib/appointments-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/citas")({
  head: () => ({
    meta: [
      { title: "Calendario de citas — OdontoFlow" },
      { name: "description", content: "Gestiona las citas y envía recordatorios por WhatsApp." },
    ],
  }),
  component: CitasPage,
});

const toISO = (d: Date) => {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
};

function CitasPage() {
  const all = useAppointments();
  const [selected, setSelected] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const selectedISO = toISO(selected);
  const dayAppts = useMemo(
    () => all.filter((a) => a.date === selectedISO).sort((x, y) => x.time.localeCompare(y.time)),
    [all, selectedISO],
  );

  const datesWithAppts = useMemo(() => {
    const set = new Set(all.map((a) => a.date));
    return Array.from(set).map((d) => new Date(d + "T12:00:00"));
  }, [all]);

  const shift = (n: number) => {
    const d = new Date(selected);
    d.setDate(d.getDate() + n);
    setSelected(d);
  };

  const formattedDay = selected.toLocaleDateString("es-VE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">Calendario de citas</h2>
            <p className="text-sm text-muted-foreground">{all.length} citas en agenda</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Nueva cita</Button>
            </DialogTrigger>
            <NewAppointmentDialog defaultDate={selectedISO} onDone={() => setOpen(false)} />
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
          {/* Calendar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4 text-primary" /> Agenda
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center p-3">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={(d) => d && setSelected(d)}
                modifiers={{ hasAppt: datesWithAppts }}
                modifiersClassNames={{
                  hasAppt: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary",
                }}
                className={cn("p-2 pointer-events-auto")}
              />
            </CardContent>
          </Card>

          {/* Day appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base capitalize">{formattedDay}</CardTitle>
                <p className="text-xs text-muted-foreground">{dayAppts.length} citas programadas</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => shift(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => setSelected(new Date())}>
                  Hoy
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => shift(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {dayAppts.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-border/60 p-10 text-center">
                  <Clock className="mx-auto h-7 w-7 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">Sin citas en este día</p>
                </div>
              ) : (
                dayAppts.map((a) => <AppointmentRow key={a.id} appt={a} />)
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PatientLayout>
  );
}

function AppointmentRow({ appt }: { appt: Appointment }) {
  const meta = STATUS_META[appt.status];
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center">
      <div className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
        <Clock className="h-3 w-3" />
        <span className="text-sm font-bold">{appt.time}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium text-foreground">{appt.patientName}</p>
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{ background: meta.bg, color: meta.color }}
          >
            {meta.label}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">{appt.treatment}</p>
        <p className="truncate text-[11px] text-muted-foreground/80">{appt.patientPhone ? `+${appt.patientPhone}` : "Sin teléfono"}</p>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={appt.status}
          onValueChange={(v) => appointmentsStore.update(appt.id, { status: v as AppointmentStatus })}
        >
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(STATUS_META) as AppointmentStatus[]).map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: STATUS_META[s].color }} />
                  {STATUS_META[s].label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          asChild
          size="icon"
          className="h-9 w-9 shrink-0 bg-[oklch(0.7_0.17_150)] text-white hover:bg-[oklch(0.62_0.17_150)]"
          title="Enviar recordatorio por WhatsApp"
          disabled={!appt.patientPhone}
        >
          <a href={buildWhatsAppLink(appt)} target="_blank" rel="noreferrer" aria-label="WhatsApp">
            <WhatsAppIcon className="h-4 w-4" />
          </a>
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 text-muted-foreground hover:text-destructive"
          onClick={() => appointmentsStore.remove(appt.id)}
          title="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.05 4.91A10 10 0 0 0 12 2C6.48 2 2 6.48 2 12c0 1.76.46 3.45 1.32 4.95L2 22l5.25-1.38A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10 0-2.67-1.04-5.18-2.95-7.09ZM12 20.27a8.27 8.27 0 0 1-4.21-1.15l-.3-.18-3.12.82.83-3.04-.2-.31A8.27 8.27 0 1 1 20.27 12 8.28 8.28 0 0 1 12 20.27Zm4.52-6.18c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.04-.38-1.99-1.22-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.49-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.55.12.16 1.73 2.65 4.2 3.71.59.25 1.05.4 1.4.51.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.14-1.17-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

function NewAppointmentDialog({ defaultDate, onDone }: { defaultDate: string; onDone: () => void }) {
  const [form, setForm] = useState({
    patientName: "",
    patientPhone: "",
    treatment: "",
    date: defaultDate,
    time: "09:00",
    status: "pendiente" as AppointmentStatus,
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName.trim() || !form.treatment.trim()) return;
    appointmentsStore.add(form);
    onDone();
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Nueva cita</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1">
          <Label>Paciente *</Label>
          <Input value={form.patientName} onChange={(e) => set("patientName", e.target.value)} required maxLength={100} />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label>Tratamiento *</Label>
          <Input value={form.treatment} onChange={(e) => set("treatment", e.target.value)} required maxLength={100} />
        </div>
        <div className="space-y-1">
          <Label>Fecha</Label>
          <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>Hora</Label>
          <Input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>Teléfono (con código país)</Label>
          <Input
            value={form.patientPhone}
            onChange={(e) => set("patientPhone", e.target.value.replace(/\D/g, ""))}
            placeholder="584141234567"
            inputMode="numeric"
            maxLength={15}
          />
        </div>
        <div className="space-y-1">
          <Label>Estado</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_META) as AppointmentStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="sm:col-span-2">
          <Button type="button" variant="ghost" onClick={onDone}>Cancelar</Button>
          <Button type="submit">Crear cita</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
