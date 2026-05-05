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

// --- Database Schema Types ---

export interface ArticuloCarrito {
  id_carrito: string;
  id_producto: string;
  cantidad: number;
}

export interface ArticuloPedido {
  id_producto: string;
  id_pedido: string;
  precio_compra: number;
  cantidad: number;
}

export interface Calificacion {
  id: string;
  id_calificador: string;
  id_calificado: string;
  puntaje: number;
  comentario?: string | null;
}

export interface Carrito {
  id: string;
  id_usuario: string;
  subtotal: number;
  total: number;
}

export interface DetalleProducto {
  id_producto: string;
  descripcion: string;
  especificaciones: Record<string, any>;
  imagenes?: string[] | null;
}

export interface Factura {
  id_pedido: string;
  numero_factura: string;
  fecha_emision: string;
  url_pdf: string;
  datos_xml: string;
  clave_fiscal: string;
}

export interface Mensaje {
  id: string;
  id_remitente: string;
  id_destinatario: string;
  contenido: string;
  fecha_envio: string;
}

export interface Pedido {
  numero_pedido: string;
  id_usuario: string;
  fecha: string;
  estado_pedido: string;
  subtotal: number;
  impuestos_iva: number;
  total: number;
  id_transaccion: string;
  direccion_entrega: string;
}

export interface Producto {
  id: string;
  id_vendedor: string;
  nombre: string;
  marca: string;
  modelo: string;
  anio: number;
  categoria: string;
  precio: number;
  stock: number;
  estado_publicacion: string;
  condicion_pieza: string;
  fecha_fabricacion?: string | null;
}

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  telefono: string;
  direccion?: string | null;
  reputacion?: number | null;
  verificado: boolean;
}

