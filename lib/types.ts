export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  avatar?: string;
  phone?: string;
  address?: string;
  joinedDate?: string;
  verified?: boolean;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  phone?: string;
  address?: string;
  joinedDate: string;
  verified: boolean;
  active: boolean;
}

export interface ProductHistory {
  id: string;
  action: 'created' | 'edited' | 'status_changed' | 'archived';
  description: string;
  date: string;
  author: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  condition: string;
  image: string;
  seller: string;
  location: string;
  category: string;
}

export interface ProductDetail extends Product {
  description: string;
  images: string[];
  sellerInfo: {
    name: string;
    rating: number;
    reviews: number;
    verified: boolean;
  };
  stock: number;
  specifications: Record<string, string>;
}

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  quantity: number;
  stock: number;
  image: string;
}

export interface SellerProduct {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  condition: string;
  status: 'available' | 'reserved' | 'sold' | 'archived';
  stock: number;
  image: string;
  publishDate: string;
  history?: ProductHistory[];
  views?: number;
}

export interface OrderItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  quantity: number;
}

export interface OrderData {
  orderNumber: string;
  date: string;
  paymentMethod: string;
  transactionId: string;
  items: OrderItem[];
  shippingAddress: string;
  subtotal: number;
  iva: number;
  shippingCost: number;
  total: number;
}
