import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stethoscope, ShieldCheck, Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Crear cuenta — OdontoFlow" },
      {
        name: "description",
        content:
          "Regístrate gratis en OdontoFlow y comienza a digitalizar tu consultorio dental hoy mismo.",
      },
    ],
  }),
  component: RegistroPage,
});

const COUNTRY_CODES = [
  { code: "+58", label: "🇻🇪 +58 Venezuela" },
  { code: "+57", label: "🇨🇴 +57 Colombia" },
  { code: "+51", label: "🇵🇪 +51 Perú" },
  { code: "+52", label: "🇲🇽 +52 México" },
  { code: "+56", label: "🇨🇱 +56 Chile" },
  { code: "+54", label: "🇦🇷 +54 Argentina" },
  { code: "+593", label: "🇪🇨 +593 Ecuador" },
  { code: "+1", label: "🇺🇸 +1 USA" },
  { code: "+34", label: "🇪🇸 +34 España" },
];

const SUPPORT_PHONE = "584140000000"; // número de soporte de OdontoFlow (sin +)

function RegistroPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+58");
  const [whatsapp, setWhatsapp] = useState("");
  const [clinic, setClinic] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [createdName, setCreatedName] = useState("");

  const firstName = (createdName || name).trim().split(" ")[0] || "Doctor";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      toast.error("Debes aceptar los Términos y Condiciones para continuar.");
      return;
    }
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setSubmitting(true);
    try {
      const fullPhone = `${countryCode}${whatsapp.replace(/\D/g, "")}`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: name,
            clinic_name: clinic,
            whatsapp: fullPhone,
          },
        },
      });
      if (error) throw error;
      setCreatedName(name);
      setWelcomeOpen(true);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      let msg = e?.message || "No se pudo crear la cuenta.";
      if (e?.code === "weak_password" || /pwned|weak.?password/i.test(msg)) {
        msg = "Esa contraseña es muy común y aparece en filtraciones públicas. Usa una más segura: combina mayúsculas, minúsculas, números y un símbolo (mínimo 8 caracteres).";
      } else if (e?.code === "user_already_exists" || /already registered|already exists/i.test(msg)) {
        msg = "Ya existe una cuenta con ese correo. Intenta iniciar sesión.";
      } else if (/invalid.*email/i.test(msg)) {
        msg = "El correo electrónico no es válido.";
      }
      toast.error(msg, { duration: 6000 });
    } finally {
      setSubmitting(false);
    }
  };

  const goToDashboard = () => {
    setWelcomeOpen(false);
    navigate({ to: "/" });
  };

  const contactSupport = () => {
    const text = encodeURIComponent(
      "Hola, acabo de registrarme en OdontoFlow y quiero mi asesoría gratuita de 15 minutos para configurar mi consultorio.",
    );
    window.open(`https://wa.me/${SUPPORT_PHONE}?text=${text}`, "_blank");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-muted/40 via-background to-primary/5 p-4">
      <Card className="w-full max-w-lg border-border/60 shadow-2xl shadow-primary/5">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Stethoscope className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Crea tu cuenta en OdontoFlow</CardTitle>
          <p className="text-sm text-muted-foreground">
            Empieza a gestionar tu consultorio en menos de 2 minutos
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label className="mb-1 block text-xs">Nombre completo del Doctor / Clínica</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Dr. Nombre Apellido"
              />
            </div>

            <div>
              <Label className="mb-1 block text-xs">Correo electrónico</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="doctor@email.com"
              />
            </div>

            <div>
              <Label className="mb-1 block text-xs">WhatsApp de contacto</Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-[140px] shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  inputMode="tel"
                  placeholder="4141234567"
                />
              </div>
            </div>

            <div>
              <Label className="mb-1 block text-xs">Nombre del Consultorio</Label>
              <Input
                value={clinic}
                onChange={(e) => setClinic(e.target.value)}
                required
                placeholder="Clínica Dental Sonrisa"
              />
            </div>

            <div>
              <Label className="mb-1 block text-xs">Contraseña</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border bg-muted/30 p-3">
              <Checkbox
                id="terms"
                checked={accepted}
                onCheckedChange={(c) => setAccepted(!!c)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-xs leading-relaxed text-muted-foreground">
                He leído y acepto los{" "}
                <Link to="/terminos" target="_blank" className="font-medium text-primary hover:underline">
                  Términos y Condiciones
                </Link>{" "}
                de OdontoFlow, incluyendo las políticas de propiedad de datos, seguridad y suscripción.
              </label>
            </div>

            <Button type="submit" className="w-full gap-1.5" disabled={!accepted || submitting}>
              <ShieldCheck className="h-4 w-4" />
              {submitting ? "Creando cuenta…" : "Crear mi cuenta"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link to="/" className="text-primary hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <Dialog open={welcomeOpen} onOpenChange={setWelcomeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg">
              <Sparkles className="h-7 w-7" />
            </div>
            <DialogTitle className="text-center text-xl">
              ¡Bienvenido a la evolución de tu consulta, Dr. {firstName}!
            </DialogTitle>
            <DialogDescription className="text-center">
              Ya puedes configurar tu primer paciente y comenzar a digitalizar tu consultorio.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button onClick={goToDashboard} className="w-full gap-1.5">
              Ir al Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={contactSupport}
              className="w-full gap-1.5"
            >
              <MessageCircle className="h-4 w-4" />
              Contactar a soporte por activación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
