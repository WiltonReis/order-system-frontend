import { api } from "@/lib/api";
import type { DashboardData } from "@/lib/types";

export type DashboardPeriod = "TODAY" | "WEEK" | "MONTH" | "ALL";

export async function getDashboard(period: DashboardPeriod): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>(`/dashboard?period=${period}`);
  return {
    ...data,
    revenue: Number(data.revenue),
    averageTicket: Number(data.averageTicket),
    ordersByStatus: data.ordersByStatus ?? { OPEN: 0, COMPLETED: 0, CANCELED: 0 },
    revenueByDay: (data.revenueByDay ?? []).map((d) => ({
      ...d,
      revenue: Number(d.revenue),
    })),
  };
}
