import type { Product } from "@/lib/types";

const mockProducts: Product[] = [
  { id: "p1", name: "Notebook Pro 14", price: 7499.9 },
  { id: "p2", name: "Mouse sem fio", price: 149.9 },
  { id: "p3", name: "Teclado mecânico", price: 489.0 },
  { id: "p4", name: "Monitor 27\" 4K", price: 2299.0 },
  { id: "p5", name: "Headset USB-C", price: 359.5 },
];

/** Replace with: const { data } = await api.get<Product[]>("/products"); return data; */
export async function listProducts(): Promise<Product[]> {
  await new Promise((r) => setTimeout(r, 200));
  return mockProducts;
}
