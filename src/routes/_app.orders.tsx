import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, ShoppingCart } from "lucide-react";
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
import { listOrders } from "@/services/orderService";
import type { Order } from "@/lib/types";
import { brl, dateTime } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { CreateOrderDialog } from "@/components/orders/CreateOrderDialog";

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
  const [open, setOpen] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie e acompanhe todos os pedidos criados.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {user && (
        <CreateOrderDialog
          open={open}
          onOpenChange={setOpen}
          createdByName={user.name}
          onCreated={refresh}
        />
      )}
    </div>
  );
}
