import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Eye, Pencil, Plus, ShoppingCart, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cancelOrder, type OrderFilters } from "@/features/orders/api/orderService";
import { extractErrorMessage } from "@/lib/api";
import type { Order } from "@/lib/types";
import { brl, dateTime } from "@/lib/format";
import { useAuth } from "@/features/auth/context/AuthContext";
import { OrderFormDialog } from "@/features/orders/components/OrderFormDialog";
import { OrderDetailsDialog } from "@/features/orders/components/OrderDetailsDialog";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { OrderFilterBar } from "@/features/orders/components/OrderFilterBar";
import {
  useActiveOrders,
  useFinalizeOrder,
  useHistoryOrders,
} from "@/features/orders/hooks/useOrders";
import { DataTable } from "@/shared/components/DataTable";
import type { TableColumn } from "@/shared/components/DataTable";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { showUndoToast } from "@/shared/components/UndoToast";
import { usePagination } from "@/shared/hooks/usePagination";

export const Route = createFileRoute("/_app/orders")({
  head: () => ({
    meta: [{ title: "Pedidos — OMS" }],
  }),
  component: OrdersPage,
});

type ConfirmAction = { type: "finalize"; order: Order } | { type: "cancel"; order: Order };

function OrdersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const activePag = usePagination();
  const historyPag = usePagination();
  const [filters, setFilters] = useState<OrderFilters>({});
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const activeQuery = useActiveOrders(activePag.page, filters);
  const historyQuery = useHistoryOrders(historyPag.page, filters);
  const finalizeMutation = useFinalizeOrder();
  const [pendingCancelIds, setPendingCancelIds] = useState<Set<string>>(new Set());

  const allActiveOrders = activeQuery.data?.content ?? [];
  const activeOrders = allActiveOrders.filter((o) => !pendingCancelIds.has(o.id));
  const historyOrders = historyQuery.data?.content ?? [];
  const activeTotalPages = activeQuery.data?.totalPages ?? 0;
  const historyTotalPages = historyQuery.data?.totalPages ?? 0;

  const handleApplyFilters = (newFilters: OrderFilters) => {
    setFilters(newFilters);
    activePag.reset();
    historyPag.reset();
  };

  const openCreate = () => {
    setActiveOrder(null);
    setFormOpen(true);
  };

  const openEdit = (order: Order) => {
    setActiveOrder(order);
    setFormOpen(true);
  };

  const openDetails = (order: Order) => {
    setActiveOrder(order);
    setDetailsOpen(true);
  };

  const onSaved = () => queryClient.invalidateQueries({ queryKey: ["orders"] });

  const executeAction = async () => {
    if (!confirmAction) return;
    const { type, order } = confirmAction;
    setConfirmAction(null);
    if (type === "finalize") {
      try {
        await finalizeMutation.mutateAsync(order.id);
        toast.success("Pedido finalizado");
      } catch (e) {
        toast.error(extractErrorMessage(e, "Erro ao atualizar pedido"));
      }
    } else {
      setPendingCancelIds((prev) => new Set([...prev, order.id]));
      showUndoToast(
        `Pedido #${order.orderCode} cancelado`,
        async () => {
          try {
            await cancelOrder(order.id);
            await queryClient.invalidateQueries({ queryKey: ["orders"] });
          } catch (e) {
            toast.error(extractErrorMessage(e, "Erro ao cancelar pedido"));
            await queryClient.invalidateQueries({ queryKey: ["orders"] });
          }
          setPendingCancelIds((prev) => {
            const next = new Set(prev);
            next.delete(order.id);
            return next;
          });
        },
        () => {
          setPendingCancelIds((prev) => {
            const next = new Set(prev);
            next.delete(order.id);
            return next;
          });
        },
      );
    }
  };

  const handleCancel = (order: Order) => {
    setConfirmAction({ type: "cancel", order });
  };

  const activeColumns: TableColumn<Order>[] = [
    {
      header: "Pedido",
      cell: (o) => <span className="font-mono text-xs font-semibold tracking-widest">#{o.orderCode}</span>,
    },
    {
      header: "Cliente",
      cell: (o) => (
        <span className="text-sm">
          {o.customerName || <span className="text-muted-foreground">—</span>}
        </span>
      ),
    },
    {
      header: "Criado em",
      cell: (o) => <span className="text-sm text-muted-foreground">{dateTime(o.createdAt)}</span>,
    },
    {
      header: "Usuário",
      cell: (o) => <span className="text-sm">{o.createdByName}</span>,
    },
    {
      header: <span className="block text-center">Itens</span>,
      className: "text-center",
      cell: (o) => <Badge variant="secondary">{o.items.length}</Badge>,
    },
    {
      header: <span className="block text-right">Total</span>,
      className: "text-right",
      cell: (o) => <span className="font-semibold tabular-nums text-primary">{brl(o.total)}</span>,
    },
    {
      header: <span className="block text-right">Ações</span>,
      className: "w-[152px]",
      cell: (o) => (
        <div className="flex justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Visualizar pedido" onClick={() => openDetails(o)}>
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Visualizar pedido</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" aria-label="Editar pedido" onClick={() => openEdit(o)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar pedido</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-green-600" aria-label="Finalizar pedido" onClick={() => setConfirmAction({ type: "finalize", order: o })}>
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Finalizar pedido</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive" aria-label="Cancelar pedido" onClick={() => handleCancel(o)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cancelar pedido</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  const historyColumns: TableColumn<Order>[] = [
    {
      header: "Pedido",
      cell: (o) => <span className="font-mono text-xs font-semibold tracking-widest">#{o.orderCode}</span>,
    },
    {
      header: "Cliente",
      cell: (o) => (
        <span className="text-sm">
          {o.customerName || <span className="text-muted-foreground">—</span>}
        </span>
      ),
    },
    {
      header: "Criado em",
      cell: (o) => <span className="text-sm text-muted-foreground">{dateTime(o.createdAt)}</span>,
    },
    {
      header: "Usuário",
      cell: (o) => <span className="text-sm">{o.createdByName}</span>,
    },
    {
      header: "Status",
      cell: (o) => <OrderStatusBadge status={o.status} />,
    },
    {
      header: <span className="block text-center">Itens</span>,
      className: "text-center",
      cell: (o) => <Badge variant="secondary">{o.items.length}</Badge>,
    },
    {
      header: <span className="block text-right">Total</span>,
      className: "text-right",
      cell: (o) => <span className="font-semibold tabular-nums text-primary">{brl(o.total)}</span>,
    },
    {
      header: <span className="block text-right">Ações</span>,
      className: "w-[60px]",
      cell: (o) => (
        <div className="flex justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Visualizar pedido" onClick={() => openDetails(o)}>
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Visualizar pedido</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  const confirmTitle = confirmAction?.type === "cancel" ? "Cancelar pedido?" : "Finalizar pedido?";
  const confirmDescription =
    confirmAction?.type === "cancel"
      ? "O pedido será cancelado. Esta ação poderá ser desfeita por alguns segundos."
      : "O pedido será marcado como finalizado e não poderá mais ser editado.";
  const confirmLabel = confirmAction?.type === "cancel" ? "Cancelar pedido" : "Finalizar";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie e acompanhe todos os pedidos criados.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Criar pedido
          </Button>
        </div>

        <Tabs defaultValue="active">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="active" className="relative">
                Ativos
                {activeOrders.length > 0 && (
                  <span className="badge-pulse-animate absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">
                    {activeOrders.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>
            <OrderFilterBar onApply={handleApplyFilters} />
          </div>

          <TabsContent value="active">
            <DataTable
              columns={activeColumns}
              data={activeOrders}
              keyExtractor={(o) => o.id}
              loading={activeQuery.isPending}
              emptyIcon={<ShoppingCart className="h-8 w-8 text-muted-foreground" />}
              emptyMessage="Nenhum pedido ativo."
              pagination={{ page: activePag.page, total: activeTotalPages, onPrev: activePag.prev, onNext: activePag.next }}
            />
          </TabsContent>

          <TabsContent value="history">
            <DataTable
              columns={historyColumns}
              data={historyOrders}
              keyExtractor={(o) => o.id}
              loading={historyQuery.isPending}
              emptyIcon={<ShoppingCart className="h-8 w-8 text-muted-foreground" />}
              emptyMessage="Nenhum pedido no histórico."
              pagination={{ page: historyPag.page, total: historyTotalPages, onPrev: historyPag.prev, onNext: historyPag.next }}
              rowClassName="opacity-80"
            />
          </TabsContent>
        </Tabs>

        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={(o) => !o && setConfirmAction(null)}
          title={confirmTitle}
          description={confirmDescription}
          onConfirm={executeAction}
          confirmLabel={confirmLabel}
          destructive={confirmAction?.type === "cancel"}
        />

        {user && (
          <OrderFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            order={activeOrder}
            onSaved={onSaved}
          />
        )}
        <OrderDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} order={activeOrder} />
      </div>
    </TooltipProvider>
  );
}
