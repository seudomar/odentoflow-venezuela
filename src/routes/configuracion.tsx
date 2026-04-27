import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { PatientLayout } from "@/components/PatientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useClinicSettings } from "@/lib/clinic-settings-store";
import { useBcvRate } from "@/lib/rate-store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Building2, FileText, KeyRound, Crown, Upload, Trash2,
  Save, MessageCircle, Mail, Lock, RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/configuracion")({
  head: () => ({
    meta: [
      { title: "Configuración — OdontoFlow" },
      { name: "description", content: "Centro de control del consultorio: perfil, documentos, cuenta y suscripción." },
    ],
  }),
  component: SettingsPage,
});

const TIMEZONES = [
  "America/Caracas",
  "America/Bogota",
  "America/Lima",
  "America/Mexico_City",
  "America/Argentina/Buenos_Aires",
  "America/Santiago",
  "America/New_York",
  "Europe/Madrid",
];

function SettingsPage() {
  return (
    <PatientLayout>
      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">Configuración</h1>
          <p className="text-sm text-muted-foreground">
            Centro de control de tu consultorio. Estos datos se aplican automáticamente en presupuestos y recibos.
          </p>
        </div>

        <Tabs defaultValue="perfil" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="perfil" className="gap-1.5"><Building2 className="h-3.5 w-3.5" />Perfil</TabsTrigger>
            <TabsTrigger value="documentos" className="gap-1.5"><FileText className="h-3.5 w-3.5" />Documentos</TabsTrigger>
            <TabsTrigger value="cuenta" className="gap-1.5"><KeyRound className="h-3.5 w-3.5" />Cuenta</TabsTrigger>
            <TabsTrigger value="suscripcion" className="gap-1.5"><Crown className="h-3.5 w-3.5" />Suscripción</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil"><ProfileTab /></TabsContent>
          <TabsContent value="documentos"><DocumentsTab /></TabsContent>
          <TabsContent value="cuenta"><AccountTab /></TabsContent>
          <TabsContent value="suscripcion"><SubscriptionTab /></TabsContent>
        </Tabs>
      </div>
    </PatientLayout>
  );
}

/* -------------------- Perfil -------------------- */
function ProfileTab() {
  const [s, set] = useClinicSettings();
  const [rate, setRate] = useBcvRate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [draftRate, setDraftRate] = useState(rate.toString());

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 1024 * 1024) {
      toast.error("El logo debe pesar menos de 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set({ logoDataUrl: String(reader.result) });
    reader.readAsDataURL(f);
  };

  const saveAll = () => {
    const n = parseFloat(draftRate.replace(",", "."));
    if (!isNaN(n) && n > 0) setRate(n);
    toast.success("Perfil del consultorio actualizado.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Perfil del Consultorio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border bg-muted/30">
            {s.logoDataUrl ? (
              <img src={s.logoDataUrl} alt="Logo del consultorio" className="h-full w-full object-contain" />
            ) : (
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Sin logo</span>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Label className="text-xs">Logo del consultorio</Label>
            <p className="text-xs text-muted-foreground">
              Aparecerá en presupuestos y recibos. PNG o JPG, máx. 1 MB.
            </p>
            <div className="flex gap-2">
              <input ref={fileRef} type="file" accept="image/*" onChange={onLogo} className="hidden" />
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} className="gap-1.5">
                <Upload className="h-3.5 w-3.5" /> Subir logo
              </Button>
              {s.logoDataUrl && (
                <Button size="sm" variant="ghost" onClick={() => set({ logoDataUrl: "" })} className="gap-1.5 text-destructive">
                  <Trash2 className="h-3.5 w-3.5" /> Quitar
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre de la Clínica">
            <Input value={s.clinicName} onChange={(e) => set({ clinicName: e.target.value })} />
          </Field>
          <Field label="Nombre del Doctor">
            <Input value={s.doctorName} onChange={(e) => set({ doctorName: e.target.value })} />
          </Field>
          <Field label="RIF">
            <Input value={s.rif} onChange={(e) => set({ rif: e.target.value })} placeholder="J-12345678-9" />
          </Field>
          <Field label="Teléfono">
            <Input value={s.phone} onChange={(e) => set({ phone: e.target.value })} />
          </Field>
          <Field label="Dirección física" className="sm:col-span-2">
            <Input value={s.address} onChange={(e) => set({ address: e.target.value })} />
          </Field>
          <Field label="Email del consultorio" className="sm:col-span-2">
            <Input type="email" value={s.email} onChange={(e) => set({ email: e.target.value })} />
          </Field>
        </div>

        <div className="rounded-lg border bg-muted/20 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Tasa de Cambio</p>
              <p className="text-xs text-muted-foreground">Define cómo se calcula el equivalente en bolívares.</p>
            </div>
            <Badge variant="outline" className="gap-1">
              <RefreshCw className="h-3 w-3" /> {s.rateSource === "bcv" ? "Fuente BCV" : "Manual"}
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Fuente de la tasa">
              <Select value={s.rateSource} onValueChange={(v) => set({ rateSource: v as "manual" | "bcv" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual (la edito yo)</SelectItem>
                  <SelectItem value="bcv">BCV (Banco Central de Venezuela)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Valor actual (Bs. por USD)">
              <Input
                inputMode="decimal"
                value={draftRate}
                onChange={(e) => setDraftRate(e.target.value)}
                placeholder="36.50"
              />
            </Field>
          </div>
          {s.rateSource === "bcv" && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              La integración automática con BCV se activará próximamente. Por ahora puedes ajustarla manualmente.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={saveAll} className="gap-1.5"><Save className="h-4 w-4" /> Guardar cambios</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------- Documentos -------------------- */
function DocumentsTab() {
  const [s, set] = useClinicSettings();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Personalización de Documentos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Field label="Nota legal del presupuesto">
          <Textarea
            rows={3}
            value={s.legalNote}
            onChange={(e) => set({ legalNote: e.target.value })}
            placeholder="Ej: Presupuesto válido por 15 días…"
          />
        </Field>

        <Field label="Instrucciones de pago (Pago Móvil, Zelle, transferencias)">
          <Textarea
            rows={5}
            value={s.paymentInstructions}
            onChange={(e) => set({ paymentInstructions: e.target.value })}
            placeholder={"Pago Móvil: 0414-1234567 · Banco …\nZelle: pagos@…"}
          />
        </Field>

        <div className="rounded-lg border bg-muted/20 p-4 text-xs text-muted-foreground">
          Esta información aparecerá automáticamente al final de cada presupuesto generado para tus pacientes.
        </div>

        <div className="flex justify-end">
          <Button onClick={() => toast.success("Plantillas actualizadas.")} className="gap-1.5">
            <Save className="h-4 w-4" /> Guardar plantillas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------- Cuenta -------------------- */
function AccountTab() {
  const [s, set] = useClinicSettings();
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const updateEmail = async () => {
    if (!newEmail) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success("Te enviamos un correo de verificación al nuevo email.");
      setNewEmail("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo actualizar el correo.");
    } finally {
      setBusy(false);
    }
  };

  const updatePassword = async () => {
    if (newPassword.length < 6) return toast.error("La contraseña debe tener al menos 6 caracteres.");
    if (newPassword !== confirmPassword) return toast.error("Las contraseñas no coinciden.");
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Contraseña actualizada correctamente.");
      setNewPassword(""); setConfirmPassword("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo actualizar la contraseña.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Correo electrónico</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Field label="Nuevo correo electrónico">
            <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="nuevo@email.com" />
          </Field>
          <div className="flex justify-end">
            <Button onClick={updateEmail} disabled={busy || !newEmail} className="gap-1.5">
              <Mail className="h-4 w-4" /> Actualizar correo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Cambio de contraseña</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nueva contraseña">
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} />
            </Field>
            <Field label="Confirmar contraseña">
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button onClick={updatePassword} disabled={busy || !newPassword} className="gap-1.5">
              <Lock className="h-4 w-4" /> Cambiar contraseña
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Zona horaria</CardTitle></CardHeader>
        <CardContent>
          <Field label="Zona horaria del consultorio">
            <Select value={s.timezone} onValueChange={(v) => { set({ timezone: v }); toast.success("Zona horaria actualizada."); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------- Suscripción -------------------- */
function SubscriptionTab() {
  const [s] = useClinicSettings();
  const renews = new Date(s.planRenewsAt);
  const daysLeft = Math.max(0, Math.ceil((renews.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const expiringSoon = daysLeft <= 7;

  const renew = () => {
    const text = encodeURIComponent(
      `Hola, soy ${s.doctorName} de ${s.clinicName}. Quiero renovar mi plan ${s.plan} de OdontoFlow.`,
    );
    window.open(`https://wa.me/${s.adminWhatsapp}?text=${text}`, "_blank");
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Tu suscripción</CardTitle></CardHeader>
      <CardContent>
        <div className="rounded-xl border bg-gradient-to-br from-primary/10 via-background to-background p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Plan actual</p>
              <div className="mt-1 flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <h3 className="text-2xl font-bold">{s.plan}</h3>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Vence el{" "}
                <span className="font-medium text-foreground">
                  {renews.toLocaleDateString("es-VE", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
              </p>
            </div>
            <Badge variant={expiringSoon ? "destructive" : "secondary"}>
              {daysLeft === 0 ? "Vencido" : `${daysLeft} días restantes`}
            </Badge>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button onClick={renew} className="gap-1.5">
              <MessageCircle className="h-4 w-4" /> Renovar plan
            </Button>
            <Button variant="outline" asChild>
              <Link to="/landing">Ver otros planes</Link>
            </Button>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          La renovación se procesa contactando a un asesor por WhatsApp. Si tu plan vence, conservaremos tus datos por 90 días adicionales según los Términos y Condiciones.
        </p>
      </CardContent>
    </Card>
  );
}

/* -------------------- helpers -------------------- */
function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1 block text-xs">{label}</Label>
      {children}
    </div>
  );
}
