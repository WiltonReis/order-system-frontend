import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { brl } from "@/lib/format";
import { extractErrorMessage, resolveImageUrl } from "@/lib/api";
import { deleteProduct, listProductsPaged } from "@/services/productService";
import { ProductDetailsDialog } from "@/components/orders/ProductDetailsDialog";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { usePagination } from "@/shared/hooks/usePagination";
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
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

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
                              <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" onClick={() => openEdit(p)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar produto</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive" onClick={() => setDeleteTarget(p)}>
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
          onDelete={setDeleteTarget}
        />

        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(o) => !o && setDeleteTarget(null)}
          title="Excluir produto?"
          description={`O produto "${deleteTarget?.name}" será permanentemente removido do catálogo. Essa ação não pode ser desfeita.`}
          onConfirm={executeDelete}
          confirmLabel="Excluir"
          destructive
        />
      </div>
    </TooltipProvider>
  );
}
