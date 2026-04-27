import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Stethoscope, Calendar, Wallet, FileText, Users, Check, MessageCircle,
  Sparkles, ShieldCheck, Smartphone, ArrowRight,
} from "lucide-react";
import heroImage from "@/assets/landing-hero.jpg";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "Software para Odontólogos en Venezuela | Gestiona Citas, Pagos y Pacientes" },
      {
        name: "description",
        content:
          "La plataforma líder para consultorios dentales en Venezuela. Automatiza recordatorios por WhatsApp, controla tus ingresos en $ y Bs., y gestiona historias clínicas desde tu celular.",
      },
      { property: "og:title", content: "OdontoFlow — Software para Odontólogos en Venezuela" },
      {
        property: "og:description",
        content:
          "Agenda, finanzas multimoneda y odontograma digital diseñado para el odontólogo venezolano. Prueba gratis 15 días.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "OdontoFlow — Software dental en Venezuela" },
      {
        name: "twitter:description",
        content: "Recordatorios por WhatsApp, control en $ y Bs., historias clínicas y comisiones automáticas.",
      },
    ],
  }),
  component: LandingPage,
});

const BENEFITS = [
  {
    icon: Calendar,
    title: "Módulo de Citas",
    text: "Reduce el ausentismo hasta en un 80% con recordatorios directos a WhatsApp. Confirma asistencia con un solo clic.",
    bullets: ["Calendario inteligente", "Plantillas de mensajes", "Estados de confirmación"],
  },
  {
    icon: Wallet,
    title: "Control Financiero",
    text: "Presupuestos automáticos a tasa BCV. Registra pagos en Zelle, Efectivo, Pago Móvil, Transferencia y Binance sin errores.",
    bullets: ["Multimoneda USD / Bs.", "Cierre de caja diario", "Métodos de pago configurables"],
  },
  {
    icon: FileText,
    title: "Historias Clínicas",
    text: "Lleva el historial de tus pacientes, radiografías y evolución visual siempre contigo, desde el celular o la PC.",
    bullets: ["Odontograma interactivo", "Archivos y rayos X", "Plan de tratamiento"],
  },
  {
    icon: Users,
    title: "Gestión de Especialistas",
    text: "Calcula comisiones automáticamente y olvida las cuentas manuales. Liquidación clara para tu equipo de doctores.",
    bullets: ["% por especialista", "Reporte por fecha", "Pagos pendientes / pagados"],
  },
];

const PLANS = [
  {
    name: "Inicial",
    tagline: "Para odontólogos que recién empiezan",
    price: "$15",
    period: "/mes",
    cta: "Empezar gratis",
    features: [
      "Hasta 100 pacientes",
      "Agenda y recordatorios",
      "Historia clínica básica",
      "1 usuario",
      "Soporte por email",
    ],
  },
  {
    name: "Profesional",
    tagline: "El más elegido por consultorios activos",
    price: "$29",
    period: "/mes",
    cta: "Empieza tu prueba",
    popular: true,
    features: [
      "Pacientes ilimitados",
      "WhatsApp + recordatorios automáticos",
      "Odontograma + plan de tratamiento",
      "Multimoneda USD / Bs.",
      "Hasta 3 usuarios",
      "Soporte prioritario",
    ],
  },
  {
    name: "Clínica",
    tagline: "Para equipos con varios especialistas",
    price: "$59",
    period: "/mes",
    cta: "Hablar con asesor",
    features: [
      "Todo lo del plan Profesional",
      "Comisiones por especialista",
      "Reportes y cierre de caja",
      "Usuarios ilimitados",
      "Multi-sucursal",
      "Onboarding personalizado",
    ],
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/landing" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="text-base font-semibold">OdontoFlow</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#beneficios" className="hover:text-foreground">Beneficios</a>
            <a href="#precios" className="hover:text-foreground">Precios</a>
            <Link to="/terminos" className="hover:text-foreground">Términos</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground sm:inline-flex"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/registro"
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--success)] px-3.5 py-2 text-sm font-medium text-[var(--success-foreground)] shadow-sm transition hover:opacity-90"
            >
              Prueba gratis
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.58_0.18_245_/_0.08),transparent_70%)]" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--success)_30%,transparent)] bg-[color-mix(in_oklab,var(--success)_10%,transparent)] px-3 py-1 text-xs font-medium text-[var(--success)]">
              <Sparkles className="h-3 w-3" /> Hecho en Venezuela 🇻🇪
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              El asistente digital que <span className="text-primary">llena tu agenda</span> y ordena tus finanzas.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Diseñado específicamente para la realidad del odontólogo venezolano.
              Control multimoneda, odontograma interactivo y recordatorios automáticos.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/registro"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--success)] px-5 py-3 text-sm font-semibold text-[var(--success-foreground)] shadow-lg shadow-[color-mix(in_oklab,var(--success)_25%,transparent)] transition hover:translate-y-[-1px] hover:opacity-95"
              >
                Empieza tu prueba gratis de 15 días
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#beneficios"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition hover:border-primary/40"
              >
                Ver beneficios
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[var(--success)]" /> Sin tarjeta de crédito</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[var(--success)]" /> Configuración en 5 minutos</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[var(--success)]" /> Soporte en español</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent blur-2xl" />
            <img
              src={heroImage}
              alt="OdontoFlow funcionando en una laptop y un teléfono móvil mostrando la agenda y los recordatorios por WhatsApp"
              width={1920}
              height={1080}
              className="relative w-full rounded-2xl border bg-card shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y bg-muted/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 text-center sm:grid-cols-4 sm:px-6">
          <Stat value="+1.200" label="Pacientes gestionados" />
          <Stat value="80%" label="Menos ausentismo" />
          <Stat value="USD/Bs." label="Multimoneda nativa" />
          <Stat value="99.9%" label="Disponibilidad" />
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Todo tu consultorio, en un solo lugar
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Cuatro módulos pensados para resolver lo que más te quita tiempo cada día.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <article
              key={b.title}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <b.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-foreground">{b.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
                </div>
              </div>
              <ul className="mt-5 grid gap-2 border-t pt-4 sm:grid-cols-2">
                {b.bullets.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Planes simples, sin sorpresas
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Comienza gratis 15 días. Cambia o cancela cuando quieras.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PLANS.map((p) => {
              const popular = p.popular;
              return (
                <div
                  key={p.name}
                  className={`relative flex flex-col rounded-2xl border bg-card p-6 ${popular ? "border-primary shadow-xl ring-2 ring-primary/30 lg:scale-[1.03]" : ""}`}
                >
                  {popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground shadow">
                      Más popular
                    </span>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{p.tagline}</p>
                  </div>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">{p.price}</span>
                    <span className="text-sm text-muted-foreground">{p.period}</span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/registro"
                    className={`mt-6 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                      popular
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-95"
                        : "border border-border bg-background text-foreground hover:border-primary/40"
                    }`}
                  >
                    {p.cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-[var(--primary-glow)] px-6 py-12 text-center text-primary-foreground shadow-2xl sm:px-12">
          <ShieldCheck className="mx-auto h-10 w-10 opacity-90" />
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
            Empieza a profesionalizar tu consultorio hoy
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm opacity-90 sm:text-base">
            Únete a los odontólogos venezolanos que ya están automatizando su agenda y sus cobros con OdontoFlow.
          </p>
          <Link
            to="/registro"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--success)] px-6 py-3 text-sm font-semibold text-[var(--success-foreground)] shadow-lg transition hover:translate-y-[-1px]"
          >
            Probar gratis 15 días <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-background">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Stethoscope className="h-5 w-5" />
              </div>
              <span className="text-base font-semibold">OdontoFlow</span>
            </div>
            <p className="mt-3 max-w-xs text-xs text-muted-foreground">
              Software de gestión dental hecho en Venezuela. Más agenda, menos papeleo.
            </p>
          </div>
          <div className="text-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Producto</p>
            <ul className="space-y-1.5">
              <li><a href="#beneficios" className="text-foreground/80 hover:text-foreground">Beneficios</a></li>
              <li><a href="#precios" className="text-foreground/80 hover:text-foreground">Precios</a></li>
              <li><Link to="/registro" className="text-foreground/80 hover:text-foreground">Crear cuenta</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Legal</p>
            <ul className="space-y-1.5">
              <li><Link to="/terminos" className="text-foreground/80 hover:text-foreground">Términos y Condiciones</Link></li>
              <li><Link to="/terminos" className="text-foreground/80 hover:text-foreground">Privacidad</Link></li>
              <li><a href="mailto:soporte@odontoflow.ve" className="text-foreground/80 hover:text-foreground">Contacto</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-[11px] text-muted-foreground sm:flex-row sm:px-6">
            <p>© {new Date().getFullYear()} OdontoFlow. Todos los derechos reservados.</p>
            <p className="flex items-center gap-1.5"><Smartphone className="h-3 w-3" /> Disponible en celular, tablet y PC</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp flotante */}
      <a
        href="https://wa.me/584140000000?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20sobre%20OdontoFlow"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Habla con un asesor por WhatsApp"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[oklch(0.65_0.16_150)] px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-[oklch(0.65_0.16_150_/_0.4)] transition hover:translate-y-[-2px] hover:bg-[oklch(0.6_0.17_150)] sm:px-5"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Habla con un asesor</span>
      </a>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-primary sm:text-3xl">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
