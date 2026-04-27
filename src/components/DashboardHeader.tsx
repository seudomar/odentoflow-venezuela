import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bell, Check, Pencil, RefreshCw } from "lucide-react";

interface Props {
  rate: number;
  onRateChange: (v: number) => void;
}

export function DashboardHeader({ rate, onRateChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(rate.toString());

  const save = () => {
    const n = parseFloat(draft.replace(",", "."));
    if (!isNaN(n) && n > 0) onRateChange(n);
    setEditing(false);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <SidebarTrigger />
      <div className="hidden sm:block">
        <h1 className="text-sm font-semibold text-foreground">Panel de control</h1>
        <p className="text-xs text-muted-foreground">Bienvenido, Dr. Rodríguez</p>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 shadow-sm">
          <Label className="hidden text-xs font-medium text-muted-foreground sm:block">
            Tasa BCV del día
          </Label>
          <span className="text-xs text-muted-foreground sm:hidden">BCV</span>
          {editing ? (
            <>
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && save()}
                autoFocus
                inputMode="decimal"
                className="h-7 w-24 text-sm"
              />
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={save}>
                <Check className="h-4 w-4 text-primary" />
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm font-semibold text-primary">
                Bs. {rate.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => {
                  setDraft(rate.toString());
                  setEditing(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>

        <Button size="icon" variant="ghost" className="hidden sm:flex">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </Button>
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-[oklch(0.7_0.15_240)] text-sm font-semibold text-primary-foreground grid place-items-center">
          DR
        </div>
      </div>
    </header>
  );
}
