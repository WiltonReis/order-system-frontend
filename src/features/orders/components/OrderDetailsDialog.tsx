import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { brl, dateTime } from "@/lib/format";
import type { Order } from "@/lib/types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { useOrderStatusHistory } from "../hooks/useOrders";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export function OrderDetailsDialog({ open, onOpenChange, order }: Props) {
  const historyQuery = useOrderStatusHistory(open ? order?.id : null);

  if (!order) return null;

  const subtotal = order.items.reduce((acc, it) => acc + it.subtotal, 0);
  // O backend sempre armazena e retorna o desconto como valor absoluto
  const discountValue = order.discountAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg">#{order.orderCode || order.id}</span>
              {order.customerName && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-lg font-semibold text-foreground">{order.customerName}</span>
                </>
              )}
            </div>
            <OrderStatusBadge status={order.status} />
          </DialogTitle>
          <DialogDescription>Detalhes completos do pedido</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Criado em</div>
              <div className="font-medium">{dateTime(order.createdAt)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Criado por</div>
              <div className="font-medium">{order.createdByName}</div>
            </div>
            {order.completedAt && (
              <div>
                <div className="text-xs text-muted-foreground">Finalizado em</div>
                <div className="font-medium">{dateTime(order.completedAt)}</div>
              </div>
            )}
            {order.completedByName && (
              <div>
                <div className="text-xs text-muted-foreground">Finalizado por</div>
                <div className="font-medium">{order.completedByName}</div>
              </div>
            )}
            {order.canceledAt && (
              <div>
                <div className="text-xs text-muted-foreground">Cancelado em</div>
                <div className="font-medium">{dateTime(order.canceledAt)}</div>
              </div>
            )}
            {order.canceledByName && (
              <div>
                <div className="text-xs text-muted-foreground">Cancelado por</div>
                <div className="font-medium">{order.canceledByName}</div>
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Itens
            </div>
            <div className="divide-y divide-border rounded-lg border border-border bg-card">
              {order.items.map((it) => (
                <div key={it.productId} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{it.productName}</div>
                    <div className="text-xs text-muted-foreground">
                      {brl(it.unitPrice)} × {it.quantity}
                    </div>
                  </div>
                  <Badge variant="secondary">x{it.quantity}</Badge>
                  <div className="w-24 text-right tabular-nums font-medium">{brl(it.subtotal)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{brl(subtotal)}</span>
            </div>
            {discountValue > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Desconto</span>
                <span className="tabular-nums">- {brl(discountValue)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
              <span>Total</span>
              <span className="tabular-nums text-primary">{brl(order.total)}</span>
            </div>
          </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="rounded-lg border border-border bg-card">
              {historyQuery.isPending && (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Carregando histórico…
                </div>
              )}
              {!historyQuery.isPending && (historyQuery.data?.length ?? 0) === 0 && (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Nenhuma mudança de status registrada.
                </div>
              )}
              {!historyQuery.isPending && (historyQuery.data?.length ?? 0) > 0 && (
                <ol className="divide-y divide-border">
                  {historyQuery.data!.map((h) => (
                    <li key={h.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                      <OrderStatusBadge status={h.fromStatus} />
                      <span className="text-muted-foreground">→</span>
                      <OrderStatusBadge status={h.toStatus} />
                      <div className="ml-auto text-right">
                        <div className="text-xs text-muted-foreground">{dateTime(h.changedAt)}</div>
                        {h.changedBy && (
                          <div className="text-xs font-medium">{h.changedBy}</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
