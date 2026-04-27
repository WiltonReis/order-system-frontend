import { api } from "@/lib/api";
import type {
  CreateOrderPayload,
  Order,
  OrderItem,
  OrderStatus,
  PageResponse,
  Product,
  UpdateOrderPayload,
} from "@/lib/types";

interface BackendOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface BackendOrderDetail {
  id: string;
  orderCode: string;
  status: string;
  createdAt: string;
  total: number;
  discount: number;
  user: { id: string; username: string };
  items: BackendOrderItem[];
  completedAt?: string | null;
  canceledAt?: string | null;
  customerName?: string | null;
  completedByUsername?: string | null;
  canceledByUsername?: string | null;
}

function mapItem(item: BackendOrderItem): OrderItem {
  return {
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: Number(item.price),
    subtotal: Number(item.price) * item.quantity,
  };
}

function mapDetail(order: BackendOrderDetail): Order {
  return {
    id: order.id,
    orderCode: order.orderCode ?? "",
    status: order.status as OrderStatus,
    createdAt: order.createdAt,
    createdByName: order.user.username,
    items: order.items.map(mapItem),
    discountType: "VALUE",
    discountAmount: Number(order.discount ?? 0),
    total: Number(order.total),
    completedAt: order.completedAt ?? null,
    canceledAt: order.canceledAt ?? null,
    customerName: order.customerName ?? null,
    completedByUsername: order.completedByUsername ?? null,
    canceledByUsername: order.canceledByUsername ?? null,
  };
}

function computeDiscountValue(
  discountType: "PERCENT" | "VALUE",
  discountAmount: number,
  items: { productId: string; quantity: number }[],
  products: Product[],
): number {
  if (discountAmount <= 0) return 0;
  const subtotal = items.reduce((acc, item) => {
    const product = products.find((p) => p.id === item.productId);
    return acc + (product?.price ?? 0) * item.quantity;
  }, 0);
  return discountType === "PERCENT" ? subtotal * (discountAmount / 100) : discountAmount;
}

// PERF-01 + PERF-02: busca paginada com detalhes completos (sem N+1)
export async function listOrders(page = 0, size = 20): Promise<PageResponse<Order>> {
  const { data } = await api.get<PageResponse<BackendOrderDetail>>(
    `/orders/details?page=${page}&size=${size}`,
  );
  return {
    ...data,
    content: data.content.map(mapDetail),
  };
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const { data } = await api.get<BackendOrderDetail>(`/orders/${id}`);
  return mapDetail(data);
}

export async function createOrder(
  payload: CreateOrderPayload,
  products: Product[],
  _createdByName: string,
): Promise<Order> {
  const { data: created } = await api.post<{ id: string }>("/orders", {
    customerName: payload.customerName || undefined,
  });

  await Promise.all(
    payload.items.map((item) =>
      api.post(`/orders/${created.id}/items`, {
        productId: item.productId,
        quantity: item.quantity,
      }),
    ),
  );

  // Aplica desconto apenas quando ADMIN fornece um valor positivo
  if (payload.discountAmount != null && payload.discountAmount > 0) {
    const discountValue = computeDiscountValue(
      payload.discountType,
      payload.discountAmount,
      payload.items,
      products,
    );
    if (discountValue > 0) {
      await api.put(`/orders/${created.id}`, { discount: discountValue });
    }
  }

  const { data: detail } = await api.get<BackendOrderDetail>(`/orders/${created.id}`);
  return mapDetail(detail);
}

export async function updateOrder(
  payload: UpdateOrderPayload,
  products: Product[],
): Promise<Order> {
  const { data: current } = await api.get<BackendOrderDetail>(`/orders/${payload.id}`);

  const currentItems = current.items;
  const newItems = payload.items;

  // Remove itens que não estão mais no payload atualizado
  for (const ci of currentItems) {
    if (!newItems.find((ni) => ni.productId === ci.productId)) {
      await api.delete(`/orders/${payload.id}/items/${ci.id}`);
    }
  }

  // Adiciona novos itens ou atualiza quantidade dos existentes
  for (const ni of newItems) {
    const existing = currentItems.find((ci) => ci.productId === ni.productId);
    if (existing) {
      if (existing.quantity !== ni.quantity) {
        await api.put(`/orders/${payload.id}/items/${existing.id}`, { quantity: ni.quantity });
      }
    } else {
      await api.post(`/orders/${payload.id}/items`, {
        productId: ni.productId,
        quantity: ni.quantity,
      });
    }
  }

  // Atualiza desconto sempre que ADMIN fornece explicitamente (inclusive 0 para remover desconto)
  if (payload.discountAmount != null) {
    const discountValue = computeDiscountValue(
      payload.discountType,
      payload.discountAmount,
      newItems,
      products,
    );
    await api.put(`/orders/${payload.id}`, { discount: discountValue });
  }

  const { data: updated } = await api.get<BackendOrderDetail>(`/orders/${payload.id}`);
  return mapDetail(updated);
}

export async function finalizeOrder(id: string): Promise<void> {
  await api.put(`/orders/${id}/complete`);
}

export async function cancelOrder(id: string): Promise<void> {
  await api.put(`/orders/${id}/cancel`);
}
