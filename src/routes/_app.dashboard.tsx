import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useAuth } from "@/context/AuthContext";
import { getDashboard, type DashboardPeriod } from "@/services/dashboardService";
import type { DashboardData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";

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

const chartConfig: ChartConfig = {
  totalQuantity: {
    label: "Quantidade",
    color: "#a855f7",
  },
};

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function DashboardPage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  const [period, setPeriod] = useState<DashboardPeriod>("ALL");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDashboard(period)
      .then(setData)
      .finally(() => setLoading(false));
  }, [period]);

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

      {loading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-32 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-7 w-24 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                <p className="text-2xl font-bold">{brl.format(data.revenue)}</p>
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
                <p className="text-2xl font-bold">{brl.format(data.averageTicket)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Top 5 Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topProducts.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum produto vendido no período.
                </p>
              ) : (
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                  <BarChart
                    layout="vertical"
                    data={data.topProducts}
                    margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" allowDecimals={false} />
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
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
