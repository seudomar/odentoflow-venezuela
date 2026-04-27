import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useBcvRate } from "@/lib/rate-store";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatCard } from "@/components/StatCard";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, UserPlus, DollarSign, Banknote, Clock } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OdontoFlow — Dashboard para odontólogos" },
      { name: "description", content: "Gestión integral para clínicas dentales en Venezuela: citas, pacientes, ingresos en USD y Bs." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [rate, setRate] = useBcvRate();
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(new Date().toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
  }, []);
  const ingresosUSD = 1240;
  const ingresosBs = ingresosUSD * rate;

  const upcoming = [
    { time: "09:00", patient: "María González", treatment: "Limpieza dental" },
    { time: "10:30", patient: "Carlos Pérez", treatment: "Endodoncia · Sesión 2" },
    { time: "12:00", patient: "Ana Rodríguez", treatment: "Consulta inicial" },
    { time: "14:30", patient: "Luis Hernández", treatment: "Blanqueamiento" },
    { time: "16:00", patient: "Sofía Martínez", treatment: "Ortodoncia · Control" },
  ];

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
                value="8"
                subtitle="2 pendientes de confirmar"
                icon={Calendar}
                trend="+2 vs. ayer"
                accent="primary"
              />
              <StatCard
                title="Pacientes nuevos"
                value="3"
                subtitle="Esta semana: 11"
                icon={UserPlus}
                trend="+15% mensual"
                accent="success"
              />
              <StatCard
                title="Ingresos en $"
                value={`$${ingresosUSD.toLocaleString("en-US")}`}
                subtitle="Acumulado del día"
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
                  <CardTitle className="text-base">Próximas citas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {upcoming.map((c) => (
                    <div
                      key={c.time}
                      className="flex items-center gap-4 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/40"
                    >
                      <div className="flex h-10 w-14 shrink-0 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs font-semibold">{c.time}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{c.patient}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.treatment}</p>
                      </div>
                      <span className="hidden rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-[oklch(0.5_0.15_155)] sm:inline">
                        Confirmada
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
  );
}
