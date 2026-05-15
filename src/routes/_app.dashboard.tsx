import { useRef, useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { CalendarDays, X } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { type DashboardPeriod } from "@/features/dashboard/api/dashboardService";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — OMS" }],
  }),
  component: DashboardPage,
});

const PERIODS: { label: string; value: DashboardPeriod }[] = [
  { label: "Hoje", value: "TODAY" },
  { label: "Semana", value: "WEEK" },
  { label: "Mês", value: "MONTH" },
  { label: "Tudo", value: "ALL" },
];

const STATUS_COLORS: Record<string, string> = {
  OPEN: "#3b82f6",
  COMPLETED: "#22c55e",
  CANCELED: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Abertos",
  COMPLETED: "Finalizados",
  CANCELED: "Cancelados",
};

const topProductsConfig: ChartConfig = {
  totalQuantity: {
    label: "Quantidade",
    color: "hsl(var(--primary))",
  },
};

const revenueConfig: ChartConfig = {
  revenue: {
    label: "Receita",
    color: "hsl(var(--primary))",
  },
};

const statusConfig: ChartConfig = {
  OPEN: { label: "Abertos", color: STATUS_COLORS.OPEN },
  COMPLETED: { label: "Finalizados", color: STATUS_COLORS.COMPLETED },
  CANCELED: { label: "Cancelados", color: STATUS_COLORS.CANCELED },
};

function formatDateLabel(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}

function formatDateDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-24" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div className="w-full animate-pulse rounded-lg bg-muted" style={{ height }} />
  );
}

interface DateRangePickerProps {
  value: { start: string; end: string } | null;
  onApply: (start: string, end: string) => void;
  onClear: () => void;
}

function DateRangePicker({ value, onApply, onClear }: DateRangePickerProps) {
  const today = new Date().toISOString().split("T")[0];
  const [start, setStart] = useState(value?.start ?? "");
  const [end, setEnd] = useState(value?.end ?? "");
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const handleOpen = (next: boolean) => {
    if (next) {
      setStart(value?.start ?? "");
      setEnd(value?.end ?? "");
    }
    setOpen(next);
  };

  const handleApply = () => {
    if (start && end && start <= end) {
      onApply(start, end);
      setOpen(false);
    }
  };

  const isActive = value !== null;
  const canApply = start && end && start <= end;

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Filtrar por período personalizado"
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            isActive
              ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
              : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-72 p-0 shadow-lg"
      >
        {/* Arrow pointing up toward trigger */}
        <PopoverPrimitive.Arrow
          width={12}
          height={6}
          className="fill-border"
          style={{ fill: "hsl(var(--border))" }}
        />

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Período personalizado</p>
            <button
              ref={closeRef}
              onClick={() => setOpen(false)}
              className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                De
              </label>
              <input
                type="date"
                value={start}
                max={end || today}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Até
              </label>
              <input
                type="date"
                value={end}
                min={start || undefined}
                max={today}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {isActive && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
              >
                Limpar
              </Button>
            )}
            <Button
              size="sm"
              className="flex-1"
              disabled={!canApply}
              onClick={handleApply}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  const [period, setPeriod] = useState<DashboardPeriod>("ALL");
  const [customRange, setCustomRange] = useState<{ start: string; end: string } | null>(null);

  const dashboardParams = customRange
    ? { startDate: customRange.start, endDate: customRange.end }
    : { period };

  const { data, isPending } = useDashboard(dashboardParams);

  const handlePeriodChange = (p: DashboardPeriod) => {
    setCustomRange(null);
    setPeriod(p);
  };

  const statusData = data
    ? [
        { name: "OPEN", label: STATUS_LABELS.OPEN, value: data.ordersByStatus.OPEN },
        { name: "COMPLETED", label: STATUS_LABELS.COMPLETED, value: data.ordersByStatus.COMPLETED },
        { name: "CANCELED", label: STATUS_LABELS.CANCELED, value: data.ordersByStatus.CANCELED },
      ].filter((s) => s.value > 0)
    : [];

  const hasStatusData = statusData.length > 0;
  const hasRevenueData = (data?.revenueByDay.length ?? 0) > 0;

  const periodLabel = customRange
    ? `${formatDateDisplay(customRange.start)} — ${formatDateDisplay(customRange.end)}`
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {periodLabel ? (
              <>
                Período:{" "}
                <span className="font-medium text-foreground">{periodLabel}</span>
              </>
            ) : (
              "Visão geral e métricas do sistema."
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Preset periods */}
          <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
            {PERIODS.map((p) => (
              <Button
                key={p.value}
                size="sm"
                variant={!customRange && period === p.value ? "default" : "ghost"}
                className="h-7 px-3 text-xs"
                onClick={() => handlePeriodChange(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          {/* Custom date range picker */}
          <DateRangePicker
            value={customRange}
            onApply={(start, end) => setCustomRange({ start, end })}
            onClear={() => setCustomRange(null)}
          />
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isPending || !data ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold dark:text-violet-400">{data.totalOrders}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Receita Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold dark:text-violet-400">{brl(data.revenue)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taxa de Cancelamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold dark:text-violet-400">{data.cancelRate.toFixed(1)}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ticket Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold dark:text-violet-400">{brl(data.averageTicket)}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Status pie + Revenue area */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Pedidos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending || !data ? (
              <ChartSkeleton height={220} />
            ) : !hasStatusData ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Nenhum pedido no período.
              </p>
            ) : (
              <>
                <ChartContainer config={statusConfig} className="h-[200px] w-full">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      animationBegin={0}
                      animationDuration={500}
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent nameKey="label" hideLabel />}
                    />
                  </PieChart>
                </ChartContainer>
                <div className="mt-2 flex justify-center gap-4">
                  {statusData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: STATUS_COLORS[entry.name] }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {entry.label}: <strong>{entry.value}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Receita por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending || !data ? (
              <ChartSkeleton height={220} />
            ) : !hasRevenueData ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Nenhuma receita registrada no período.
              </p>
            ) : (
              <ChartContainer config={revenueConfig} className="h-[220px] w-full">
                <AreaChart
                  data={data.revenueByDay}
                  margin={{ top: 4, right: 12, bottom: 0, left: 8 }}
                >
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateLabel}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(v: number) => brl(v).replace("R$ ", "R$ ")}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={72}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => brl(Number(value))}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    animationBegin={0}
                    animationDuration={500}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 5 products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Top 5 Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending || !data ? (
            <ChartSkeleton height={220} />
          ) : data.topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum produto vendido no período.
            </p>
          ) : (
            <ChartContainer config={topProductsConfig} className="h-[220px] w-full overflow-hidden">
              <BarChart
                layout="vertical"
                data={data.topProducts}
                margin={{ top: 0, right: 24, bottom: 0, left: 8 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="productName"
                  width={140}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="totalQuantity"
                  fill="var(--color-totalQuantity)"
                  radius={[0, 4, 4, 0]}
                  animationBegin={0}
                  animationDuration={500}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
