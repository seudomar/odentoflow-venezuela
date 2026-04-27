import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PatientLayout } from "@/components/PatientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAllTreatments, treatmentPlansStore, type CommissionStatus } from "@/lib/treatment-plans-store";
import { useSpecialists } from "@/lib/specialists-store";
import { usePatients } from "@/lib/patients-store";
import { Wallet, CheckCircle2, Clock, Filter, TrendingUp, Building2, UserRound } from "lucide-react";

export const Route = createFileRoute("/comisiones")({
  head: () => ({
    meta: [
      { title: "Comisiones y Cierre — OdontoFlow" },
      { name: "description", content: "Reporte de liquidación de comisiones por especialista." },
    ],
  }),
  component: ComisionesPage,
});

const STATUS_STYLE: Record<CommissionStatus, { color: string; bg: string }> = {
  "Pendiente": { color: "oklch(0.6 0.18 60)", bg: "oklch(0.6 0.18 60 / 0.15)" },
  "Pagada": { color: "oklch(0.6 0.15 155)", bg: "oklch(0.6 0.15 155 / 0.15)" },
};

function todayISO() { return new Date().toISOString().slice(0, 10); }
function startOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function ComisionesPage() {
  const treatments = useAllTreatments();
  const specialists = useSpecialists();
  const patients = usePatients();

  const [from, setFrom] = useState(startOfMonthISO());
  const [to, setTo] = useState(todayISO());
  const [doctor, setDoctor] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const patientName = (id: string) => patients.find((p) => p.id === id)?.name ?? "—";
  const specialist = (id?: string) => specialists.find((s) => s.id === id);

  const filtered = useMemo(() => {
    const fromD = new Date(from + "T00:00:00").getTime();
    const toD = new Date(to + "T23:59:59").getTime();
    return treatments
      .filter((t) => !!t.specialistId)
      .filter((t) => {
        const ts = new Date(t.createdAt).getTime();
        if (ts < fromD || ts > toD) return false;
        if (doctor !== "all" && t.specialistId !== doctor) return false;
        if (statusFilter !== "all" && (t.commissionStatus ?? "Pendiente") !== statusFilter) return false;
        return true;
      });
  }, [treatments, from, to, doctor, statusFilter]);

  // Agregaciones por especialista
  const byDoctor = useMemo(() => {
    const map = new Map<string, { produced: number; doctorCut: number; clinicCut: number; pending: number; paid: number; count: number }>();
    filtered.forEach((t) => {
      const sp = specialist(t.specialistId);
      if (!sp) return;
      const cut = t.priceUSD * (sp.commissionPct / 100);
      const clinic = t.priceUSD - cut;
      const prev = map.get(sp.id) ?? { produced: 0, doctorCut: 0, clinicCut: 0, pending: 0, paid: 0, count: 0 };
      prev.produced += t.priceUSD;
      prev.doctorCut += cut;
      prev.clinicCut += clinic;
      prev.count += 1;
      if ((t.commissionStatus ?? "Pendiente") === "Pagada") prev.paid += cut;
      else prev.pending += cut;
      map.set(sp.id, prev);
    });
    return map;
  }, [filtered, specialists]);

  const totals = useMemo(() => {
    let produced = 0, doctorCut = 0, clinicCut = 0, pending = 0, paid = 0;
    filtered.forEach((t) => {
      const sp = specialist(t.specialistId);
      if (!sp) return;
      const cut = t.priceUSD * (sp.commissionPct / 100);
      produced += t.priceUSD;
      doctorCut += cut;
      clinicCut += t.priceUSD - cut;
      if ((t.commissionStatus ?? "Pendiente") === "Pagada") paid += cut;
      else pending += cut;
    });
    return { produced, doctorCut, clinicCut, pending, paid };
  }, [filtered, specialists]);

  const markAllPaid = () => {
    filtered.forEach((t) => {
      if ((t.commissionStatus ?? "Pendiente") !== "Pagada") {
        treatmentPlansStore.setCommissionStatus(t.id, "Pagada");
      }
    });
  };

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-foreground sm:text-2xl">
              <Wallet className="h-5 w-5 text-primary" /> Cierre de Caja · Comisiones
            </h2>
            <p className="text-xs text-muted-foreground">
              Liquidación de honorarios por especialista · Todos los montos en USD
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={markAllPaid}
            disabled={filtered.every((t) => (t.commissionStatus ?? "Pendiente") === "Pagada")}
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Marcar todas como pagadas
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4 text-muted-foreground" /> Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div>
                <Label className="mb-1 block text-xs">Desde</Label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9" />
              </div>
              <div>
                <Label className="mb-1 block text-xs">Hasta</Label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9" />
              </div>
              <div>
                <Label className="mb-1 block text-xs">Especialista</Label>
                <Select value={doctor} onValueChange={setDoctor}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {specialists.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block text-xs">Estado de pago</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Pagada">Pagada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen totales */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard icon={TrendingUp} label="Total producido" value={`$${totals.produced.toFixed(2)}`} accent="oklch(0.58 0.18 245)" />
          <SummaryCard icon={UserRound} label="Para especialistas" value={`$${totals.doctorCut.toFixed(2)}`} accent="oklch(0.7 0.18 320)" />
          <SummaryCard icon={Building2} label="Para la clínica" value={`$${totals.clinicCut.toFixed(2)}`} accent="oklch(0.6 0.15 155)" />
          <SummaryCard icon={Clock} label="Pendiente por pagar" value={`$${totals.pending.toFixed(2)}`} accent="oklch(0.6 0.18 60)" />
        </div>

        {/* Resumen por doctor */}
        <Card>
          <CardHeader><CardTitle className="text-base">Resumen por especialista</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Especialista</TableHead>
                    <TableHead className="text-center">%</TableHead>
                    <TableHead className="text-center">Tratamientos</TableHead>
                    <TableHead className="text-right">Producido</TableHead>
                    <TableHead className="text-right">Doctor</TableHead>
                    <TableHead className="text-right">Clínica</TableHead>
                    <TableHead className="text-right">Pendiente</TableHead>
                    <TableHead className="text-right">Pagado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byDoctor.size === 0 ? (
                    <TableRow><TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">Sin datos en el periodo seleccionado</TableCell></TableRow>
                  ) : Array.from(byDoctor.entries()).map(([id, agg]) => {
                    const sp = specialist(id);
                    if (!sp) return null;
                    return (
                      <TableRow key={id}>
                        <TableCell className="font-medium">{sp.name}</TableCell>
                        <TableCell className="text-center text-muted-foreground tabular-nums">{sp.commissionPct}%</TableCell>
                        <TableCell className="text-center tabular-nums">{agg.count}</TableCell>
                        <TableCell className="text-right tabular-nums font-semibold">${agg.produced.toFixed(2)}</TableCell>
                        <TableCell className="text-right tabular-nums" style={{ color: "oklch(0.7 0.18 320)" }}>${agg.doctorCut.toFixed(2)}</TableCell>
                        <TableCell className="text-right tabular-nums" style={{ color: "oklch(0.6 0.15 155)" }}>${agg.clinicCut.toFixed(2)}</TableCell>
                        <TableCell className="text-right tabular-nums" style={{ color: "oklch(0.6 0.18 60)" }}>${agg.pending.toFixed(2)}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">${agg.paid.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detalle */}
        <Card>
          <CardHeader><CardTitle className="text-base">Detalle de tratamientos</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tratamiento</TableHead>
                    <TableHead>Especialista</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Comisión</TableHead>
                    <TableHead className="text-right">Clínica</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">Sin tratamientos en el periodo</TableCell></TableRow>
                  ) : filtered
                    .slice()
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .map((t) => {
                      const sp = specialist(t.specialistId);
                      if (!sp) return null;
                      const cut = t.priceUSD * (sp.commissionPct / 100);
                      const clinic = t.priceUSD - cut;
                      const cs: CommissionStatus = t.commissionStatus ?? "Pendiente";
                      const styles = STATUS_STYLE[cs];
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="text-xs text-muted-foreground tabular-nums">
                            {new Date(t.createdAt).toLocaleDateString("es-VE")}
                          </TableCell>
                          <TableCell className="text-sm">{patientName(t.patientId)}</TableCell>
                          <TableCell className="text-sm">{t.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{sp.name}</TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">${t.priceUSD.toFixed(2)}</TableCell>
                          <TableCell className="text-right tabular-nums" style={{ color: "oklch(0.7 0.18 320)" }}>${cut.toFixed(2)}</TableCell>
                          <TableCell className="text-right tabular-nums" style={{ color: "oklch(0.6 0.15 155)" }}>${clinic.toFixed(2)}</TableCell>
                          <TableCell className="text-center">
                            <button
                              type="button"
                              onClick={() => treatmentPlansStore.setCommissionStatus(t.id, cs === "Pagada" ? "Pendiente" : "Pagada")}
                              title="Cambiar estado"
                            >
                              <Badge
                                variant="outline"
                                className="cursor-pointer gap-1"
                                style={{ color: styles.color, borderColor: `color-mix(in oklab, ${styles.color} 35%, transparent)`, backgroundColor: styles.bg }}
                              >
                                {cs === "Pagada" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                {cs === "Pagada" ? "Pagada" : "Pendiente"}
                              </Badge>
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
}

function SummaryCard({
  icon: Icon, label, value, accent,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="grid h-7 w-7 place-items-center rounded-md" style={{ backgroundColor: `color-mix(in oklab, ${accent} 15%, transparent)` }}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className="mt-1.5 text-lg font-bold tabular-nums" style={{ color: accent }}>{value}</p>
    </div>
  );
}
