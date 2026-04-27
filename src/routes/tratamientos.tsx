import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PatientLayout } from "@/components/PatientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  servicesStore, useServices, SERVICE_CATEGORIES,
  type Service, type ServiceCategory,
} from "@/lib/services-store";
import { FileText, Plus, Pencil, Trash2, RotateCcw, Search } from "lucide-react";

export const Route = createFileRoute("/tratamientos")({
  head: () => ({
    meta: [
      { title: "Tratamientos y Servicios — OdontoFlow" },
      { name: "description", content: "Catálogo de servicios y tratamientos del consultorio." },
    ],
  }),
  component: TratamientosPage,
});

const CATEGORY_COLORS: Record<ServiceCategory, string> = {
  "Diagnóstico": "oklch(0.6 0.15 230)",
  "Preventiva": "oklch(0.65 0.15 155)",
  "Estética": "oklch(0.7 0.18 320)",
  "Cirugía": "oklch(0.6 0.22 25)",
  "Endodoncia": "oklch(0.6 0.18 280)",
  "Prótesis": "oklch(0.65 0.15 60)",
  "Ortodoncia": "oklch(0.58 0.18 200)",
  "Otros": "oklch(0.55 0.02 250)",
};

function TratamientosPage() {
  const services = useServices();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Service | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      const matchQ = !q || s.name.toLowerCase().includes(q);
      const matchC = categoryFilter === "all" || s.category === categoryFilter;
      return matchQ && matchC;
    });
  }, [services, search, categoryFilter]);

  const totalAvg = services.length
    ? (services.reduce((a, s) => a + s.priceUSD, 0) / services.length).toFixed(2)
    : "0.00";

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-foreground sm:text-2xl">
              <FileText className="h-5 w-5 text-primary" />
              Tratamientos y Servicios
            </h2>
            <p className="text-xs text-muted-foreground">
              Catálogo configurable · Disponible en presupuestos y planes de tratamiento
            </p>
          </div>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" /> Restaurar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Restaurar catálogo por defecto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se reemplazarán todos los servicios actuales por la lista predeterminada. Esta acción no afecta los planes de tratamiento ya creados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => servicesStore.reset()}>Restaurar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus className="h-3.5 w-3.5" /> Nuevo servicio
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatBox label="Servicios" value={String(services.length)} />
          <StatBox label="Categorías" value={String(new Set(services.map((s) => s.category)).size)} />
          <StatBox label="Precio promedio" value={`$${totalAvg}`} />
        </div>

        <Card>
          <CardHeader className="gap-3">
            <CardTitle className="text-base">Catálogo</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar tratamiento…"
                  className="h-9 pl-8 text-sm"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-full sm:w-48 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {SERVICE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tratamiento</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Precio (USD)</TableHead>
                    <TableHead className="w-[110px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                        Sin resultados
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            style={{
                              color: CATEGORY_COLORS[s.category],
                              borderColor: `color-mix(in oklab, ${CATEGORY_COLORS[s.category]} 35%, transparent)`,
                              backgroundColor: `color-mix(in oklab, ${CATEGORY_COLORS[s.category]} 12%, transparent)`,
                            }}
                          >
                            {s.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-semibold">
                          ${s.priceUSD.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon" variant="ghost" className="h-8 w-8"
                              onClick={() => { setEditing(s); setOpen(true); }}
                            >
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
                                  <AlertDialogTitle>¿Eliminar "{s.name}"?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    El servicio dejará de estar disponible en nuevos presupuestos y planes.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => servicesStore.remove(s.id)}>Eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ServiceDialog open={open} onOpenChange={setOpen} editing={editing} />
    </PatientLayout>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

function ServiceDialog({
  open, onOpenChange, editing,
}: { open: boolean; onOpenChange: (v: boolean) => void; editing: Service | null }) {
  const [name, setName] = useState(editing?.name ?? "");
  const [category, setCategory] = useState<ServiceCategory>(editing?.category ?? "Otros");
  const [price, setPrice] = useState(editing?.priceUSD?.toString() ?? "");

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setCategory(editing?.category ?? "Otros");
      setPrice(editing?.priceUSD?.toString() ?? "");
    }
  }, [open, editing]);

  const submit = () => {
    const n = name.trim();
    const p = parseFloat(price);
    if (!n || isNaN(p) || p < 0) return;
    if (editing) {
      servicesStore.update(editing.id, { name: n, category, priceUSD: p });
    } else {
      servicesStore.add({ name: n, category, priceUSD: p });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="mb-1 block text-xs">Nombre del tratamiento</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Limpieza profunda" />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Categoría</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ServiceCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SERVICE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-xs">Precio base (USD)</Label>
            <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
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
