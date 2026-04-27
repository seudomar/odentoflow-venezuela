import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  accent?: "primary" | "success" | "warning" | "muted";
}

const accentMap = {
  primary: "bg-primary/10 text-primary",
  success: "bg-[oklch(0.65_0.15_155)]/10 text-[oklch(0.55_0.15_155)]",
  warning: "bg-[oklch(0.75_0.15_75)]/15 text-[oklch(0.55_0.15_75)]",
  muted: "bg-muted text-muted-foreground",
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, accent = "primary" }: Props) {
  return (
    <Card className="overflow-hidden border-border/60 transition-all hover:shadow-[var(--shadow-elegant)] hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold text-foreground sm:text-3xl">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", accentMap[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[oklch(0.65_0.15_155)]/10 px-2 py-0.5 text-[11px] font-medium text-[oklch(0.5_0.15_155)]">
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
