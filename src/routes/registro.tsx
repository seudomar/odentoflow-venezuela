import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
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
import {
  Stethoscope,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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

const COMMON_PASSWORDS = new Set([
  "12345678", "123456789", "1234567890", "password", "password1", "qwerty123",
  "11111111", "00000000", "abc12345", "iloveyou", "admin123", "welcome1",
]);

const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(72, "Máximo 72 caracteres")
  .regex(/[a-z]/, "Debe incluir una letra minúscula")
  .regex(/[A-Z]/, "Debe incluir una letra mayúscula")
  .regex(/[0-9]/, "Debe incluir un número")
  .refine((v) => !COMMON_PASSWORDS.has(v.toLowerCase()), "Esta contraseña es muy común");

const registroSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Ingresa tu nombre completo (mínimo 3 caracteres)")
    .max(100, "Máximo 100 caracteres")
    .regex(/^[\p{L}\s.'-]+$/u, "Solo letras, espacios y puntuación básica"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Correo electrónico no válido")
    .max(255, "Máximo 255 caracteres"),
  whatsapp: z
    .string()
    .regex(/^\d{7,15}$/, "Solo números (7 a 15 dígitos, sin espacios)"),
  clinic: z
    .string()
    .trim()
    .min(2, "Ingresa el nombre del consultorio")
    .max(100, "Máximo 100 caracteres"),
  password: passwordSchema,
});

type FieldErrors = Partial<Record<"name" | "email" | "whatsapp" | "clinic" | "password", string>>;

function evaluatePasswordStrength(pwd: string) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (COMMON_PASSWORDS.has(pwd.toLowerCase())) score = Math.min(score, 1);
  const labels = ["Muy débil", "Débil", "Regular", "Buena", "Fuerte", "Excelente"];
  const colors = [
    "bg-destructive",
    "bg-destructive",
    "bg-amber-500",
    "bg-amber-400",
    "bg-emerald-500",
    "bg-emerald-600",
  ];
  return { score, label: labels[score] ?? "Débil", color: colors[score] ?? "bg-destructive" };
}

function RegistroPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+58");
  const [whatsapp, setWhatsapp] = useState("");
  const [clinic, setClinic] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [createdName, setCreatedName] = useState("");

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  const firstName = (createdName || name).trim().split(" ")[0] || "Doctor";

  const validateField = (field: keyof FieldErrors, value: string) => {
    const result = registroSchema.shape[field].safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }));
  };

  const markTouched = (field: string) => setTouched((p) => ({ ...p, [field]: true }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      toast.error("Debes aceptar los Términos y Condiciones para continuar.");
      return;
    }
    const parsed = registroSchema.safeParse({ name, email, whatsapp, clinic, password });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setTouched({ name: true, email: true, whatsapp: true, clinic: true, password: true });
      toast.error("Revisa los datos: hay campos con errores.");
      return;
    }
    setSubmitting(true);
    try {
      const fullPhone = `${countryCode}${parsed.data.whatsapp}`;
      const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: parsed.data.name,
            clinic_name: parsed.data.clinic,
            whatsapp: fullPhone,
          },
        },
      });
      if (error) throw error;
      setCreatedName(parsed.data.name);
      setWelcomeOpen(true);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      let msg = e?.message || "No se pudo crear la cuenta.";
      if (e?.code === "weak_password" || /pwned|weak.?password/i.test(msg)) {
        msg = "Esa contraseña aparece en filtraciones públicas conocidas. Usa una más segura combinando mayúsculas, minúsculas, números y un símbolo.";
        setErrors((p) => ({ ...p, password: "Contraseña filtrada — elige otra" }));
      } else if (e?.code === "user_already_exists" || /already registered|already exists/i.test(msg)) {
        msg = "Ya existe una cuenta con ese correo. Intenta iniciar sesión.";
        setErrors((p) => ({ ...p, email: "Ese correo ya está registrado" }));
      } else if (/invalid.*email/i.test(msg)) {
        msg = "El correo electrónico no es válido.";
        setErrors((p) => ({ ...p, email: "Correo no válido" }));
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
          <form onSubmit={submit} noValidate className="space-y-4">
            <Field label="Nombre completo del Doctor / Clínica" error={touched.name ? errors.name : undefined}>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (touched.name) validateField("name", e.target.value);
                }}
                onBlur={() => { markTouched("name"); validateField("name", name); }}
                aria-invalid={!!(touched.name && errors.name)}
                className={touched.name && errors.name ? "border-destructive" : ""}
                placeholder="Dr. Nombre Apellido"
                maxLength={100}
              />
            </Field>

            <Field label="Correo electrónico" error={touched.email ? errors.email : undefined}>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) validateField("email", e.target.value);
                }}
                onBlur={() => { markTouched("email"); validateField("email", email); }}
                aria-invalid={!!(touched.email && errors.email)}
                className={touched.email && errors.email ? "border-destructive" : ""}
                placeholder="doctor@email.com"
                maxLength={255}
                autoComplete="email"
              />
            </Field>

            <Field label="WhatsApp de contacto" error={touched.whatsapp ? errors.whatsapp : undefined} hint="Solo números, sin espacios ni guiones.">
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
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 15);
                    setWhatsapp(digits);
                    if (touched.whatsapp) validateField("whatsapp", digits);
                  }}
                  onBlur={() => { markTouched("whatsapp"); validateField("whatsapp", whatsapp); }}
                  aria-invalid={!!(touched.whatsapp && errors.whatsapp)}
                  className={touched.whatsapp && errors.whatsapp ? "border-destructive" : ""}
                  inputMode="numeric"
                  placeholder="4141234567"
                />
              </div>
            </Field>

            <Field label="Nombre del Consultorio" error={touched.clinic ? errors.clinic : undefined}>
              <Input
                value={clinic}
                onChange={(e) => {
                  setClinic(e.target.value);
                  if (touched.clinic) validateField("clinic", e.target.value);
                }}
                onBlur={() => { markTouched("clinic"); validateField("clinic", clinic); }}
                aria-invalid={!!(touched.clinic && errors.clinic)}
                className={touched.clinic && errors.clinic ? "border-destructive" : ""}
                placeholder="Clínica Dental Sonrisa"
                maxLength={100}
              />
            </Field>

            <div>
              <Label className="mb-1 block text-xs">Contraseña</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) validateField("password", e.target.value);
                  }}
                  onBlur={() => { markTouched("password"); validateField("password", password); }}
                  aria-invalid={!!(touched.password && errors.password)}
                  className={cn(
                    "pr-10",
                    touched.password && errors.password && "border-destructive",
                  )}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  maxLength={72}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex h-1.5 gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-full flex-1 rounded-full transition-colors",
                          i < strength.score ? strength.color : "bg-muted",
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Fortaleza: <span className="font-medium text-foreground">{strength.label}</span>
                  </p>
                  <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                    <Requisito ok={password.length >= 8} text="8+ caracteres" />
                    <Requisito ok={/[A-Z]/.test(password)} text="Una mayúscula" />
                    <Requisito ok={/[a-z]/.test(password)} text="Una minúscula" />
                    <Requisito ok={/[0-9]/.test(password)} text="Un número" />
                    <Requisito ok={/[^A-Za-z0-9]/.test(password)} text="Un símbolo (recomendado)" />
                    <Requisito ok={!COMMON_PASSWORDS.has(password.toLowerCase()) && password.length > 0} text="No es muy común" />
                  </ul>
                </div>
              )}

              {touched.password && errors.password && (
                <p className="mt-1.5 flex items-center gap-1 text-[11px] text-destructive">
                  <AlertCircle className="h-3 w-3" /> {errors.password}
                </p>
              )}
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
