import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useAuth } from "@/context/AuthContext";
import { brl } from "@/lib/format";
import { extractErrorMessage, resolveImageUrl } from "@/lib/api";
import {
  createProduct,
  deleteProduct,
  listProductsPaged,
  updateProduct,
  uploadProductImage,
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
  const isAdmin = user?.role === "ADMIN" || user?.role === "ADMIN_MASTER";
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);

  // File input refs for image upload
  const newImageInputRef = useRef<HTMLInputElement>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);

  const { data, isPending } = useQuery({
    queryKey: ["products", page],
    queryFn: () => listProductsPaged(page),
  });

  const products = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["products"] });

  // Estado do dialog de criação
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  // Estado do dialog de visualização
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Estado do dialog de edição completa
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  // Estado do dialog de confirmação de exclusão
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  function handleImageSelect(
    file: File | undefined,
    prevPreview: string | null,
    setFile: (f: File | null) => void,
    setPreview: (s: string | null) => void,
  ) {
    if (!file) return;
    if (prevPreview) URL.revokeObjectURL(prevPreview);
    setFile(file);
    setPreview(URL.createObjectURL(file));
  }

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
    if (!editTarget) return;
    const price = parseFloat(editPrice);
    if (!editName.trim() || isNaN(price) || price < 0) {
      toast.error("Preencha nome e preço válidos");
      return;
    }
    try {
      await updateProduct(editTarget.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        price,
      });
      if (editImageFile) {
        try {
          await uploadProductImage(editTarget.id, editImageFile);
        } catch (e) {
          toast.error(extractErrorMessage(e, "Erro ao enviar imagem"));
        }
      }
      toast.success("Produto atualizado");
      if (editImagePreview) URL.revokeObjectURL(editImagePreview);
      setEditImageFile(null);
      setEditImagePreview(null);
      setEditOpen(false);
      invalidate();
    } catch (e) {
      toast.error(extractErrorMessage(e, "Erro ao atualizar produto"));
    }
  };

  const handleDeleteClick = (p: Product) => {
    setDeleteTarget(p);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      toast.success("Produto excluído");
      setDeleteTarget(null);
      invalidate();
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
      const product = await createProduct({ name: newName.trim(), description: newDescription.trim(), price });
      if (newImageFile) {
        try {
          await uploadProductImage(product.id, newImageFile);
        } catch (e) {
          toast.error(extractErrorMessage(e, "Erro ao enviar imagem"));
        }
      }
      toast.success("Produto criado");
      setNewName("");
      setNewDescription("");
      setNewPrice("");
      if (newImagePreview) URL.revokeObjectURL(newImagePreview);
      setNewImageFile(null);
      setNewImagePreview(null);
      setCreateOpen(false);
      invalidate();
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
          {isPending ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center">
              <Package className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhum produto cadastrado.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-4 p-6">
                {products.map((p) => (
                  <div key={p.id} className="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
                    <div className="aspect-square overflow-hidden rounded bg-muted">
                      {resolveImageUrl(p.imageUrl) ? (
                        <img src={resolveImageUrl(p.imageUrl)!} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-semibold line-clamp-2">{p.name}</h3>
                      <p className="text-base font-bold text-primary">{brl(p.price)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => openDetails(p)}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Visualizar
                    </Button>
                  </div>
                ))}
              </div>
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
          <Dialog open={createOpen} onOpenChange={(open) => {
            if (!open) {
              if (newImagePreview) URL.revokeObjectURL(newImagePreview);
              setNewImageFile(null);
              setNewImagePreview(null);
            }
            setCreateOpen(open);
          }}>
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
                    min="0"
                    value={newPrice}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setNewPrice(String(Math.max(0, val)));
                    }}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Imagem (opcional)</Label>
                  <div className="flex justify-center">
                    <div
                      onClick={() => newImageInputRef.current?.click()}
                      className="h-32 w-32 cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors flex items-center justify-center"
                    >
                      {newImagePreview ? (
                        <img src={newImagePreview} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Pencil className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <input
                    ref={newImageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) =>
                      handleImageSelect(e.target.files?.[0], newImagePreview, setNewImageFile, setNewImagePreview)
                    }
                    className="hidden"
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
          <Dialog open={editOpen} onOpenChange={(open) => {
            if (!open) {
              if (editImagePreview) URL.revokeObjectURL(editImagePreview);
              setEditImageFile(null);
              setEditImagePreview(null);
            }
            setEditOpen(open);
          }}>
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
                    min="0"
                    value={editPrice}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setEditPrice(String(Math.max(0, val)));
                    }}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Imagem (opcional)</Label>
                  <div className="flex justify-center">
                    <div
                      onClick={() => editImageInputRef.current?.click()}
                      className="h-32 w-32 cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors flex items-center justify-center"
                    >
                      {editImagePreview ?? resolveImageUrl(editTarget?.imageUrl) ? (
                        <img
                          src={editImagePreview ?? resolveImageUrl(editTarget?.imageUrl)!}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Pencil className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <input
                    ref={editImageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) =>
                      handleImageSelect(e.target.files?.[0], editImagePreview, setEditImageFile, setEditImagePreview)
                    }
                    className="hidden"
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

        <ProductDetailsDialog
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          product={detailsProduct}
          isAdmin={isAdmin}
          onEdit={openEdit}
          onDelete={handleDeleteClick}
        />

        {/* Confirmation dialog for delete */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
              <AlertDialogDescription>
                O produto "{deleteTarget?.name}" será permanentemente removido do catálogo. Essa ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
