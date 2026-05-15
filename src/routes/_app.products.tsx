import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/features/auth/context/AuthContext";
import { brl } from "@/lib/format";
import { resolveImageUrl } from "@/lib/api";
import { deleteProduct, listProductsPaged } from "@/features/products/api/productService";
import { ProductDetailsDialog } from "@/features/products/components/ProductDetailsDialog";
import { ProductFormDialog } from "@/features/products/components/ProductFormDialog";
import { usePagination } from "@/shared/hooks/usePagination";
import { showUndoToast } from "@/shared/components/UndoToast";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import type { Product } from "@/lib/types";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/products")({
  head: () => ({ meta: [{ title: "Produtos — OMS" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.role === "ADMIN_MASTER";
  const queryClient = useQueryClient();
  const { page, prev, next } = usePagination();

  const { data, isPending } = useQuery({
    queryKey: ["products", page],
    queryFn: () => listProductsPaged(page),
  });

  const products = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["products"] });

  const [formOpen, setFormOpen] = useState(false);
  const [formProduct, setFormProduct] = useState<Product | null>(null);
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<Product | null>(null);

  const openCreate = () => {
    setFormProduct(null);
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setFormProduct(p);
    setFormOpen(true);
  };

  const openDetails = (p: Product) => {
    setDetailsProduct(p);
    setDetailsOpen(true);
  };

  const handleDelete = (p: Product) => {
    setDetailsOpen(false);
    setConfirmDeleteProduct(p);
  };

  const executeDelete = () => {
    const p = confirmDeleteProduct;
    if (!p) return;
    setConfirmDeleteProduct(null);
    setPendingIds((prev) => new Set([...prev, p.id]));
    showUndoToast(
      `Produto "${p.name}" excluído`,
      async () => {
        try {
          await deleteProduct(p.id);
          await invalidate();
        } catch {
          toast.error(`Erro ao excluir "${p.name}"`);
          await invalidate();
        }
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(p.id);
          return next;
        });
      },
      () => {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(p.id);
          return next;
        });
      },
    );
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
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Novo produto
            </Button>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          {isPending ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : products.filter((p) => !pendingIds.has(p.id)).length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center">
              <Package className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhum produto cadastrado.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-4 p-6">
                {products.filter((p) => !pendingIds.has(p.id)).map((p) => (
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
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => openDetails(p)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Visualizar
                      </Button>
                      {isAdmin && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" aria-label="Editar produto" onClick={() => openEdit(p)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar produto</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive" aria-label="Excluir produto" onClick={() => handleDelete(p)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Excluir produto</TooltipContent>
                          </Tooltip>
                        </>
                      )}
                    </div>
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
                    onClick={prev}
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
                    onClick={next}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {isAdmin && (
          <ProductFormDialog
            product={formProduct}
            open={formOpen}
            onOpenChange={setFormOpen}
            onSaved={invalidate}
          />
        )}

        <ProductDetailsDialog
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          product={detailsProduct}
          isAdmin={isAdmin}
          onEdit={openEdit}
          onDelete={handleDelete}
        />

        <ConfirmDialog
          open={!!confirmDeleteProduct}
          onOpenChange={(o) => !o && setConfirmDeleteProduct(null)}
          title="Excluir produto?"
          description={`O produto "${confirmDeleteProduct?.name}" será excluído. Esta ação poderá ser desfeita por alguns segundos.`}
          onConfirm={executeDelete}
          confirmLabel="Excluir"
          destructive
        />
      </div>
    </TooltipProvider>
  );
}
