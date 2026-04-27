import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PatientLayout } from "@/components/PatientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { specialistsStore, useSpecialists, type Specialist } from "@/lib/specialists-store";
import { useAllTreatments } from "@/lib/treatment-plans-store";
import { Plus, Pencil, Trash2, Stethoscope, Phone, Mail, Percent } from "lucide-react";

export const Route = createFileRoute("/especialistas")({
  head: () => ({
    meta: [
      { title: "Especialistas — OdontoFlow" },
      { name: "description", content: "Doctores colaboradores y configuración de comisiones." },
    ],
  }),
  component: EspecialistasPage,
});

function EspecialistasPage() {
  const list = useSpecialists();
  const treatments = useAllTreatments();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Specialist | null>(null);

  const stats = useMemo(() => {
    const map = new Map<string, number>();
    treatments.forEach((t) => {
      if (!t.specialistId) return;
      map.set(t.specialistId, (map.get(t.specialistId) ?? 0) + t.priceUSD);
    });
    return map;
  }, [treatments]);

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-foreground sm:text-2xl">
              <Stethoscope className="h-5 w-5 text-primary" /> Doctores Colaboradores
            </h2>
            <p className="text-xs text-muted-foreground">
              Configura especialistas y su % de comisión por procedimiento
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-3.5 w-3.5" /> Nuevo especialista
          </Button>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Equipo</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Especialista</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead className="text-center">Comisión</TableHead>
                    <TableHead className="text-right">Producción USD</TableHead>
                    <TableHead className="text-center">Activo</TableHead>
                    <TableHead className="w-[110px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        Sin especialistas registrados
                      </TableCell>
                    </TableRow>
                  ) : list.map((s) => {
                    const produced = stats.get(s.id) ?? 0;
                    return (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.7_0.15_240)] text-[11px] font-semibold text-primary-foreground">
                              {s.name.split(" ").slice(-2).map((n) => n[0]).join("")}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{s.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.specialty}</TableCell>
                        <TableCell>
                          <div className="space-y-0.5 text-[11px] text-muted-foreground">
                            {s.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</div>}
                            {s.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</div>}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="font-semibold tabular-nums"
                            style={{ color: "oklch(0.58 0.18 245)", borderColor: "color-mix(in oklab, oklch(0.58 0.18 245) 35%, transparent)", backgroundColor: "color-mix(in oklab, oklch(0.58 0.18 245) 12%, transparent)" }}
                          >
                            {s.commissionPct}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-semibold">${produced.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <Switch checked={s.active} onCheckedChange={(c) => specialistsStore.update(s.id, { active: c })} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(s); setOpen(true); }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar a {s.name}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Los tratamientos asignados conservarán la referencia histórica.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => specialistsStore.remove(s.id)}>Eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
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

      <SpecialistDialog open={open} onOpenChange={setOpen} editing={editing} />
    </PatientLayout>
  );
}

function SpecialistDialog({
  open, onOpenChange, editing,
}: { open: boolean; onOpenChange: (v: boolean) => void; editing: Specialist | null }) {
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pct, setPct] = useState("40");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setSpecialty(editing?.specialty ?? "");
      setPhone(editing?.phone ?? "");
      setEmail(editing?.email ?? "");
      setPct(editing?.commissionPct?.toString() ?? "40");
      setActive(editing?.active ?? true);
    }
  }, [open, editing]);

  const submit = () => {
    const n = name.trim();
    const p = Math.max(0, Math.min(100, parseFloat(pct) || 0));
    if (!n) return;
    const data = { name: n, specialty: specialty.trim(), phone: phone.trim(), email: email.trim(), commissionPct: p, active };
    if (editing) specialistsStore.update(editing.id, data);
    else specialistsStore.add(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Editar especialista" : "Nuevo especialista"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="mb-1 block text-xs">Nombre completo</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr./Dra. Nombre Apellido" />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Especialidad</Label>
            <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Endodoncia, Ortodoncia…" />
          </div>
          <div>
            <Label className="mb-1 block text-xs flex items-center gap-1"><Percent className="h-3 w-3" /> Comisión (%)</Label>
            <Input type="number" min="0" max="100" step="1" value={pct} onChange={(e) => setPct(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Teléfono</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+58 ..." />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="sm:col-span-2 flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
            <div>
              <p className="text-sm font-medium">Activo</p>
              <p className="text-[11px] text-muted-foreground">Aparecerá disponible para asignar a tratamientos</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit}>{editing ? "Guardar cambios" : "Crear"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
