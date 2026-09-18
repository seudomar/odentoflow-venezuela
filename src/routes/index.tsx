import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useBcvRate } from "@/lib/rate-store";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatCard } from "@/components/StatCard";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, UserPlus, DollarSign, Banknote, Clock } from "lucide-react";
import { useAppointments, STATUS_META } from "@/lib/appointments-store";
import { usePayments } from "@/lib/payments-store";
import { usePatients } from "@/lib/patients-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OdontoFlow — Dashboard para odontólogos" },
      { name: "description", content: "Gestión integral para clínicas dentales en Venezuela: citas, pacientes, ingresos en USD y Bs." },
    ],
  }),
  component: Dashboard,
});

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function Dashboard() {
  const [rate, setRate] = useBcvRate();
  const appointments = useAppointments();
  const payments = usePayments();
  const patients = usePatients();
  const [todayISO, setTodayISO] = useState("");
  const [today, setToday] = useState("");

  useEffect(() => {
    const now = new Date();
    setTodayISO(isoDay(now));
    setToday(now.toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
  }, []);

  const stats = useMemo(() => {
    if (!todayISO) {
      return { todays: [], pendientes: 0, nuevosSemana: 0, nuevosMes: 0, ingresosUSD: 0, ingresosMes: 0 };
    }
    const todays = appointments
      .filter((a) => a.date === todayISO && a.status !== "cancelado")
      .sort((a, b) => a.time.localeCompare(b.time));
    const pendientes = todays.filter((a) => a.status === "pendiente").length;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 864e5);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nuevosSemana = patients.filter((p) => p.createdAt && new Date(p.createdAt) >= weekAgo).length;
    const nuevosMes = patients.filter((p) => p.createdAt && new Date(p.createdAt) >= monthStart).length;

    const ingresosUSD = payments
      .filter((p) => p.date?.slice(0, 10) === todayISO)
      .reduce((s, p) => s + (p.amountUSD || 0), 0);
    const ingresosMes = payments
      .filter((p) => p.date && new Date(p.date) >= monthStart)
      .reduce((s, p) => s + (p.amountUSD || 0), 0);

    return { todays, pendientes, nuevosSemana, nuevosMes, ingresosUSD, ingresosMes };
  }, [appointments, payments, patients, todayISO]);

  const ingresosUSD = stats.ingresosUSD;
  const ingresosBs = ingresosUSD * rate;
  const upcoming = stats.todays;

  return (
    <AuthGuard>
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <DashboardHeader rate={rate} onRateChange={setRate} />
          <main className="flex-1 space-y-6 p-4 sm:p-6">
            <div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                Resumen de hoy
              </h2>
              <p className="text-sm text-muted-foreground">
                {today || "\u00A0"}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Citas de hoy"
                value={String(stats.todays.length)}
                subtitle={`${stats.pendientes} pendientes de confirmar`}
                icon={Calendar}
                accent="primary"
              />
              <StatCard
                title="Pacientes nuevos"
                value={String(stats.nuevosSemana)}
                subtitle={`Este mes: ${stats.nuevosMes}`}
                icon={UserPlus}
                accent="success"
              />
              <StatCard
                title="Ingresos en $"
                value={`$${ingresosUSD.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
                subtitle={`Mes: $${stats.ingresosMes.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
                icon={DollarSign}
                accent="primary"
              />
              <StatCard
                title="Ingresos en Bs."
                value={`Bs. ${ingresosBs.toLocaleString("es-VE", { maximumFractionDigits: 2 })}`}
                subtitle={`Tasa BCV: ${rate.toLocaleString("es-VE")}`}
                icon={Banknote}
                accent="warning"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Citas de hoy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {upcoming.length === 0 && (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No hay citas para hoy.{" "}
                      <Link to="/citas" className="text-primary hover:underline">Agendar una</Link>
                    </p>
                  )}
                  {upcoming.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-4 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/40"
                    >
                      <div className="flex h-10 w-14 shrink-0 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs font-semibold">{c.time}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{c.patientName}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.treatment}</p>
                      </div>
                      <span
                        className="hidden rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline"
                        style={{ color: STATUS_META[c.status].color, backgroundColor: STATUS_META[c.status].bg }}
                      >
                        {STATUS_META[c.status].label}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Conversión BCV</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl bg-gradient-to-br from-primary to-[oklch(0.7_0.15_240)] p-5 text-primary-foreground shadow-[var(--shadow-elegant)]">
                    <p className="text-xs uppercase tracking-wider opacity-80">Tasa actual</p>
                    <p className="mt-1 text-3xl font-bold">Bs. {rate.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</p>
                    <p className="mt-1 text-xs opacity-80">por 1 USD</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">$50</span>
                      <span className="font-medium">Bs. {(50 * rate).toLocaleString("es-VE", { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">$100</span>
                      <span className="font-medium">Bs. {(100 * rate).toLocaleString("es-VE", { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">$500</span>
                      <span className="font-medium">Bs. {(500 * rate).toLocaleString("es-VE", { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
    </AuthGuard>
  );
}
