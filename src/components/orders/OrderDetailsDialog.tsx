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
import { brl, dateTime } from "@/lib/format";
import type { Order } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export function OrderDetailsDialog({ open, onOpenChange, order }: Props) {
  if (!order) return null;

  const subtotal = order.items.reduce((acc, it) => acc + it.subtotal, 0);
  const discountValue =
    order.discountType === "PERCENT"
      ? subtotal * (order.discountAmount / 100)
      : order.discountAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-mono">{order.id}</DialogTitle>
          <DialogDescription>Detalhes completos do pedido</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Criado em</div>
              <div className="font-medium">{dateTime(order.createdAt)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Criado por</div>
              <div className="font-medium">{order.createdByName}</div>
            </div>
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
            <div className="flex justify-between text-muted-foreground">
              <span>
                Desconto {order.discountType === "PERCENT" ? `(${order.discountAmount}%)` : ""}
              </span>
              <span className="tabular-nums">- {brl(discountValue)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
              <span>Total</span>
              <span className="tabular-nums text-primary">{brl(order.total)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
