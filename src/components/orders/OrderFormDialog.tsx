import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brl } from "@/lib/format";
import { listProducts } from "@/services/productService";
import { createOrder, updateOrder } from "@/services/orderService";
import type { Order, Product } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createdByName: string;
  onSaved: () => void;
  /** When provided, dialog is in edit mode for this order */
  order?: Order | null;
}

interface Line {
  productId: string;
  quantity: number;
}

export function OrderFormDialog({ open, onOpenChange, createdByName, onSaved, order }: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isEdit = !!order;

  const [products, setProducts] = useState<Product[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [discountType, setDiscountType] = useState<"PERCENT" | "VALUE">("PERCENT");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    listProducts().then(setProducts);
    setSelectedProduct("");
    if (order) {
      setLines(order.items.map((it) => ({ productId: it.productId, quantity: it.quantity })));
      setCustomerName(order.customerName ?? "");
      setDiscountType(order.discountType);
      setDiscountAmount(order.discountAmount);
    } else {
      setLines([]);
      setCustomerName("");
      setDiscountType("PERCENT");
      setDiscountAmount(0);
    }
  }, [open, order]);

  const enrichedLines = useMemo(
    () =>
      lines.map((l) => {
        const p = products.find((p) => p.id === l.productId) as Product | undefined;
        return { ...l, product: p, subtotal: (p?.price ?? 0) * l.quantity };
      }),
    [lines, products],
  );

  const subtotal = enrichedLines.reduce((acc, l) => acc + l.subtotal, 0);
  const effectiveDiscountAmount = isAdmin ? discountAmount : 0;
  const discountValue =
    discountType === "PERCENT" ? subtotal * (effectiveDiscountAmount / 100) : effectiveDiscountAmount;
  const total = Math.max(0, subtotal - discountValue);

  const addProduct = () => {
    if (!selectedProduct) return;
    if (lines.some((l) => l.productId === selectedProduct)) {
      toast.info("Produto já adicionado — ajuste a quantidade.");
      return;
    }
    setLines((prev) => [...prev, { productId: selectedProduct, quantity: 1 }]);
    setSelectedProduct("");
    toast.success("Item adicionado");
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty < 1) return;
    setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, quantity: qty } : l)));
  };

  const removeLine = (productId: string) =>
    setLines((prev) => prev.filter((l) => l.productId !== productId));

  const handleSubmit = async () => {
    if (lines.length === 0) {
      toast.error("Adicione ao menos um produto");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        items: lines,
        discountType,
        // undefined sinaliza para o service que não deve tocar no desconto (usuário sem ADMIN)
        discountAmount: isAdmin ? Number(discountAmount) || 0 : undefined,
        customerName: customerName.trim() || undefined,
      };
      if (isEdit && order) {
        await updateOrder({ id: order.id, ...payload }, products);
        toast.success("Pedido atualizado");
      } else {
        await createOrder(payload, products, createdByName);
        toast.success("Pedido criado");
      }
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(extractErrorMessage(e, "Erro ao salvar pedido"));
    } finally {
      setSubmitting(false);
    }
  };

  const availableProducts = products.filter((p) => !lines.some((l) => l.productId === p.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Editar pedido #${order?.orderCode}` : "Novo pedido"}</DialogTitle>
          <DialogDescription>
            Selecione produtos, ajuste quantidades{isAdmin ? " e aplique desconto se necessário." : "."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label>Cliente (opcional)</Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nome do cliente"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {availableProducts.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Nenhum produto disponível
                  </div>
                )}
                {availableProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {brl(p.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addProduct} disabled={!selectedProduct}>
              <Plus className="mr-1 h-4 w-4" />
              Adicionar
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-card">
            {enrichedLines.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Nenhum item adicionado ao pedido.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {enrichedLines.map((l) => (
                  <div key={l.productId} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium">{l.product?.name}</div>
                      <div className="text-xs text-muted-foreground">{brl(l.product?.price ?? 0)} / un</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQty(l.productId, l.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        value={l.quantity}
                        onChange={(e) => updateQty(l.productId, parseInt(e.target.value) || 1)}
                        className="h-7 w-14 text-center"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQty(l.productId, l.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="w-24 text-right text-sm font-medium tabular-nums">
                      {brl(l.subtotal)}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeLine(l.productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Tipo de desconto</Label>
                <Select value={discountType} onValueChange={(v) => setDiscountType(v as "PERCENT" | "VALUE")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">Percentual (%)</SelectItem>
                    <SelectItem value="VALUE">Valor (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Desconto</Label>
                <Input
                  type="number"
                  min={0}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  placeholder={discountType === "PERCENT" ? "0%" : "R$ 0,00"}
                />
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{brl(subtotal)}</span>
            </div>
            {isAdmin && (
              <div className="flex justify-between text-muted-foreground">
                <span>Desconto</span>
                <span className="tabular-nums">- {brl(discountValue)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
              <span>Total</span>
              <span className="tabular-nums text-primary">{brl(total)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar pedido"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
