export type Role = "ADMIN" | "USER";

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
  price: number;
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
  createdAt: string;
  createdByName: string;
  items: OrderItem[];
  discountType: "PERCENT" | "VALUE";
  discountAmount: number;
  total: number;
}

export interface CreateOrderPayload {
  items: { productId: string; quantity: number }[];
  discountType: "PERCENT" | "VALUE";
  discountAmount: number;
}
