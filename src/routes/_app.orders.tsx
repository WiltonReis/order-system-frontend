import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, Pencil, Plus, ShoppingCart } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { listOrders } from "@/services/orderService";
import type { Order } from "@/lib/types";
import { brl, dateTime } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { OrderFormDialog } from "@/components/orders/OrderFormDialog";
import { OrderDetailsDialog } from "@/components/orders/OrderDetailsDialog";

export const Route = createFileRoute("/_app/orders")({
  head: () => ({
    meta: [{ title: "Pedidos — OMS" }],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

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

        <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhum pedido encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Pedido</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="text-center">Itens</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[120px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

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
