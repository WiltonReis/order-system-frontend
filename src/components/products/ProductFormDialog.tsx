import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { extractErrorMessage, resolveImageUrl } from "@/lib/api";
import {
  createProduct,
  updateProduct,
  uploadProductImage,
} from "@/services/productService";
import { productSchema } from "@/schemas/productSchema";
import type { ProductFormValues } from "@/schemas/productSchema";
import type { Product } from "@/lib/types";

interface Props {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function ProductFormDialog({ product, open, onOpenChange, onSaved }: Props) {
  const isEdit = !!product;
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", price: 0 },
  });

  useEffect(() => {
    if (!open) return;
    if (product) {
      form.reset({ name: product.name, description: product.description ?? "", price: product.price });
    } else {
      form.reset({ name: "", description: "", price: 0 });
    }
    setImageFile(null);
    setImagePreview(null);
  }, [open, product]);

  function handleClose(o: boolean) {
    if (!o) {
      form.reset();
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(null);
      setImagePreview(null);
    }
    onOpenChange(o);
  }

  function handleImageSelect(file: File | undefined) {
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEdit) {
        await updateProduct(product!.id, {
          name: values.name.trim(),
          description: values.description?.trim(),
          price: values.price,
        });
        if (imageFile) {
          try {
            await uploadProductImage(product!.id, imageFile);
          } catch (e) {
            toast.error(extractErrorMessage(e, "Erro ao enviar imagem"));
          }
        }
        toast.success("Produto atualizado");
      } else {
        const created = await createProduct({
          name: values.name.trim(),
          description: values.description?.trim(),
          price: values.price,
        });
        if (imageFile) {
          try {
            await uploadProductImage(created.id, imageFile);
          } catch (e) {
            toast.error(extractErrorMessage(e, "Erro ao enviar imagem"));
          }
        }
        toast.success("Produto criado");
      }
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(extractErrorMessage(e, isEdit ? "Erro ao atualizar produto" : "Erro ao criar produto"));
    }
  });

  const imageUrl = imagePreview ?? (isEdit ? resolveImageUrl(product?.imageUrl) : null);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar produto" : "Novo produto"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Atualize as informações do produto." : "Cadastre um novo item no catálogo."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input {...form.register("name")} placeholder="Ex: Notebook Pro 14" />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Descrição (opcional)</Label>
            <Textarea
              {...form.register("description")}
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
              {...form.register("price", { valueAsNumber: true })}
              placeholder="0,00"
            />
            {form.formState.errors.price && (
              <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Imagem (opcional)</Label>
            <div className="flex justify-center">
              <div
                onClick={() => imageInputRef.current?.click()}
                className="h-32 w-32 cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors flex items-center justify-center"
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Pencil className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleImageSelect(e.target.files?.[0])}
              className="hidden"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>{isEdit ? "Salvar" : "Criar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
