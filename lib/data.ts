import { ProductDetail } from './types';

type MockProductDetail = Omit<ProductDetail, 'image' | 'seller'> & { image?: string; seller?: string };

export const brands = ['BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Ferrari', 'Lamborghini', 'Universal'];

export const modelsByBrand: Record<string, string[]> = {
  'BMW': ['M2', 'M3', 'M4', 'M5', 'M5 F90', 'M8', 'X5 M', 'X6 M', '340i', '540i'],
  'Mercedes-Benz': ['AMG GT', 'C63 AMG', 'E63 AMG', 'S63 AMG', 'GLE 63', 'CLA 45', 'A45'],
  'Audi': ['RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'R8', 'TT RS', 'SQ5', 'SQ7'],
  'Porsche': ['911 GT3', '911 Turbo S', 'Cayenne Turbo', 'Panamera Turbo', 'Macan GTS', 'Taycan'],
  'Ferrari': ['488 GTB', 'F8 Tributo', 'SF90', '296 GTB', 'Roma', 'Portofino M'],
  'Lamborghini': ['Huracán', 'Urus', 'Aventador', 'Huracán STO', 'Urus Performante'],
  'Universal': ['Deportivos', 'Alto Rendimiento', 'Clásicos', 'SUV', 'Sedán'],
};

export const categories = [
  'Motor',
  'Llantas y Rines',
  'Interiores',
  'Escape',
  'Frenos',
  'Suspensión',
  'Carrocería',
  'Electrónica',
  'Accesorios',
];

export const mockRegisteredEmails = new Set([
  'admin@lotusbodycar.com',
  'vendedor@lotusbodycar.com',
  'buyer@lotusbodycar.com',
]);

export const mockPlatformUsers = [
  {
    id: 'u1',
    name: 'Administrador LBC',
    email: 'admin@lotusbodycar.com',
    role: 'admin' as const,
    phone: '+57 300 000 0001',
    address: 'Bogotá, Colombia',
    joinedDate: '2024-01-15',
    verified: true,
    active: true,
  },
  {
    id: 'u2',
    name: 'Carlos Vendedor',
    email: 'vendedor@lotusbodycar.com',
    role: 'seller' as const,
    phone: '+57 311 234 5678',
    address: 'Medellín, Colombia',
    joinedDate: '2024-03-10',
    verified: true,
    active: true,
  },
  {
    id: 'u3',
    name: 'María Compradora',
    email: 'buyer@lotusbodycar.com',
    role: 'buyer' as const,
    phone: '+57 322 987 6543',
    address: 'Cali, Colombia',
    joinedDate: '2024-06-20',
    verified: false,
    active: true,
  },
  {
    id: 'u4',
    name: 'Pedro Antiguo',
    email: 'pedro@ejemplo.com',
    role: 'buyer' as const,
    phone: '+57 333 111 2222',
    address: 'Barranquilla, Colombia',
    joinedDate: '2024-08-01',
    verified: true,
    active: false,
  },
];

export const mockProducts = [
  {
    id: '1',
    name: 'Motor V8 BMW M5',
    brand: 'BMW',
    model: 'M5 F90',
    price: 15000000,
    condition: 'Nuevo',
    image: 'https://images.unsplash.com/photo-1762139258224-236877b2c571?w=500',
    seller: 'Premium Parts Co.',
    location: 'Bogotá',
    category: 'Motor',
  },
  {
    id: '2',
    name: 'Rines Deportivos AMG 20"',
    brand: 'Mercedes-Benz',
    model: 'AMG GT',
    price: 8500000,
    condition: 'Nuevo',
    image: 'https://images.unsplash.com/photo-1677917362048-a9e5267d7882?w=500',
    seller: 'AutoLux Parts',
    location: 'Medellín',
    category: 'Llantas y Rines',
  },
  {
    id: '3',
    name: 'Asientos Deportivos Recaro',
    brand: 'Universal',
    model: 'Deportivos',
    price: 4500000,
    condition: 'Nuevo',
    image: 'https://images.unsplash.com/photo-1741086011537-c935f6f29724?w=500',
    seller: 'Racing Parts',
    location: 'Cali',
    category: 'Interiores',
  },
  {
    id: '4',
    name: 'Sistema de Escape Akrapovic',
    brand: 'Porsche',
    model: '911 GT3',
    price: 12000000,
    condition: 'Nuevo',
    image: 'https://images.unsplash.com/photo-1752959818576-b0991721789d?w=500',
    seller: 'Performance Shop',
    location: 'Bogotá',
    category: 'Escape',
  },
  {
    id: '5',
    name: 'Turbo Garrett GT3582R',
    brand: 'Universal',
    model: 'Alto Rendimiento',
    price: 6800000,
    condition: 'Nuevo',
    image: 'https://images.unsplash.com/photo-1759580596227-741485a217e6?w=500',
    seller: 'Turbo Masters',
    location: 'Medellín',
    category: 'Motor',
  },
  {
    id: '6',
    name: 'Frenos Brembo Gran Turismo',
    brand: 'Audi',
    model: 'RS6',
    price: 9500000,
    condition: 'Nuevo',
    image: 'https://images.unsplash.com/photo-1564128246944-88ea677875f6?w=500',
    seller: 'Brake Systems Pro',
    location: 'Bogotá',
    category: 'Frenos',
  },
];

export const mockProductDetails: Record<string, MockProductDetail> = {
  '1': {
    id: '1',
    name: 'Motor V8 BMW M5',
    brand: 'BMW',
    model: 'M5 F90',
    price: 15000000,
    condition: 'Nuevo',
    description:
      'Motor V8 biturbo de alto rendimiento para BMW M5 F90. Incluye garantía del fabricante y certificado de autenticidad. Perfecto estado, nunca instalado. Compatible con modelos 2018-2023.',
    images: [
      'https://images.unsplash.com/photo-1762139258224-236877b2c571?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      'https://images.unsplash.com/photo-1752959818576-b0991721789d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      'https://images.unsplash.com/photo-1759580596227-741485a217e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    ],
    sellerInfo: {
      name: 'Premium Parts Co.',
      rating: 4.8,
      reviews: 127,
      verified: true,
    },
    location: 'Bogotá, Colombia',
    category: 'Motor',
    stock: 3,
    specifications: {
      Compatibilidad: 'BMW M5 F90 (2018-2023)',
      Cilindrada: '4.4L V8 Biturbo',
      Potencia: '600 HP',
      Estado: 'Nuevo sin usar',
      Garantía: '12 meses',
      Origen: 'Alemania - Original BMW',
    },
  },
};

export const mockSellerProducts = [
  {
    id: '1',
    name: 'Motor V8 BMW M5',
    brand: 'BMW',
    model: 'M5 F90',
    price: 15000000,
    condition: 'Nuevo',
    status: 'available' as const,
    stock: 3,
    image:
      'https://images.unsplash.com/photo-1762139258224-236877b2c571?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    publishDate: '2024-11-10',
  },
  {
    id: '4',
    name: 'Sistema de Escape Akrapovic',
    brand: 'Porsche',
    model: '911 GT3',
    price: 12000000,
    condition: 'Nuevo',
    status: 'reserved' as const,
    stock: 1,
    image:
      'https://images.unsplash.com/photo-1752959818576-b0991721789d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    publishDate: '2024-11-08',
  },
  {
    id: '5',
    name: 'Turbo Garrett GT3582R',
    brand: 'Universal',
    model: 'Alto Rendimiento',
    price: 6800000,
    condition: 'Nuevo',
    status: 'sold' as const,
    stock: 0,
    image:
      'https://images.unsplash.com/photo-1759580596227-741485a217e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    publishDate: '2024-11-05',
  },
];

export const mockCartItems = [
  {
    id: '1',
    name: 'Motor V8 BMW M5',
    brand: 'BMW',
    model: 'M5 F90',
    price: 15000000,
    quantity: 1,
    stock: 3,
    image:
      'https://images.unsplash.com/photo-1762139258224-236877b2c571?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  },
  {
    id: '2',
    name: 'Rines Deportivos AMG 20"',
    brand: 'Mercedes-Benz',
    model: 'AMG GT',
    price: 8500000,
    quantity: 1,
    stock: 5,
    image:
      'https://images.unsplash.com/photo-1677917362048-a9e5267d7882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  },
  {
    id: '3',
    name: 'Asientos Deportivos Recaro',
    brand: 'Universal',
    model: 'Deportivos',
    price: 4500000,
    quantity: 2,
    stock: 8,
    image:
      'https://images.unsplash.com/photo-1741086011537-c935f6f29724?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  },
];

export const adminStats = {
  totalSales: 125000000,
  totalOrders: 48,
  totalProducts: 156,
  totalUsers: 342,
  monthlySales: [
    { month: 'Ene', sales: 15000000 },
    { month: 'Feb', sales: 18000000 },
    { month: 'Mar', sales: 22000000 },
    { month: 'Abr', sales: 19000000 },
    { month: 'May', sales: 25000000 },
    { month: 'Jun', sales: 26000000 },
  ],
  topProducts: [
    { name: 'Motor V8 BMW M5', sales: 45, revenue: 67500000 },
    { name: 'Rines AMG 20"', sales: 38, revenue: 32300000 },
    { name: 'Sistema Escape Akrapovic', sales: 24, revenue: 28800000 },
    { name: 'Asientos Recaro', sales: 42, revenue: 18900000 },
    { name: 'Turbo Garrett', sales: 31, revenue: 21080000 },
  ],
  recentOrders: [
    {
      id: 'ORD-1234',
      customer: 'Carlos Ramírez',
      product: 'Motor V8 BMW M5',
      amount: 15000000,
      status: 'Pagado',
      date: '2024-11-14',
    },
    {
      id: 'ORD-1235',
      customer: 'María González',
      product: 'Rines AMG 20"',
      amount: 8500000,
      status: 'Pendiente',
      date: '2024-11-14',
    },
    {
      id: 'ORD-1236',
      customer: 'Juan Pérez',
      product: 'Asientos Recaro',
      amount: 4500000,
      status: 'Pagado',
      date: '2024-11-13',
    },
    {
      id: 'ORD-1237',
      customer: 'Ana Torres',
      product: 'Sistema Escape',
      amount: 12000000,
      status: 'Pagado',
      date: '2024-11-13',
    },
    {
      id: 'ORD-1238',
      customer: 'Pedro Sánchez',
      product: 'Turbo Garrett',
      amount: 6800000,
      status: 'Enviado',
      date: '2024-11-12',
    },
  ],
};

export const mockOrderData = {
  orderNumber: 'LBC-2024-11-15-001234',
  paymentMethod: 'Tarjeta de Crédito Visa ****4532',
  transactionId: 'TXN-987654321',
  items: [
    {
      id: '1',
      name: 'Motor V8 BMW M5',
      brand: 'BMW',
      model: 'M5 F90',
      price: 15000000,
      quantity: 1,
    },
    {
      id: '2',
      name: 'Rines Deportivos AMG 20"',
      brand: 'Mercedes-Benz',
      model: 'AMG GT',
      price: 8500000,
      quantity: 1,
    },
    {
      id: '3',
      name: 'Asientos Deportivos Recaro',
      brand: 'Universal',
      model: 'Deportivos',
      price: 4500000,
      quantity: 2,
    },
  ],
  shippingAddress: 'Calle 123 #45-67, Bogotá, Colombia',
  subtotal: 32500000,
  iva: 6175000,
  shippingCost: 0,
  total: 38675000,
};
