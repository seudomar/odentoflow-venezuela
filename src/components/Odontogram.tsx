import { TOOTH_NUMBERS, STATUS_META, type ToothStatus, patientsStore } from "@/lib/patients-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  patientId: string;
  teeth: Record<number, ToothStatus>;
}

const STATUSES: ToothStatus[] = ["sano", "caries", "tratado", "ausente"];

function ToothChip({
  number,
  status,
  onChange,
}: {
  number: number;
  status: ToothStatus;
  onChange: (s: ToothStatus) => void;
}) {
  const meta = STATUS_META[status];
  return (
    <div
      className="flex items-center gap-2 rounded-lg border bg-card p-2 transition-shadow hover:shadow-sm"
      style={{ borderColor: meta.color + "40" }}
    >
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-xs font-bold"
        style={{ background: meta.bg, color: meta.color }}
      >
        {number}
      </div>
      <Select value={status} onValueChange={(v) => onChange(v as ToothStatus)}>
        <SelectTrigger className="h-8 w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="text-xs">
              <span className="inline-flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: STATUS_META[s].color }}
                />
                {STATUS_META[s].label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function Odontogram({ patientId, teeth }: Props) {
  const quadrants = [
    { label: "Superior derecho", nums: TOOTH_NUMBERS.slice(0, 8) },
    { label: "Superior izquierdo", nums: TOOTH_NUMBERS.slice(8, 16) },
    { label: "Inferior derecho", nums: TOOTH_NUMBERS.slice(16, 24) },
    { label: "Inferior izquierdo", nums: TOOTH_NUMBERS.slice(24, 32) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        {STATUSES.map((s) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block h-3 w-3 rounded"
              style={{ background: STATUS_META[s].color }}
            />
            {STATUS_META[s].label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {quadrants.map((q) => (
          <div key={q.label}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {q.label}
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {q.nums.map((n) => (
                <ToothChip
                  key={n}
                  number={n}
                  status={teeth[n] || "sano"}
                  onChange={(s) => patientsStore.setTooth(patientId, n, s)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
