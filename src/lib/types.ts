export type Role = "ADMIN" | "USER";
export type OrderStatus = "OPEN" | "COMPLETED" | "CANCELED";

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
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
  completedByUsername?: string | null;
  canceledByUsername?: string | null;
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
