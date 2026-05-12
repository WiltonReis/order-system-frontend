import { api } from "@/lib/api";
import type { DashboardData } from "@/lib/types";

export type DashboardPeriod = "TODAY" | "WEEK" | "MONTH" | "ALL";

export interface DashboardParams {
  period?: DashboardPeriod;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export async function getDashboard(params: DashboardParams): Promise<DashboardData> {
  const query = new URLSearchParams();

  if (params.startDate && params.endDate) {
    query.set("startDate", params.startDate);
    query.set("endDate", params.endDate);
  } else {
    query.set("period", params.period ?? "ALL");
  }

  const { data } = await api.get<DashboardData>(`/dashboard?${query}`);
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
