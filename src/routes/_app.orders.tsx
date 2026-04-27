import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Eye, Pencil, Plus, ShoppingCart, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cancelOrder, finalizeOrder, listOrders } from "@/services/orderService";
import { extractErrorMessage } from "@/lib/api";
import type { Order } from "@/lib/types";
import { brl, dateTime } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { OrderFormDialog } from "@/components/orders/OrderFormDialog";
import { OrderDetailsDialog } from "@/components/orders/OrderDetailsDialog";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

export const Route = createFileRoute("/_app/orders")({
  head: () => ({
    meta: [{ title: "Pedidos — OMS" }],
  }),
  component: OrdersPage,
});

type ConfirmAction = { type: "finalize" | "cancel"; order: Order };

function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const activeOrders = orders.filter((o) => o.status === "OPEN");
  const historyOrders = orders.filter(
    (o) => o.status === "COMPLETED" || o.status === "CANCELED",
  );

  const refresh = async () => {
    setLoading(true);
    try {
      setOrders(await listOrders());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

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

  const executeAction = async () => {
    if (!confirmAction) return;
    const { type, order } = confirmAction;
    setConfirmAction(null);
    try {
      if (type === "finalize") {
        await finalizeOrder(order.id);
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: "COMPLETED" as const } : o)),
        );
        toast.success("Pedido finalizado");
      } else {
        await cancelOrder(order.id);
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: "CANCELED" as const } : o)),
        );
        toast.success("Pedido cancelado");
      }
    } catch (e) {
      toast.error(extractErrorMessage(e, "Erro ao atualizar pedido"));
      refresh();
    }
  };

  const emptyState = (label: string) => (
    <div className="flex flex-col items-center gap-2 p-12 text-center">
      <ShoppingCart className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );

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
          <TabsList>
            <TabsTrigger value="active">
              Ativos
              {!loading && activeOrders.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px]">
                  {activeOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">
              Histórico
              {!loading && historyOrders.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px]">
                  {historyOrders.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Active orders tab ── */}
          <TabsContent value="active">
            <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
              {loading ? (
                <div className="p-10 text-center text-sm text-muted-foreground">Carregando...</div>
              ) : activeOrders.length === 0 ? (
                emptyState("Nenhum pedido ativo.")
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Pedido</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead className="text-center">Itens</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[152px] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-sm font-semibold">
                          #{o.orderCode}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {dateTime(o.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm">{o.createdByName}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{o.items.length}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums text-primary">
                          {brl(o.total)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => openDetails(o)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Visualizar pedido</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 hover:text-primary"
                                  onClick={() => openEdit(o)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar pedido</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 hover:text-green-600"
                                  onClick={() => setConfirmAction({ type: "finalize", order: o })}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Finalizar pedido</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 hover:text-destructive"
                                  onClick={() => setConfirmAction({ type: "cancel", order: o })}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Cancelar pedido</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* ── History tab ── */}
          <TabsContent value="history">
            <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
              {loading ? (
                <div className="p-10 text-center text-sm text-muted-foreground">Carregando...</div>
              ) : historyOrders.length === 0 ? (
                emptyState("Nenhum pedido no histórico.")
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Pedido</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Itens</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[60px] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyOrders.map((o) => (
                      <TableRow key={o.id} className="opacity-80">
                        <TableCell className="font-mono text-sm font-semibold">#{o.orderCode}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {dateTime(o.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm">{o.createdByName}</TableCell>
                        <TableCell>
                          <OrderStatusBadge status={o.status} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{o.items.length}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums text-primary">
                          {brl(o.total)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => openDetails(o)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Visualizar pedido</TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* ── Confirmation dialog ── */}
        <AlertDialog open={!!confirmAction} onOpenChange={(o) => !o && setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmAction?.type === "finalize" ? "Finalizar pedido?" : "Cancelar pedido?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction?.type === "finalize"
                  ? "O pedido será marcado como finalizado e não poderá mais ser editado."
                  : "O pedido será cancelado. Essa ação não pode ser desfeita."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Não</AlertDialogCancel>
              <AlertDialogAction
                onClick={executeAction}
                className={
                  confirmAction?.type === "cancel"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : ""
                }
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {user && (
          <OrderFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            createdByName={user.name}
            order={activeOrder}
            onSaved={refresh}
          />
        )}
        <OrderDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} order={activeOrder} />
      </div>
    </TooltipProvider>
  );
}
