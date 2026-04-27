import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PatientLayout } from "@/components/PatientLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { Search, Plus, ChevronRight, Phone, Mail } from "lucide-react";
import { usePatients, patientsStore } from "@/lib/patients-store";

export const Route = createFileRoute("/pacientes")({
  head: () => ({
    meta: [
      { title: "Pacientes — OdontoFlow" },
      { name: "description", content: "Gestión de pacientes y fichas médicas." },
    ],
  }),
  component: PacientesPage,
});

function PacientesPage() {
  const patients = usePatients();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.cedula.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q),
    );
  }, [patients, query]);

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">Pacientes</h2>
            <p className="text-sm text-muted-foreground">
              {patients.length} pacientes registrados
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Agregar paciente
              </Button>
            </DialogTrigger>
            <AddPatientDialog onDone={() => setOpen(false)} />
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, cédula, teléfono o email…"
                className="pl-9"
              />
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-lg border md:block">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Paciente</th>
                    <th className="px-4 py-3 text-left font-medium">Cédula</th>
                    <th className="px-4 py-3 text-left font-medium">Contacto</th>
                    <th className="px-4 py-3 text-left font-medium">Última visita</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((p) => (
                    <tr key={p.id} className="group transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link
                          to="/pacientes/$patientId"
                          params={{ patientId: p.id }}
                          className="flex items-center gap-3"
                        >
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.gender === "F" ? "Femenino" : p.gender === "M" ? "Masculino" : "Otro"}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.cedula}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="text-xs">{p.phone}</div>
                        <div className="text-xs opacity-70">{p.email}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.lastVisit}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to="/pacientes/$patientId"
                          params={{ patientId: p.id }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          Ver ficha <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                        No se encontraron pacientes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="space-y-2 md:hidden">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  to="/pacientes/$patientId"
                  params={{ patientId: p.id }}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.cedula}</div>
                    <div className="mt-0.5 flex gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{p.phone}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
              {filtered.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">No se encontraron pacientes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
}

function AddPatientDialog({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    name: "",
    cedula: "",
    phone: "",
    email: "",
    birthDate: "",
    gender: "F" as "M" | "F" | "Otro",
    address: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.cedula.trim()) return;
    patientsStore.add(form);
    onDone();
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Agregar paciente</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1">
          <Label>Nombre completo *</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} required maxLength={100} />
        </div>
        <div className="space-y-1">
          <Label>Cédula *</Label>
          <Input value={form.cedula} onChange={(e) => set("cedula", e.target.value)} placeholder="V-12.345.678" required maxLength={20} />
        </div>
        <div className="space-y-1">
          <Label>Fecha nacimiento</Label>
          <Input type="date" value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Teléfono</Label>
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+58 414-..." maxLength={25} />
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={120} />
        </div>
        <div className="space-y-1">
          <Label>Género</Label>
          <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="F">Femenino</SelectItem>
              <SelectItem value="M">Masculino</SelectItem>
              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label>Dirección</Label>
          <Input value={form.address} onChange={(e) => set("address", e.target.value)} maxLength={200} />
        </div>
        <DialogFooter className="sm:col-span-2">
          <Button type="button" variant="ghost" onClick={onDone}>Cancelar</Button>
          <Button type="submit">Guardar paciente</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
