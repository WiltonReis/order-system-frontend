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

export interface OrderFilters {
  statuses?: OrderStatus[];
  userId?: string;
  sort?: string;
  startDate?: string;
  endDate?: string;
  customerName?: string;
  orderCode?: string;
}

interface BackendOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface BackendOrderSummary {
  id: string;
  orderCode: string;
  status: string;
  createdAt: string;
  total: number;
  discount: number;
  user: { id: string; name: string };
  completedAt?: string | null;
  canceledAt?: string | null;
  customerName?: string | null;
  completedByName?: string | null;
  canceledByName?: string | null;
}

interface BackendOrderDetail extends BackendOrderSummary {
  items: BackendOrderItem[];
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
    createdByName: order.user.name,
    items: order.items.map(mapItem),
    discountType: "VALUE",
    discountAmount: Number(order.discount ?? 0),
    total: Number(order.total),
    completedAt: order.completedAt ?? null,
    canceledAt: order.canceledAt ?? null,
    customerName: order.customerName ?? null,
    completedByName: order.completedByName ?? null,
    canceledByName: order.canceledByName ?? null,
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

// PERF-01 + PERF-02 + FUT-02: busca paginada com detalhes completos e filtros opcionais
export async function listOrders(page = 0, size = 20, filters: OrderFilters = {}): Promise<PageResponse<Order>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.customerName) params.set("customerName", filters.customerName);
  if (filters.orderCode) params.set("orderCode", filters.orderCode);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  filters.statuses?.forEach((s) => params.append("statuses", s));

  const { data } = await api.get<PageResponse<BackendOrderDetail>>(`/orders/details?${params}`);
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
): Promise<Order> {
  let discount: number | undefined;
  if (payload.discountAmount != null && payload.discountAmount > 0) {
    const discountValue = computeDiscountValue(
      payload.discountType,
      payload.discountAmount,
      payload.items,
      products,
    );
    if (discountValue > 0) discount = discountValue;
  }

  const { data } = await api.post<BackendOrderDetail>("/orders/full", {
    customerName: payload.customerName || undefined,
    items: payload.items,
    discount,
  });

  return mapDetail(data);
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

export async function deleteOrder(id: string): Promise<void> {
  await api.delete(`/orders/${id}`);
}

export async function restoreOrder(id: string): Promise<void> {
  await api.post(`/orders/${id}/restore`);
}
