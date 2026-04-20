import type { CreateOrderPayload, Order, Product } from "@/lib/types";

let mockOrders: Order[] = [
  {
    id: "ORD-1024",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    createdByName: "Operador",
    items: [
      { productId: "p2", productName: "Mouse sem fio", quantity: 2, unitPrice: 149.9, subtotal: 299.8 },
      { productId: "p3", productName: "Teclado mecânico", quantity: 1, unitPrice: 489, subtotal: 489 },
    ],
    discountType: "PERCENT",
    discountAmount: 10,
    total: 709.92,
  },
  {
    id: "ORD-1025",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdByName: "Administrador",
    items: [
      { productId: "p1", productName: "Notebook Pro 14", quantity: 1, unitPrice: 7499.9, subtotal: 7499.9 },
    ],
    discountType: "VALUE",
    discountAmount: 0,
    total: 7499.9,
  },
];

/** Replace with: const { data } = await api.get<Order[]>("/orders"); return data; */
export async function listOrders(): Promise<Order[]> {
  await new Promise((r) => setTimeout(r, 200));
  return [...mockOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Replace with: const { data } = await api.post<Order>("/orders", payload); return data; */
export async function createOrder(
  payload: CreateOrderPayload,
  products: Product[],
  createdByName: string,
): Promise<Order> {
  await new Promise((r) => setTimeout(r, 300));

  const items = payload.items.map((it) => {
    const product = products.find((p) => p.id === it.productId);
    if (!product) throw new Error("Produto não encontrado");
    return {
      productId: product.id,
      productName: product.name,
      quantity: it.quantity,
      unitPrice: product.price,
      subtotal: product.price * it.quantity,
    };
  });

  const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
  const discount =
    payload.discountType === "PERCENT"
      ? subtotal * (payload.discountAmount / 100)
      : payload.discountAmount;
  const total = Math.max(0, subtotal - discount);

  const order: Order = {
    id: `ORD-${1026 + mockOrders.length}`,
    createdAt: new Date().toISOString(),
    createdByName,
    items,
    discountType: payload.discountType,
    discountAmount: payload.discountAmount,
    total,
  };
  mockOrders = [order, ...mockOrders];
  return order;
}
