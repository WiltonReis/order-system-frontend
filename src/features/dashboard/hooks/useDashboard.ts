import { useQuery } from "@tanstack/react-query";
import { getDashboard, type DashboardParams } from "../api/dashboardService";

export function useDashboard(params: DashboardParams) {
  return useQuery({
    queryKey: ["dashboard", params],
    queryFn: () => getDashboard(params),
  });
}
