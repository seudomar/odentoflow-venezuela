import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Stethoscope, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Crear cuenta — OdontoFlow" },
      { name: "description", content: "Regístrate en OdontoFlow para gestionar tu consultorio dental." },
    ],
  }),
  component: RegistroPage,
});

function RegistroPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      toast.error("Debes aceptar los Términos y Condiciones para continuar.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Cuenta creada correctamente.");
      navigate({ to: "/" });
    }, 600);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-muted/40 via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Stethoscope className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Crear cuenta en OdontoFlow</CardTitle>
          <p className="text-xs text-muted-foreground">Comienza a gestionar tu consultorio dental</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label className="mb-1 block text-xs">Nombre completo</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Dr. Nombre Apellido" />
            </div>
            <div>
              <Label className="mb-1 block text-xs">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="doctor@email.com" />
            </div>
            <div>
              <Label className="mb-1 block text-xs">Contraseña</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" />
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
              {submitting ? "Creando cuenta…" : "Crear cuenta"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link to="/" className="text-primary hover:underline">Iniciar sesión</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
