import { useState } from "react";
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

function DashboardPage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  const [period, setPeriod] = useState<DashboardPeriod>("ALL");
  const { data, isPending } = useDashboard(period);

  const statusData = data
    ? [
        { name: "OPEN", label: STATUS_LABELS.OPEN, value: data.ordersByStatus.OPEN },
        { name: "COMPLETED", label: STATUS_LABELS.COMPLETED, value: data.ordersByStatus.COMPLETED },
        { name: "CANCELED", label: STATUS_LABELS.CANCELED, value: data.ordersByStatus.CANCELED },
      ].filter((s) => s.value > 0)
    : [];

  const hasStatusData = statusData.length > 0;
  const hasRevenueData = (data?.revenueByDay.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral e métricas do sistema.</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {PERIODS.map((p) => (
            <Button
              key={p.value}
              size="sm"
              variant={period === p.value ? "default" : "ghost"}
              className="h-7 px-3 text-xs"
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
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
                <p className="text-2xl font-bold">{data.totalOrders}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Receita Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{brl(data.revenue)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taxa de Cancelamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data.cancelRate.toFixed(1)}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ticket Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{brl(data.averageTicket)}</p>
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
                    tickFormatter={(v: number) => brl(v).replace("R$ ", "R$ ")}
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
