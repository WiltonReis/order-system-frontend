import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";
import { resolveImageUrl } from "@/lib/api";
import type { Product } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  isAdmin?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

function CatPlaceholder() {
  return (
    <svg
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      {/* corpo */}
      <ellipse cx="60" cy="78" rx="30" ry="24" fill="#1a1a2e" />
      {/* cabeça */}
      <circle cx="60" cy="50" r="22" fill="#1a1a2e" />
      {/* orelhas */}
      <polygon points="42,34 36,16 50,28" fill="#1a1a2e" />
      <polygon points="78,34 84,16 70,28" fill="#1a1a2e" />
      {/* orelhas internas */}
      <polygon points="43,33 38,20 50,29" fill="#7b2cbf" />
      <polygon points="77,33 82,20 70,29" fill="#7b2cbf" />
      {/* olhos */}
      <ellipse cx="52" cy="48" rx="5" ry="6" fill="#7b2cbf" />
      <ellipse cx="68" cy="48" rx="5" ry="6" fill="#7b2cbf" />
      <ellipse cx="52" cy="49" rx="2" ry="4" fill="#0a0a14" />
      <ellipse cx="68" cy="49" rx="2" ry="4" fill="#0a0a14" />
      {/* reflexo nos olhos */}
      <circle cx="54" cy="47" r="1.2" fill="white" opacity="0.7" />
      <circle cx="70" cy="47" r="1.2" fill="white" opacity="0.7" />
      {/* nariz */}
      <polygon points="60,56 57,59 63,59" fill="#7b2cbf" />
      {/* boca */}
      <path d="M57,59 Q60,63 63,59" stroke="#7b2cbf" strokeWidth="1.2" fill="none" />
      {/* bigodes */}
      <line x1="38" y1="57" x2="55" y2="59" stroke="#555" strokeWidth="1" />
      <line x1="38" y1="61" x2="55" y2="61" stroke="#555" strokeWidth="1" />
      <line x1="65" y1="59" x2="82" y2="57" stroke="#555" strokeWidth="1" />
      <line x1="65" y1="61" x2="82" y2="61" stroke="#555" strokeWidth="1" />
      {/* rabo */}
      <path d="M88,90 Q104,70 96,58" stroke="#1a1a2e" strokeWidth="8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function ProductDetailsDialog({ open, onOpenChange, product, isAdmin, onEdit, onDelete }: Props) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="h-56 w-56 overflow-hidden rounded-lg border border-border bg-muted/30 mx-auto">
            {resolveImageUrl(product.imageUrl) ? (
              <img
                src={resolveImageUrl(product.imageUrl)!}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center opacity-60">
                <CatPlaceholder />
              </div>
            )}
          </div>

          <div className="text-lg font-semibold tabular-nums text-primary text-right">
            {brl(product.price)}
          </div>

          {product.description && (
            <fieldset className="relative rounded-lg border border-border bg-muted/40">
              <legend className="ml-3 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-background">
                Descrição
              </legend>
              <div className="px-4 py-3">
                <p className="text-sm leading-relaxed text-foreground">{product.description}</p>
              </div>
            </fieldset>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {isAdmin && (
              <>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onEdit(product);
                      onOpenChange(false);
                    }}
                  >
                    <Pencil className="mr-1 h-4 w-4" />
                    Editar
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      onDelete(product);
                      onOpenChange(false);
                    }}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Excluir
                  </Button>
                )}
              </>
            )}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
