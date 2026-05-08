import { useQuery } from "@tanstack/react-query";
import { getDashboard, type DashboardPeriod } from "@/services/dashboardService";

export function useDashboard(period: DashboardPeriod) {
  return useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => getDashboard(period),
  });
}
