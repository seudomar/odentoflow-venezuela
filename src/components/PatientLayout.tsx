import { useEffect, useState, type ReactNode } from "react";
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

