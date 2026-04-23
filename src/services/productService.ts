import type { Product } from "@/lib/types";

let mockProducts: Product[] = [
  { id: "p1", name: "Notebook Pro 14", price: 7499.9 },
  { id: "p2", name: "Mouse sem fio", price: 149.9 },
  { id: "p3", name: "Teclado mecânico", price: 489.0 },
  { id: "p4", name: "Monitor 27\" 4K", price: 2299.0 },
  { id: "p5", name: "Headset USB-C", price: 359.5 },
];

/** Replace with: const { data } = await api.get<Product[]>("/products"); return data; */
export async function listProducts(): Promise<Product[]> {
  await new Promise((r) => setTimeout(r, 200));
  return [...mockProducts];
}

/** Replace with: const { data } = await api.post<Product>("/products", input); return data; */
export async function createProduct(input: { name: string; price: number }): Promise<Product> {
  await new Promise((r) => setTimeout(r, 200));
  const product: Product = { id: `p${Date.now()}`, ...input };
  mockProducts = [product, ...mockProducts];
  return product;
}

/** Replace with: const { data } = await api.patch<Product>(`/products/${id}`, { price }); return data; */
export async function updateProductPrice(id: string, price: number): Promise<Product> {
  await new Promise((r) => setTimeout(r, 200));
  const idx = mockProducts.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Produto não encontrado");
  mockProducts[idx] = { ...mockProducts[idx], price };
  return mockProducts[idx];
}

/** Replace with: await api.delete(`/products/${id}`); */
export async function deleteProduct(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 200));
  mockProducts = mockProducts.filter((p) => p.id !== id);
}
