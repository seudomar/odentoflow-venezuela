import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { PatientLayout } from "@/components/PatientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Odontogram } from "@/components/Odontogram";
import { TreatmentPlan } from "@/components/TreatmentPlan";
import { usePatient, patientsStore, type PatientFile } from "@/lib/patients-store";
import {
  ArrowLeft,
  Save,
  Upload,
  Trash2,
  User,
  FileText,
  Image as ImageIcon,
  Activity,
  ClipboardList,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";

export const Route = createFileRoute("/pacientes/$patientId")({
  head: () => ({
    meta: [{ title: "Ficha del paciente — OdontoFlow" }],
  }),
  component: PatientDetail,
  notFoundComponent: () => (
    <PatientLayout>
      <div className="text-center text-sm text-muted-foreground">Paciente no encontrado.</div>
    </PatientLayout>
  ),
});

function PatientDetail() {
  const { patientId } = Route.useParams();
  const patient = usePatient(patientId);
  const [history, setHistory] = useState(patient?.history ?? "");
  const [historyDirty, setHistoryDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!patient) throw notFound();

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) continue;
      const dataUrl = await new Promise<string>((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.readAsDataURL(f);
      });
      const file: PatientFile = {
        id: `f${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: f.name,
        type: f.type,
        dataUrl,
        uploadedAt: new Date().toISOString(),
      };
      patientsStore.addFile(patient.id, file);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const saveHistory = () => {
    patientsStore.update(patient.id, { history });
    setHistoryDirty(false);
  };

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon">
              <Link to="/pacientes"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.7_0.15_240)] text-sm font-semibold text-primary-foreground">
              {patient.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">{patient.name}</h2>
              <p className="text-xs text-muted-foreground">{patient.cedula} · Última visita: {patient.lastVisit}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="datos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:grid-cols-5">
            <TabsTrigger value="datos" className="gap-1.5"><User className="h-3.5 w-3.5" /><span className="hidden sm:inline">Datos</span></TabsTrigger>
            <TabsTrigger value="historia" className="gap-1.5"><FileText className="h-3.5 w-3.5" /><span className="hidden sm:inline">Historia</span></TabsTrigger>
            <TabsTrigger value="plan" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" /><span className="hidden sm:inline">Plan</span></TabsTrigger>
            <TabsTrigger value="archivos" className="gap-1.5"><ImageIcon className="h-3.5 w-3.5" /><span className="hidden sm:inline">Archivos</span></TabsTrigger>
            <TabsTrigger value="odontograma" className="gap-1.5"><Activity className="h-3.5 w-3.5" /><span className="hidden sm:inline">Odontograma</span></TabsTrigger>
          </TabsList>

          {/* Datos personales */}
          <TabsContent value="datos">
            <Card>
              <CardHeader><CardTitle className="text-base">Datos personales</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoRow icon={User} label="Nombre" value={patient.name} />
                <InfoRow icon={FileText} label="Cédula" value={patient.cedula} />
                <InfoRow icon={Calendar} label="Fecha nacimiento" value={patient.birthDate || "—"} />
                <InfoRow icon={User} label="Género" value={patient.gender === "F" ? "Femenino" : patient.gender === "M" ? "Masculino" : "Otro"} />
                <InfoRow icon={Phone} label="Teléfono" value={patient.phone || "—"} />
                <InfoRow icon={Mail} label="Email" value={patient.email || "—"} />
                <div className="sm:col-span-2">
                  <InfoRow icon={MapPin} label="Dirección" value={patient.address || "—"} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historia clínica */}
          <TabsContent value="historia">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Historia clínica</CardTitle>
                <Button size="sm" onClick={saveHistory} disabled={!historyDirty} className="gap-1.5">
                  <Save className="h-3.5 w-3.5" /> Guardar
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={history}
                  onChange={(e) => { setHistory(e.target.value); setHistoryDirty(true); }}
                  placeholder="Antecedentes, diagnósticos, tratamientos previos, alergias, observaciones…"
                  className="min-h-[260px] resize-y"
                  maxLength={5000}
                />
                <p className="mt-2 text-xs text-muted-foreground">{history.length}/5000 caracteres</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plan de Tratamiento */}
          <TabsContent value="plan">
            <TreatmentPlan patient={patient} />
          </TabsContent>

          {/* Archivos */}
          <TabsContent value="archivos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Archivos del paciente</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">Rayos X, fotos del tratamiento (máx. 5MB por archivo)</p>
                </div>
                <Button onClick={() => fileRef.current?.click()} className="gap-1.5">
                  <Upload className="h-3.5 w-3.5" /> Subir
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={onUpload}
                />
              </CardHeader>
              <CardContent>
                {patient.files.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-border/60 p-10 text-center">
                    <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">Aún no hay archivos cargados</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => fileRef.current?.click()}>
                      Subir primer archivo
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {patient.files.map((f) => (
                      <div key={f.id} className="group relative overflow-hidden rounded-lg border bg-muted">
                        <a href={f.dataUrl} target="_blank" rel="noreferrer" className="block aspect-square">
                          <img src={f.dataUrl} alt={f.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                        </a>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="truncate text-[11px] font-medium text-white">{f.name}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute right-1.5 top-1.5 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => patientsStore.removeFile(patient.id, f.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Odontograma */}
          <TabsContent value="odontograma">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Odontograma</CardTitle>
                <p className="text-xs text-muted-foreground">Numeración FDI · 32 dientes · marca el estatus de cada pieza</p>
              </CardHeader>
              <CardContent>
                <Odontogram patientId={patient.id} teeth={patient.teeth} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayout>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
