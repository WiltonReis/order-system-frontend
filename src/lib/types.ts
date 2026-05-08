export type Role = "ADMIN_MASTER" | "ADMIN" | "USER";

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
export type OrderStatus = "OPEN" | "COMPLETED" | "CANCELED";

export interface User {
  id: string;
  name: string;
  email: string;
  customerSaasId?: string;
  role: Role;
}

export interface AuthResponse {
  user: User;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderCode: string;
  status: OrderStatus;
  createdAt: string;
  createdByName: string;
  items: OrderItem[];
  discountType: "PERCENT" | "VALUE";
  discountAmount: number;
  total: number;
  completedAt?: string | null;
  canceledAt?: string | null;
  customerName?: string | null;
  completedByName?: string | null;
  canceledByName?: string | null;
}

export interface CreateOrderPayload {
  items: { productId: string; quantity: number }[];
  discountType: "PERCENT" | "VALUE";
  discountAmount?: number; // undefined = não mexer no desconto (usuários sem permissão de ADMIN)
  customerName?: string;
}

export interface UpdateOrderPayload extends CreateOrderPayload {
  id: string;
}

export interface TopProduct {
  productName: string;
  totalQuantity: number;
}

export interface RevenueByDay {
  date: string;
  revenue: number;
}

export interface OrdersByStatus {
  OPEN: number;
  COMPLETED: number;
  CANCELED: number;
}

export interface DashboardData {
  totalOrders: number;
  revenue: number;
  cancelRate: number;
  averageTicket: number;
  topProducts: TopProduct[];
  ordersByStatus: OrdersByStatus;
  revenueByDay: RevenueByDay[];
}
