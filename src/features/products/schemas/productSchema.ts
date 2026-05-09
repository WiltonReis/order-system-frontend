import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(200, "Máximo 200 caracteres"),
  description: z.string().max(200, "Máximo 200 caracteres").optional(),
  price: z
    .number({ invalid_type_error: "Preço inválido" })
    .min(0, "Preço deve ser positivo"),
});

export type ProductFormValues = z.infer<typeof productSchema>;
