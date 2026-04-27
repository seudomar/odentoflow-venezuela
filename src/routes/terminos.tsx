import { createFileRoute, Link } from "@tanstack/react-router";
import { PatientLayout } from "@/components/PatientLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, Database, Lock, HeartPulse, CreditCard, Activity, ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/terminos")({
  head: () => ({
    meta: [
      { title: "Términos y Condiciones — OdontoFlow" },
      { name: "description", content: "Condiciones de uso, privacidad y resguardo de datos de OdontoFlow." },
      { property: "og:title", content: "Términos y Condiciones — OdontoFlow" },
      { property: "og:description", content: "Propiedad de los datos, seguridad, ética médica y suscripción." },
    ],
  }),
  component: TerminosPage,
});

const SECTIONS = [
  {
    icon: Database,
    title: "1. Propiedad de los Datos",
    body: "El Odontólogo (El Usuario) es el único dueño de la información de sus pacientes e historias clínicas. OdontoFlow actúa solo como un proveedor de infraestructura (almacenamiento en la nube). Podrás exportar tu base de datos en cualquier momento.",
  },
  {
    icon: Lock,
    title: "2. Seguridad y Resguardo",
    body: "Toda la información está cifrada y almacenada en servidores seguros (Supabase/AWS). El acceso a la cuenta está protegido por credenciales personales; el Usuario es responsable de mantener la confidencialidad de su contraseña.",
  },
  {
    icon: HeartPulse,
    title: "3. Cumplimiento con la Ética Médica",
    body: "OdontoFlow cumple con los principios de confidencialidad médica. No compartimos, vendemos ni analizamos datos de pacientes con fines comerciales o de publicidad de terceros.",
  },
  {
    icon: CreditCard,
    title: "4. Pagos y Suscripción",
    body: "Los planes se pagan por adelantado (mensual o anual). La falta de pago por más de 30 días resultará en la suspensión del acceso, pero resguardaremos tus datos por 90 días adicionales para que puedas recuperarlos.",
  },
  {
    icon: Activity,
    title: "5. Responsabilidad del Servicio",
    body: "Nos esforzamos por una disponibilidad del 99.9%. No nos hacemos responsables por fallas en el servicio de internet del Usuario o problemas de conectividad eléctrica locales que impidan el acceso a la plataforma.",
  },
];

function TerminosPage() {
  return (
    <PatientLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-foreground sm:text-2xl">
              <ShieldCheck className="h-5 w-5 text-primary" /> Términos y Condiciones
            </h1>
            <p className="text-xs text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString("es-VE", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="space-y-5 p-5 sm:p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Bienvenido a OdontoFlow. Al utilizar nuestra plataforma aceptas las siguientes condiciones que rigen el uso del servicio, la propiedad y el resguardo de la información clínica gestionada en el sistema.
            </p>

            {SECTIONS.map(({ icon: Icon, title, body }) => (
              <section key={title} className="rounded-lg border bg-muted/20 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </section>
            ))}

            <p className="border-t pt-4 text-xs text-muted-foreground">
              Si tienes preguntas sobre estas condiciones, escríbenos a{" "}
              <a className="text-primary hover:underline" href="mailto:legal@odontoflow.ve">legal@odontoflow.ve</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
}
