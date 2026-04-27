import { api } from "@/lib/api";
import type { PageResponse, Product } from "@/lib/types";

interface BackendProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
}

function mapProduct(p: BackendProduct): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? null,
    price: Number(p.price),
    imageUrl: p.imageUrl ?? null,
  };
}

// Retorna todos os produtos sem paginação — usada pelo OrderFormDialog (dropdown de seleção)
export async function listProducts(): Promise<Product[]> {
  const { data } = await api.get<BackendProduct[]>("/products/all");
  return data.map(mapProduct);
}

// Versão paginada — usada pela tela de gerenciamento de produtos
export async function listProductsPaged(page = 0, size = 20): Promise<PageResponse<Product>> {
  const { data } = await api.get<PageResponse<BackendProduct>>(
    `/products?page=${page}&size=${size}`,
  );
  return {
    ...data,
    content: data.content.map(mapProduct),
  };
}

export async function createProduct(input: {
  name: string;
  description?: string;
  price: number;
}): Promise<Product> {
  const { data } = await api.post<BackendProduct>("/products", {
    name: input.name,
    description: input.description ?? "",
    price: input.price,
  });
  return mapProduct(data);
}

export async function updateProduct(
  id: string,
  input: { name: string; description?: string; price: number },
): Promise<Product> {
  const { data } = await api.put<BackendProduct>(`/products/${id}`, {
    name: input.name,
    description: input.description ?? "",
    price: input.price,
  });
  return mapProduct(data);
}

export async function updateProductPrice(id: string, price: number): Promise<Product> {
  const { data } = await api.patch<BackendProduct>(`/products/${id}`, { price });
  return mapProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}
