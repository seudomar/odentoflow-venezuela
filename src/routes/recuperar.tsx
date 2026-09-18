import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/recuperar")({
  head: () => ({
    meta: [
      { title: "Recuperar contraseña — OdontoFlow" },
      { name: "description", content: "Restablece la contraseña de tu consultorio en OdontoFlow." },
      { property: "og:title", content: "Recuperar contraseña — OdontoFlow" },
      { property: "og:description", content: "Restablece la contraseña de tu consultorio en OdontoFlow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RecuperarPage,
});

function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo enviar el correo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-muted/40 via-background to-primary/5 p-4">
      <Card className="w-full max-w-md border-border/60 shadow-2xl shadow-primary/5">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            {sent ? <MailCheck className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
          </div>
          <CardTitle className="text-xl">
            {sent ? "Revisa tu correo" : "Recuperar contraseña"}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {sent
              ? `Enviamos un enlace a ${email} para crear una nueva contraseña.`
              : "Te enviaremos un enlace para crear una nueva contraseña."}
          </p>
        </CardHeader>
        <CardContent>
          {sent ? (
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Volver a iniciar sesión</Link>
            </Button>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label className="mb-1 block text-xs">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="doctor@email.com"
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Enviando…" : "Enviar enlace"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                <Link to="/login" className="text-primary hover:underline">Volver a iniciar sesión</Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
