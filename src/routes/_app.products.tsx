import { useEffect, useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Check, Package, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { brl } from "@/lib/format";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProductPrice,
} from "@/services/productService";
import type { Product } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/products")({
  head: () => ({ meta: [{ title: "Produtos — OMS" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      setProducts(await listProducts());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  if (user && user.role !== "ADMIN") return <Navigate to="/orders" />;

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditingPrice(String(p.price));
  };

  const saveEdit = async (id: string) => {
    const price = parseFloat(editingPrice);
    if (isNaN(price) || price < 0) {
      toast.error("Preço inválido");
      return;
    }
    try {
      await updateProductPrice(id, price);
      toast.success("Preço atualizado");
      setEditingId(null);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao atualizar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    await deleteProduct(id);
    toast.success("Produto excluído");
    refresh();
  };

  const handleCreate = async () => {
    const price = parseFloat(newPrice);
    if (!newName.trim() || isNaN(price) || price < 0) {
      toast.error("Preencha nome e preço válidos");
      return;
    }
    await createProduct({ name: newName.trim(), price });
    toast.success("Produto criado");
    setNewName("");
    setNewPrice("");
    setCreateOpen(false);
    refresh();
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie o catálogo e ajuste preços.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo produto
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center">
              <Package className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhum produto cadastrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="w-[140px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => {
                  const editing = editingId === p.id;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right">
                        {editing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(e.target.value)}
                            className="ml-auto h-8 w-32 text-right tabular-nums"
                            autoFocus
                          />
                        ) : (
                          <span className="tabular-nums font-semibold text-primary">{brl(p.price)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {editing ? (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" onClick={() => saveEdit(p.id)}>
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Salvar</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Cancelar</TooltipContent>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" onClick={() => startEdit(p)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar preço</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(p.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Excluir produto</TooltipContent>
                              </Tooltip>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo produto</DialogTitle>
              <DialogDescription>Cadastre um novo item no catálogo.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Notebook Pro 14" />
              </div>
              <div className="space-y-1.5">
                <Label>Preço (R$)</Label>
                <Input type="number" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0,00" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
