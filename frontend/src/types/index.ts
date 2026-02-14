export type Role = 'ADMIN' | 'MANAGER' | 'MEMBER';
export type Country = 'INDIA' | 'AMERICA';
export type OrderStatus = 'PENDING' | 'CHECKED_OUT' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  country: Country | null;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  cuisine: string;
  country: Country;
  imageUrl: string | null;
  _count?: { menuItems: number };
  menuItems?: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  available: boolean;
  restaurantId: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  menuItem: MenuItem;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  status: OrderStatus;
  totalAmount: number;
  country: Country;
  createdAt: string;
  orderItems: OrderItem[];
  restaurant: Restaurant;
  user?: { id: string; name: string; email: string };
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  details: string;
  isDefault: boolean;
}
