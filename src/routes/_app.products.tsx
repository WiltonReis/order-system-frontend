import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Eye, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { extractErrorMessage } from "@/lib/api";
import {
  createProduct,
  deleteProduct,
  listProductsPaged,
  updateProduct,
} from "@/services/productService";
import { ProductDetailsDialog } from "@/components/orders/ProductDetailsDialog";
import type { Product } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/products")({
  head: () => ({ meta: [{ title: "Produtos — OMS" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadKey, setLoadKey] = useState(0);

  // Estado do dialog de criação
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState("");

  // Estado do dialog de visualização
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Estado do dialog de edição completa
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const result = await listProductsPaged(page);
        if (!cancelled) {
          setProducts(result.content);
          setTotalPages(result.totalPages);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page, loadKey]);

  const refresh = () => setLoadKey((k) => k + 1);

  const openDetails = (p: Product) => {
    setDetailsProduct(p);
    setDetailsOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditTarget(p);
    setEditName(p.name);
    setEditDescription(p.description ?? "");
    setEditPrice(String(p.price));
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    const price = parseFloat(editPrice);
    if (!editName.trim() || isNaN(price) || price < 0) {
      toast.error("Preencha nome e preço válidos");
      return;
    }
    try {
      await updateProduct(editTarget!.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        price,
      });
      toast.success("Produto atualizado");
      setEditOpen(false);
      refresh();
    } catch (e) {
      toast.error(extractErrorMessage(e, "Erro ao atualizar produto"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await deleteProduct(id);
      toast.success("Produto excluído");
      refresh();
    } catch (e) {
      toast.error(extractErrorMessage(e, "Erro ao excluir produto"));
    }
  };

  const handleCreate = async () => {
    const price = parseFloat(newPrice);
    if (!newName.trim() || isNaN(price) || price < 0) {
      toast.error("Preencha nome e preço válidos");
      return;
    }
    try {
      await createProduct({ name: newName.trim(), description: newDescription.trim(), price });
      toast.success("Produto criado");
      setNewName("");
      setNewDescription("");
      setNewPrice("");
      setCreateOpen(false);
      refresh();
    } catch (e) {
      toast.error(extractErrorMessage(e, "Erro ao criar produto"));
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? "Gerencie o catálogo e ajuste preços." : "Consulte o catálogo de produtos."}
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo produto
            </Button>
          )}
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
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="w-[140px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right">
                        <span className="tabular-nums font-semibold text-primary">{brl(p.price)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => openDetails(p)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalhes</TooltipContent>
                          </Tooltip>
                          {isAdmin && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 hover:text-primary"
                                    onClick={() => openEdit(p)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar produto</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDelete(p.id)}
                                  >
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
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 border-t p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Dialog de criação */}
        {isAdmin && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo produto</DialogTitle>
                <DialogDescription>Cadastre um novo item no catálogo.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Nome</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Notebook Pro 14"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição (opcional)</Label>
                  <Textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Descreva o produto em até 200 caracteres"
                    maxLength={200}
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Preço (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate}>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Dialog de edição completa (nome, descrição, preço) */}
        {isAdmin && (
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar produto</DialogTitle>
                <DialogDescription>Atualize as informações do produto.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Nome</Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Ex: Notebook Pro 14"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição (opcional)</Label>
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Descreva o produto em até 200 caracteres"
                    maxLength={200}
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Preço (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveEdit}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <ProductDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} product={detailsProduct} />
      </div>
    </TooltipProvider>
  );
}
