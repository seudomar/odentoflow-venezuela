import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PatientLayout } from "@/components/PatientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DollarSign,
  Banknote,
  Plus,
  Trash2,
  Receipt,
  FileText,
  Wallet,
  Smartphone,
  HandCoins,
  Calculator,
  Printer,
  CreditCard,
  Pencil,
  CheckCircle2,
  XCircle,
  Landmark,
  Bitcoin,
} from "lucide-react";
import { useBcvRate } from "@/lib/rate-store";
import {
  paymentsStore,
  usePayments,
  METHOD_OPTIONS,
  type Currency,
  type PaymentMethod,
} from "@/lib/payments-store";
import {
  paymentAccountsStore,
  usePaymentAccounts,
  type PaymentAccount,
} from "@/lib/payment-accounts-store";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/finanzas")({
  head: () => ({
    meta: [
      { title: "Pagos y presupuestos — OdontoFlow" },
      { name: "description", content: "Registra pagos en USD/Bs. y genera presupuestos con conversión BCV automática." },
    ],
  }),
  component: FinanzasPage,
});

const fmtUSD = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtBs = (n: number) => `Bs. ${n.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function FinanzasPage() {
  const [rate] = useBcvRate();

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">Pagos y presupuestos</h2>
            <p className="text-sm text-muted-foreground">
              Tasa BCV vigente: <span className="font-semibold text-primary">{fmtBs(rate)}</span> por USD
            </p>
          </div>
        </div>

        <Tabs defaultValue="pagos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="pagos" className="gap-1.5"><Receipt className="h-3.5 w-3.5" /> Pagos</TabsTrigger>
            <TabsTrigger value="presupuesto" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Presupuesto</TabsTrigger>
            <TabsTrigger value="metodos" className="gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Métodos</TabsTrigger>
          </TabsList>

          <TabsContent value="pagos">
            <PagosSection rate={rate} />
          </TabsContent>

          <TabsContent value="presupuesto">
            <PresupuestoSection rate={rate} />
          </TabsContent>

          <TabsContent value="metodos">
            <MetodosSection />
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayout>
  );
}

/* ---------------- PAGOS ---------------- */

function PagosSection({ rate }: { rate: number }) {
  const payments = usePayments();
  const [form, setForm] = useState({
    patientName: "",
    amount: "",
    currency: "USD" as Currency,
    method: "Efectivo" as PaymentMethod,
    note: "",
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const amountNum = parseFloat(form.amount) || 0;
  const equivalentUSD = form.currency === "USD" ? amountNum : amountNum / rate;
  const equivalentBs = form.currency === "USD" ? amountNum * rate : amountNum;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName.trim() || amountNum <= 0) return;
    paymentsStore.add({
      patientName: form.patientName.trim(),
      amount: amountNum,
      currency: form.currency,
      method: form.method,
      rate,
      note: form.note.trim() || undefined,
    });
    setForm({ patientName: "", amount: "", currency: "USD", method: "Efectivo", note: "" });
  };

  const totals = useMemo(() => {
    const totalUSD = payments.reduce((s, p) => s + p.amountUSD, 0);
    return { totalUSD, totalBs: totalUSD * rate, count: payments.length };
  }, [payments, rate]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4 text-primary" /> Registrar pago
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1">
              <Label>Paciente *</Label>
              <Input
                value={form.patientName}
                onChange={(e) => set("patientName", e.target.value)}
                required
                maxLength={100}
                placeholder="Nombre del paciente"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Monto *</Label>
                <Input
                  value={form.amount}
                  onChange={(e) => set("amount", e.target.value.replace(/[^\d.,]/g, "").replace(",", "."))}
                  inputMode="decimal"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Moneda</Label>
                <Select value={form.currency} onValueChange={(v) => set("currency", v as Currency)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="VEF">VEF (Bs.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Método de pago</Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {METHOD_OPTIONS.map((m) => {
                  const Icon =
                    m === "Zelle" ? Wallet :
                    m === "Efectivo" ? HandCoins :
                    m === "Pago Móvil" ? Smartphone :
                    m === "Transferencia" ? Landmark :
                    Bitcoin;
                  const active = form.method === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set("method", m)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-2.5 text-[11px] font-medium transition-all ${
                        active
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/40"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Nota</Label>
              <Textarea value={form.note} onChange={(e) => set("note", e.target.value)} maxLength={300} className="min-h-[60px]" placeholder="Referencia, concepto..." />
            </div>

            {/* Conversion preview */}
            {amountNum > 0 && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Equivalencia (tasa BCV {fmtBs(rate)})
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                    <DollarSign className="h-3.5 w-3.5 text-primary" />
                    {fmtUSD(equivalentUSD)}
                  </span>
                  <span className="text-muted-foreground">≡</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                    <Banknote className="h-3.5 w-3.5 text-[oklch(0.55_0.15_75)]" />
                    {fmtBs(equivalentBs)}
                  </span>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full">Registrar pago</Button>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Pagos recientes</CardTitle>
          <div className="text-right">
            <p className="text-[11px] uppercase text-muted-foreground">Total {totals.count} pagos</p>
            <p className="text-sm font-bold text-foreground">{fmtUSD(totals.totalUSD)} · {fmtBs(totals.totalBs)}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {payments.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-border/60 p-10 text-center">
              <Receipt className="mx-auto h-7 w-7 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">Aún no hay pagos registrados</p>
            </div>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  {p.method === "Zelle" ? <Wallet className="h-4 w-4" /> : p.method === "Efectivo" ? <HandCoins className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-foreground">{p.patientName}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{p.method}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {p.currency === "USD" ? fmtUSD(p.amount) : fmtBs(p.amount)} · {new Date(p.date).toLocaleDateString("es-VE")}
                  </p>
                  {p.note && <p className="truncate text-[11px] text-muted-foreground/80">{p.note}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{fmtUSD(p.amountUSD)}</p>
                  <p className="text-[11px] text-muted-foreground">{fmtBs(p.amountUSD * p.rate)}</p>
                  <p className="text-[10px] text-muted-foreground/70">tasa: {p.rate.toFixed(2)}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => paymentsStore.remove(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- PRESUPUESTO ---------------- */

interface BudgetItem {
  id: string;
  service: string;
  qty: number;
  priceUSD: number;
}

const STARTER: BudgetItem[] = [
  { id: "i1", service: "", qty: 1, priceUSD: 0 },
];

function PresupuestoSection({ rate }: { rate: number }) {
  const [patient, setPatient] = useState("");
  const [items, setItems] = useState<BudgetItem[]>(STARTER);

  const updateItem = (id: string, patch: Partial<BudgetItem>) =>
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const removeItem = (id: string) => setItems((arr) => (arr.length > 1 ? arr.filter((i) => i.id !== id) : arr));
  const addItem = () =>
    setItems((arr) => [...arr, { id: `i${Date.now()}`, service: "", qty: 1, priceUSD: 0 }]);

  const totals = useMemo(() => {
    const usd = items.reduce((s, i) => s + i.qty * i.priceUSD, 0);
    return { usd, bs: usd * rate };
  }, [items, rate]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="h-4 w-4 text-primary" /> Generador de presupuesto
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Los precios se cargan en USD. La conversión a Bs. se calcula con la tasa del día.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
          <Printer className="h-3.5 w-3.5" /> Imprimir
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label>Paciente</Label>
          <Input value={patient} onChange={(e) => setPatient(e.target.value)} maxLength={100} placeholder="Nombre del paciente" />
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-lg border md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Servicio</th>
                <th className="w-20 px-3 py-2 text-center font-medium">Cant.</th>
                <th className="w-32 px-3 py-2 text-right font-medium">Precio USD</th>
                <th className="w-28 px-3 py-2 text-right font-medium">Subtotal $</th>
                <th className="w-32 px-3 py-2 text-right font-medium">Subtotal Bs.</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((it) => {
                const subUSD = it.qty * it.priceUSD;
                return (
                  <tr key={it.id}>
                    <td className="px-2 py-1.5">
                      <Input value={it.service} onChange={(e) => updateItem(it.id, { service: e.target.value })} placeholder="Ej. Limpieza dental" maxLength={120} className="h-9 border-transparent shadow-none focus-visible:border-input" />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input type="number" min={1} value={it.qty} onChange={(e) => updateItem(it.id, { qty: Math.max(1, parseInt(e.target.value) || 1) })} className="h-9 text-center" />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input type="number" min={0} step="0.01" value={it.priceUSD || ""} onChange={(e) => updateItem(it.id, { priceUSD: parseFloat(e.target.value) || 0 })} className="h-9 text-right" placeholder="0.00" />
                    </td>
                    <td className="px-3 py-1.5 text-right text-sm font-medium">{fmtUSD(subUSD)}</td>
                    <td className="px-3 py-1.5 text-right text-sm text-muted-foreground">{fmtBs(subUSD * rate)}</td>
                    <td className="px-2 py-1.5">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeItem(it.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {items.map((it) => {
            const subUSD = it.qty * it.priceUSD;
            return (
              <div key={it.id} className="space-y-2 rounded-lg border p-3">
                <Input value={it.service} onChange={(e) => updateItem(it.id, { service: e.target.value })} placeholder="Servicio" maxLength={120} />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Cant.</Label>
                    <Input type="number" min={1} value={it.qty} onChange={(e) => updateItem(it.id, { qty: Math.max(1, parseInt(e.target.value) || 1) })} />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Precio $</Label>
                    <Input type="number" min={0} step="0.01" value={it.priceUSD || ""} onChange={(e) => updateItem(it.id, { priceUSD: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                  </div>
                </div>
                <div className="flex items-center justify-between border-t pt-2 text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-right">
                    <span className="font-medium">{fmtUSD(subUSD)}</span>
                    <span className="block text-[11px] text-muted-foreground">{fmtBs(subUSD * rate)}</span>
                  </span>
                </div>
                <Button size="sm" variant="ghost" className="w-full text-destructive" onClick={() => removeItem(it.id)}>
                  <Trash2 className="mr-1 h-4 w-4" /> Eliminar
                </Button>
              </div>
            );
          })}
        </div>

        <Button variant="outline" onClick={addItem} className="w-full gap-2">
          <Plus className="h-4 w-4" /> Agregar servicio
        </Button>

        {/* Totals */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total en USD</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{fmtUSD(totals.usd)}</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-primary to-[oklch(0.7_0.15_240)] p-4 text-primary-foreground shadow-[var(--shadow-elegant)]">
            <p className="text-xs uppercase tracking-wide opacity-80">Total en Bs. (tasa {rate.toFixed(2)})</p>
            <p className="mt-1 text-3xl font-bold">{fmtBs(totals.bs)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------- MÉTODOS DE PAGO (CONFIG) ---------------- */

function methodIcon(m: PaymentMethod) {
  if (m === "Zelle") return Wallet;
  if (m === "Efectivo") return HandCoins;
  if (m === "Pago Móvil") return Smartphone;
  if (m === "Transferencia") return Landmark;
  if (m === "Binance") return Bitcoin;
  return Wallet;
}

const EMPTY_ACCOUNT: Omit<PaymentAccount, "id"> = {
  method: "Zelle",
  label: "",
  holder: "",
  email: "",
  bank: "",
  phone: "",
  idNumber: "",
  accountNumber: "",
  accountType: "Corriente",
  swiftCode: "",
  binanceId: "",
  binanceNetwork: "",
  binanceEmail: "",
  instructions: "",
  active: true,
};

function MetodosSection() {
  const accounts = usePaymentAccounts();
  const [editing, setEditing] = useState<PaymentAccount | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-primary" /> Métodos de pago disponibles
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Estos datos se mostrarán al paciente o secretaria al seleccionar el método al agendar una cita.
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Agregar
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {accounts.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-border/60 p-10 text-center">
              <CreditCard className="mx-auto h-7 w-7 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">Aún no has registrado métodos de pago.</p>
            </div>
          ) : (
            accounts.map((a) => {
              const Icon = methodIcon(a.method);
              return (
                <div key={a.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-foreground">{a.label || a.method}</p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{a.method}</span>
                      {a.active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.65_0.15_155/0.18)] px-2 py-0.5 text-[11px] font-medium text-[oklch(0.45_0.15_155)]">
                          <CheckCircle2 className="h-3 w-3" /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                          <XCircle className="h-3 w-3" /> Inactivo
                        </span>
                      )}
                    </div>
                    <AccountDetails a={a} compact />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={a.active}
                      onCheckedChange={(v) => paymentAccountsStore.update(a.id, { active: v })}
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(a)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => paymentAccountsStore.remove(a.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <AccountDialog
        open={creating || !!editing}
        initial={editing ?? EMPTY_ACCOUNT}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onSave={(data) => {
          if (editing) paymentAccountsStore.update(editing.id, data);
          else paymentAccountsStore.add(data);
          setEditing(null);
          setCreating(false);
        }}
      />
    </div>
  );
}

export function AccountDetails({ a, compact = false }: { a: PaymentAccount; compact?: boolean }) {
  const rows: Array<[string, string | undefined]> = [
    ["Titular", a.holder],
    ["Email", a.email],
    ["Banco", a.bank],
    ["N° Cuenta", a.accountNumber],
    ["Tipo", a.accountType],
    ["SWIFT", a.swiftCode],
    ["Teléfono", a.phone],
    ["Cédula/RIF", a.idNumber],
    ["Binance ID", a.binanceId],
    ["Email Binance", a.binanceEmail],
    ["Red/Moneda", a.binanceNetwork],
    ["Instrucciones", a.instructions],
  ];
  const filled = rows.filter(([, v]) => v && v.trim() !== "");
  if (filled.length === 0) return null;

  if (compact) {
    return (
      <p className="truncate text-xs text-muted-foreground">
        {filled.map(([k, v]) => `${k}: ${v}`).join(" · ")}
      </p>
    );
  }

  return (
    <dl className="grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-[110px_1fr]">
      {filled.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:py-0.5">{k}</dt>
          <dd className="text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function AccountDialog({
  open,
  initial,
  onSave,
  onClose,
}: {
  open: boolean;
  initial: Omit<PaymentAccount, "id"> | PaymentAccount;
  onSave: (data: Omit<PaymentAccount, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<PaymentAccount, "id">>(initial);
  // Reset when initial changes
  const initialKey = "id" in initial ? initial.id : "new";
  const [key, setKey] = useState(initialKey);
  if (key !== initialKey) {
    setKey(initialKey);
    setForm(initial);
  }
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim() || !form.holder.trim()) return;
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{"id" in initial ? "Editar método" : "Nuevo método de pago"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label>Tipo *</Label>
            <Select value={form.method} onValueChange={(v) => set("method", v as PaymentMethod)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {METHOD_OPTIONS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Etiqueta *</Label>
            <Input value={form.label} onChange={(e) => set("label", e.target.value)} required maxLength={60} placeholder="Ej. Zelle Principal" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Titular *</Label>
            <Input value={form.holder} onChange={(e) => set("holder", e.target.value)} required maxLength={100} />
          </div>

          {form.method === "Zelle" && (
            <div className="space-y-1 sm:col-span-2">
              <Label>Email Zelle</Label>
              <Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} maxLength={120} placeholder="pagos@correo.com" />
            </div>
          )}

          {form.method === "Pago Móvil" && (
            <>
              <div className="space-y-1 sm:col-span-2">
                <Label>Banco</Label>
                <Input value={form.bank ?? ""} onChange={(e) => set("bank", e.target.value)} maxLength={80} placeholder="0102 - Banco de Venezuela" />
              </div>
              <div className="space-y-1">
                <Label>Teléfono</Label>
                <Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))} maxLength={15} placeholder="04141234567" inputMode="numeric" />
              </div>
              <div className="space-y-1">
                <Label>Cédula/RIF</Label>
                <Input value={form.idNumber ?? ""} onChange={(e) => set("idNumber", e.target.value)} maxLength={20} placeholder="V-12345678" />
              </div>
            </>
          )}

          {form.method === "Transferencia" && (
            <>
              <div className="space-y-1 sm:col-span-2">
                <Label>Banco *</Label>
                <Input value={form.bank ?? ""} onChange={(e) => set("bank", e.target.value)} maxLength={80} placeholder="0134 - Banesco" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Número de cuenta *</Label>
                <Input value={form.accountNumber ?? ""} onChange={(e) => set("accountNumber", e.target.value.replace(/[^\d-]/g, ""))} maxLength={30} placeholder="0134-0000-00-0000000000" inputMode="numeric" />
              </div>
              <div className="space-y-1">
                <Label>Tipo de cuenta</Label>
                <Select value={form.accountType ?? "Corriente"} onValueChange={(v) => set("accountType", v as "Corriente" | "Ahorro")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Corriente">Corriente</SelectItem>
                    <SelectItem value="Ahorro">Ahorro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Cédula/RIF</Label>
                <Input value={form.idNumber ?? ""} onChange={(e) => set("idNumber", e.target.value)} maxLength={20} placeholder="V-12345678" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>SWIFT / Código (opcional)</Label>
                <Input value={form.swiftCode ?? ""} onChange={(e) => set("swiftCode", e.target.value.toUpperCase())} maxLength={20} placeholder="BANEVECA" />
              </div>
            </>
          )}

          {form.method === "Binance" && (
            <>
              <div className="space-y-1 sm:col-span-2">
                <Label>Binance Pay ID *</Label>
                <Input value={form.binanceId ?? ""} onChange={(e) => set("binanceId", e.target.value.replace(/\D/g, ""))} maxLength={20} placeholder="123456789" inputMode="numeric" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Email Binance</Label>
                <Input type="email" value={form.binanceEmail ?? ""} onChange={(e) => set("binanceEmail", e.target.value)} maxLength={120} placeholder="usuario@correo.com" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Red / Moneda aceptada</Label>
                <Input value={form.binanceNetwork ?? ""} onChange={(e) => set("binanceNetwork", e.target.value)} maxLength={60} placeholder="USDT (BEP20), BTC, etc." />
              </div>
            </>
          )}

          <div className="space-y-1 sm:col-span-2">
            <Label>Instrucciones</Label>
            <Textarea value={form.instructions ?? ""} onChange={(e) => set("instructions", e.target.value)} maxLength={300} className="min-h-[60px]" placeholder="Notas adicionales para el paciente" />
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} />
            <Label className="cursor-pointer">Activo (visible al agendar)</Label>
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
