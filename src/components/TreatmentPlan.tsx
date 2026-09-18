import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  treatmentPlansStore, usePatientTreatments,
  TREATMENT_STATUSES, type TreatmentStatus,
} from "@/lib/treatment-plans-store";
import { useServices } from "@/lib/services-store";
import { useSpecialists } from "@/lib/specialists-store";
import { useBcvRate } from "@/lib/rate-store";
import { useClinicSettings } from "@/lib/clinic-settings-store";
import { useFileUrl, LOGO_BUCKET } from "@/lib/storage";
import type { Patient } from "@/lib/patients-store";
import { Plus, Trash2, Printer, FileDown, ClipboardList, Stethoscope } from "lucide-react";

const STATUS_STYLE: Record<TreatmentStatus, { color: string; bg: string }> = {
  "Pendiente": { color: "oklch(0.6 0.18 60)", bg: "oklch(0.6 0.18 60 / 0.15)" },
  "En curso": { color: "oklch(0.58 0.18 245)", bg: "oklch(0.58 0.18 245 / 0.15)" },
  "Finalizado": { color: "oklch(0.6 0.15 155)", bg: "oklch(0.6 0.15 155 / 0.15)" },
};

export function TreatmentPlan({ patient }: { patient: Patient }) {
  const items = usePatientTreatments(patient.id);
  const services = useServices();
  const [rate] = useBcvRate();
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [budgetOpen, setBudgetOpen] = useState(false);

  const totalUSD = useMemo(
    () => items.reduce((acc, i) => acc + i.priceUSD, 0),
    [items],
  );
  const pendingUSD = useMemo(
    () => items.filter((i) => i.status !== "Finalizado").reduce((acc, i) => acc + i.priceUSD, 0),
    [items],
  );
  const totalVEF = totalUSD * rate;

  const addFromCatalog = () => {
    const svc = services.find((s) => s.id === selectedServiceId);
    if (!svc) return;
    treatmentPlansStore.add({
      patientId: patient.id,
      serviceId: svc.id,
      name: svc.name,
      priceUSD: svc.priceUSD,
      status: "Pendiente",
    });
    setSelectedServiceId("");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4 text-primary" /> Plan de Tratamiento
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Selecciona tratamientos del catálogo y gestiona su estado
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setBudgetOpen(true)} disabled={items.length === 0}>
          <FileDown className="h-3.5 w-3.5" /> Generar PDF
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selector */}
        <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 sm:flex-row">
          <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
            <SelectTrigger className="h-9 flex-1 text-sm">
              <SelectValue placeholder="Selecciona un servicio del catálogo…" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} — ${s.priceUSD.toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-1.5" onClick={addFromCatalog} disabled={!selectedServiceId}>
            <Plus className="h-3.5 w-3.5" /> Agregar al plan
          </Button>
        </div>

        {/* Lista checklist */}
        {items.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border/60 p-10 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">Sin tratamientos agregados</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => {
              const isDone = it.status === "Finalizado";
              const styles = STATUS_STYLE[it.status];
              return (
                <li
                  key={it.id}
                  className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center"
                >
                  <Checkbox
                    checked={isDone}
                    onCheckedChange={(c) =>
                      treatmentPlansStore.update(it.id, {
                        status: c ? "Finalizado" : "Pendiente",
                      })
                    }
                    className="mt-1 sm:mt-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {it.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Agregado {new Date(it.createdAt).toLocaleDateString("es-VE")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <SpecialistSelect
                      value={it.specialistId}
                      onChange={(v) => treatmentPlansStore.update(it.id, { specialistId: v || undefined })}
                    />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={it.priceUSD}
                      onChange={(e) =>
                        treatmentPlansStore.update(it.id, { priceUSD: parseFloat(e.target.value) || 0 })
                      }
                      className="h-8 w-24 text-right text-sm tabular-nums"
                    />
                    <Select
                      value={it.status}
                      onValueChange={(v) => treatmentPlansStore.update(it.id, { status: v as TreatmentStatus })}
                    >
                      <SelectTrigger
                        className="h-8 w-32 text-xs"
                        style={{ color: styles.color, borderColor: `color-mix(in oklab, ${styles.color} 35%, transparent)`, backgroundColor: styles.bg }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TREATMENT_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon" variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => treatmentPlansStore.remove(it.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Totales */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 gap-2 rounded-lg border bg-gradient-to-br from-primary/5 to-transparent p-3 sm:grid-cols-3">
            <TotalCell label="Pendiente por cobrar" value={`$${pendingUSD.toFixed(2)}`} sub={`Bs. ${(pendingUSD * rate).toFixed(2)}`} />
            <TotalCell label="Total USD" value={`$${totalUSD.toFixed(2)}`} />
            <TotalCell label={`Total Bs. (tasa ${rate.toFixed(2)})`} value={`Bs. ${totalVEF.toFixed(2)}`} accent />
          </div>
        )}
      </CardContent>

      <BudgetDialog
        open={budgetOpen}
        onOpenChange={setBudgetOpen}
        patient={patient}
        items={items}
        rate={rate}
        totalUSD={totalUSD}
      />
    </Card>
  );
}

function TotalCell({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-md bg-card p-2.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-base font-bold tabular-nums ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground tabular-nums">{sub}</p>}
    </div>
  );
}

function BudgetDialog({
  open, onOpenChange, patient, items, rate, totalUSD,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  patient: Patient;
  items: ReturnType<typeof usePatientTreatments>;
  rate: number;
  totalUSD: number;
}) {
  const [clinic] = useClinicSettings();
  const logoUrl = useFileUrl(LOGO_BUCKET, clinic.logoPath, clinic.logoDataUrl);
  const today = new Date().toLocaleDateString("es-VE", { day: "2-digit", month: "long", year: "numeric" });
  const totalVEF = totalUSD * rate;

  const handlePrint = () => {
    const node = document.getElementById("budget-print-area");
    if (!node) return;
    const w = window.open("", "_blank", "width=820,height=900");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>Presupuesto · ${patient.name}</title>
      <style>
        body { font-family: -apple-system, system-ui, sans-serif; padding: 32px; color: #111; }
        h1 { font-size: 20px; margin: 0 0 4px; }
        h2 { font-size: 14px; margin: 16px 0 8px; color: #555; text-transform: uppercase; letter-spacing: .04em; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
        th, td { border-bottom: 1px solid #eee; padding: 8px 6px; text-align: left; }
        th { background: #f5f5f5; }
        .right { text-align: right; }
        .totals { margin-top: 16px; display: flex; justify-content: flex-end; }
        .totals table { width: 280px; }
        .muted { color: #777; font-size: 12px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 12px; gap: 16px; }
        .logo { max-height: 64px; max-width: 140px; object-fit: contain; }
        .footer { margin-top: 24px; padding-top: 12px; border-top: 1px dashed #ccc; font-size: 12px; color: #444; white-space: pre-wrap; }
      </style></head><body>${node.innerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Presupuesto del Plan de Tratamiento</DialogTitle>
        </DialogHeader>

        <div id="budget-print-area" className="max-h-[60vh] overflow-y-auto rounded-md border bg-white p-5 text-[13px] text-neutral-900">
          <div className="header" style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #111", paddingBottom: 12, gap: 16 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              {logoUrl && (
                <img src={logoUrl} alt="Logo" className="logo" style={{ maxHeight: 64, maxWidth: 140, objectFit: "contain" }} />
              )}
              <div>
                <h1 style={{ fontSize: 18, margin: 0 }}>{clinic.clinicName}</h1>
                <div className="muted">{clinic.doctorName}{clinic.rif ? ` · RIF ${clinic.rif}` : ""}</div>
                <div className="muted">{clinic.address}</div>
                <div className="muted">{clinic.phone}{clinic.email ? ` · ${clinic.email}` : ""}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700 }}>PRESUPUESTO</div>
              <div className="muted">Fecha: {today}</div>
              <div className="muted">Tasa {clinic.rateSource === "bcv" ? "BCV" : "manual"}: Bs. {rate.toFixed(2)} / USD</div>
            </div>
          </div>

          <h2>Datos del paciente</h2>
          <div>
            <strong>{patient.name}</strong> · {patient.cedula}<br />
            <span className="muted">{patient.phone} · {patient.email}</span>
          </div>

          <h2>Detalle de tratamientos</h2>
          <table>
            <thead>
              <tr>
                <th>#</th><th>Tratamiento</th><th>Estado</th>
                <th className="right">Precio USD</th><th className="right">Precio Bs.</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={it.id}>
                  <td>{idx + 1}</td>
                  <td>{it.name}</td>
                  <td>{it.status}</td>
                  <td className="right">${it.priceUSD.toFixed(2)}</td>
                  <td className="right">Bs. {(it.priceUSD * rate).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals" style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <table style={{ width: 280 }}>
              <tbody>
                <tr><td>Subtotal USD</td><td className="right">${totalUSD.toFixed(2)}</td></tr>
                <tr><td>Equivalente Bs.</td><td className="right">Bs. {totalVEF.toFixed(2)}</td></tr>
                <tr style={{ fontWeight: 700, fontSize: 14 }}>
                  <td>TOTAL</td><td className="right">${totalUSD.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {clinic.paymentInstructions && (
            <>
              <h2>Instrucciones de pago</h2>
              <div className="footer" style={{ marginTop: 8, paddingTop: 0, borderTop: "none", whiteSpace: "pre-wrap" }}>
                {clinic.paymentInstructions}
              </div>
            </>
          )}

          {clinic.legalNote && (
            <p className="muted" style={{ marginTop: 24 }}>
              {clinic.legalNote}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
          <Button onClick={handlePrint} className="gap-1.5">
            <Printer className="h-3.5 w-3.5" /> Imprimir / Guardar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Mini badge export (por si se usa fuera)
export function StatusBadge({ status }: { status: TreatmentStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <Badge variant="outline" style={{ color: s.color, borderColor: `color-mix(in oklab, ${s.color} 35%, transparent)`, backgroundColor: s.bg }}>
      {status}
    </Badge>
  );
}

function SpecialistSelect({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const specialists = useSpecialists().filter((s) => s.active);
  return (
    <Select value={value ?? "__none__"} onValueChange={(v) => onChange(v === "__none__" ? "" : v)}>
      <SelectTrigger className="h-8 w-44 text-xs">
        <span className="flex items-center gap-1.5 truncate">
          <Stethoscope className="h-3 w-3 shrink-0 text-muted-foreground" />
          <SelectValue placeholder="Sin asignar" />
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">Sin asignar</SelectItem>
        {specialists.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.name} ({s.commissionPct}%)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
