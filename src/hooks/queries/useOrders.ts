import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelOrder,
  deleteOrder,
  finalizeOrder,
  listOrders,
  restoreOrder,
} from "@/services/orderService";
import type { OrderFilters } from "@/services/orderService";
import type { OrderStatus } from "@/lib/types";

export function useActiveOrders(page: number, filters: OrderFilters) {
  const statuses: OrderStatus[] = filters.statuses?.length
    ? filters.statuses.filter((s) => s === "OPEN")
    : ["OPEN"];
  return useQuery({
    queryKey: ["orders", "active", page, filters],
    queryFn: () => listOrders(page, 20, { ...filters, statuses }),
  });
}

export function useHistoryOrders(page: number, filters: OrderFilters) {
  const statuses: OrderStatus[] = filters.statuses?.length
    ? filters.statuses.filter((s) => s === "COMPLETED" || s === "CANCELED")
    : ["COMPLETED", "CANCELED"];
  return useQuery({
    queryKey: ["orders", "history", page, filters],
    queryFn: () => listOrders(page, 20, { ...filters, statuses }),
  });
}

export function useFinalizeOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: finalizeOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useRestoreOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: restoreOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}
