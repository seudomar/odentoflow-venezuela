import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useBcvRate } from "@/lib/rate-store";

export function PatientLayout({ children }: { children: ReactNode }) {
  const [rate, setRate] = useBcvRate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <DashboardHeader rate={rate} onRateChange={setRate} />
          <main className="flex-1 p-4 sm:p-6">{mounted ? children : null}</main>
          <footer className="border-t bg-background/60 px-4 py-4 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-2 text-[11px] text-muted-foreground sm:flex-row">
              <p>© {new Date().getFullYear()} OdontoFlow · Gestión dental</p>
              <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <Link to="/terminos" className="hover:text-foreground hover:underline">
                  Términos y Condiciones
                </Link>
                <a href="mailto:soporte@odontoflow.ve" className="hover:text-foreground hover:underline">
                  Soporte
                </a>
              </nav>
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
