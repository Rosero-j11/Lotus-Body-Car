import { 
  Usuario, 
  Producto, 
  DetalleProducto, 
  CartItem,
  Pedido, 
  ArticuloPedido,
  SellerProduct
} from './types';

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

export const mockPlatformUsers: Usuario[] = [
  {
    id: 'u1',
    nombre: 'Administrador LBC',
    correo: 'admin@lotusbodycar.com',
    rol: 'admin',
    telefono: '+57 300 000 0001',
    direccion: 'Bogotá, Colombia',
    reputacion: 5.0,
    verificado: true,
  },
  {
    id: 'u2',
    nombre: 'Carlos Vendedor',
    correo: 'vendedor@lotusbodycar.com',
    rol: 'seller',
    telefono: '+57 311 234 5678',
    direccion: 'Medellín, Colombia',
    reputacion: 4.8,
    verificado: true,
  },
  {
    id: 'u3',
    nombre: 'María Compradora',
    correo: 'buyer@lotusbodycar.com',
    rol: 'buyer',
    telefono: '+57 322 987 6543',
    direccion: 'Cali, Colombia',
    reputacion: null,
    verificado: false,
  },
  {
    id: 'u4',
    nombre: 'Pedro Antiguo',
    correo: 'pedro@ejemplo.com',
    rol: 'buyer',
    telefono: '+57 333 111 2222',
    direccion: 'Barranquilla, Colombia',
    reputacion: null,
    verificado: true,
  },
];

export const mockProducts: Producto[] = [
  {
    id: '1',
    id_vendedor: 'u2',
    nombre: 'Motor V8 BMW M5',
    marca: 'BMW',
    modelo: 'M5 F90',
    anio: 2023,
    categoria: 'Motor',
    precio: 15000000,
    stock: 3,
    estado_publicacion: 'Activa',
    condicion_pieza: 'Nuevo',
    fecha_fabricacion: '2023-01-15',
  },
  {
    id: '2',
    id_vendedor: 'u2',
    nombre: 'Rines Deportivos AMG 20"',
    marca: 'Mercedes-Benz',
    modelo: 'AMG GT',
    anio: 2022,
    categoria: 'Llantas y Rines',
    precio: 8500000,
    stock: 5,
    estado_publicacion: 'Activa',
    condicion_pieza: 'Nuevo',
  },
  {
    id: '3',
    id_vendedor: 'u2',
    nombre: 'Asientos Deportivos Recaro',
    marca: 'Universal',
    modelo: 'Deportivos',
    anio: 2024,
    categoria: 'Interiores',
    precio: 4500000,
    stock: 8,
    estado_publicacion: 'Activa',
    condicion_pieza: 'Nuevo',
  },
  {
    id: '4',
    id_vendedor: 'u2',
    nombre: 'Sistema de Escape Akrapovic',
    marca: 'Porsche',
    modelo: '911 GT3',
    anio: 2023,
    categoria: 'Escape',
    precio: 12000000,
    stock: 1,
    estado_publicacion: 'Reservado',
    condicion_pieza: 'Nuevo',
  },
  {
    id: '5',
    id_vendedor: 'u2',
    nombre: 'Turbo Garrett GT3582R',
    marca: 'Universal',
    modelo: 'Alto Rendimiento',
    anio: 2021,
    categoria: 'Motor',
    precio: 6800000,
    stock: 0,
    estado_publicacion: 'Vendida',
    condicion_pieza: 'Nuevo',
  },
  {
    id: '6',
    id_vendedor: 'u2',
    nombre: 'Frenos Brembo Gran Turismo',
    marca: 'Audi',
    modelo: 'RS6',
    anio: 2023,
    categoria: 'Frenos',
    precio: 9500000,
    stock: 2,
    estado_publicacion: 'Activa',
    condicion_pieza: 'Nuevo',
  },
];

export const mockProductDetails: Record<string, DetalleProducto> = {
  '1': {
    id_producto: '1',
    descripcion: 'Motor V8 biturbo de alto rendimiento para BMW M5 F90. Incluye garantía del fabricante y certificado de autenticidad. Perfecto estado, nunca instalado. Compatible con modelos 2018-2023.',
    especificaciones: {
      Compatibilidad: 'BMW M5 F90 (2018-2023)',
      Cilindrada: '4.4L V8 Biturbo',
      Potencia: '600 HP',
      Estado: 'Nuevo sin usar',
      Garantia: '12 meses',
      Origen: 'Alemania - Original BMW',
    },
    imagenes: [
      'https://images.unsplash.com/photo-1762139258224-236877b2c571?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      'https://images.unsplash.com/photo-1752959818576-b0991721789d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      'https://images.unsplash.com/photo-1759580596227-741485a217e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    ],
  },
  '2': {
    id_producto: '2',
    descripcion: 'Rines deportivos de aleación ligera originales AMG de 20 pulgadas.',
    especificaciones: { Diametro: '20"', Material: 'Aleación ligera' },
    imagenes: ['https://images.unsplash.com/photo-1677917362048-a9e5267d7882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080'],
  },
  '3': {
    id_producto: '3',
    descripcion: 'Asientos deportivos tipo cubo de la marca Recaro. Máximo agarre y confort.',
    especificaciones: { Color: 'Negro', Material: 'Alcantara' },
    imagenes: ['https://images.unsplash.com/photo-1741086011537-c935f6f29724?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080'],
  },
  '4': {
    id_producto: '4',
    descripcion: 'Sistema de escape Akrapovic fabricado en titanio de alta calidad para Porsche 911 GT3. Sonido inigualable y reducción de peso significativa.',
    especificaciones: { Material: 'Titanio', 'Reducción de peso': '4kg', Sonido: 'Sport' },
    imagenes: ['https://images.unsplash.com/photo-1617406181730-cbc3e4665411?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080'],
  },
  '5': {
    id_producto: '5',
    descripcion: 'Turbocompresor Garrett GT3582R para preparaciones de alto rendimiento. Capaz de soportar hasta 700 HP.',
    especificaciones: { Marca: 'Garrett', Modelo: 'GT3582R', Rango: '400-700 HP' },
    imagenes: ['https://images.unsplash.com/photo-1614165939020-f71f0683a35c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080'],
  },
  '6': {
    id_producto: '6',
    descripcion: 'Kit de frenos Brembo Gran Turismo con pinzas de 6 pistones y discos perforados de 380mm.',
    especificaciones: { Marca: 'Brembo', Pistones: '6', Discos: '380mm' },
    imagenes: ['https://images.unsplash.com/photo-1603811463131-017e8c3b0a72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080'],
  },
};

export const mockCartItems: CartItem[] = [
  {
    id: '1',
    name: 'Motor V8 BMW M5',
    brand: 'BMW',
    model: 'M5 F90',
    price: 15000000,
    quantity: 1,
    stock: 3,
    image: mockProductDetails['1']?.imagenes?.[0] || '',
  },
  {
    id: '2',
    name: 'Rines Deportivos AMG 20"',
    brand: 'Mercedes-Benz',
    model: 'AMG GT',
    price: 8500000,
    quantity: 1,
    stock: 5,
    image: mockProductDetails['2']?.imagenes?.[0] || '',
  },
  {
    id: '3',
    name: 'Asientos Deportivos Recaro',
    brand: 'Universal',
    model: 'Deportivos',
    price: 4500000,
    quantity: 2,
    stock: 8,
    image: mockProductDetails['3']?.imagenes?.[0] || '',
  },
];

export const mockOrderData: Pedido = {
  numero_pedido: 'LBC-2024-11-15-001234',
  id_usuario: 'u3',
  fecha: '2024-11-15',
  estado_pedido: 'Procesando',
  subtotal: 32500000,
  impuestos_iva: 6175000,
  total: 38675000,
  id_transaccion: 'TXN-987654321',
  direccion_entrega: 'Calle 123 #45-67, Bogotá, Colombia',
};

export const mockOrderItems: ArticuloPedido[] = [
  {
    id_producto: '1',
    id_pedido: 'LBC-2024-11-15-001234',
    precio_compra: 15000000,
    cantidad: 1,
  },
  {
    id_producto: '2',
    id_pedido: 'LBC-2024-11-15-001234',
    precio_compra: 8500000,
    cantidad: 1,
  },
  {
    id_producto: '3',
    id_pedido: 'LBC-2024-11-15-001234',
    precio_compra: 4500000,
    cantidad: 2,
  },
];

export const mockSellerProducts: SellerProduct[] = mockProducts.map(p => {
  let status: 'available' | 'reserved' | 'sold' | 'archived' = 'available';
  if (p.estado_publicacion === 'Reservado') status = 'reserved';
  else if (p.estado_publicacion === 'Vendida') status = 'sold';
  
  return {
    id: p.id,
    name: p.nombre,
    brand: p.marca,
    model: p.modelo,
    price: p.precio,
    condition: p.condicion_pieza,
    status,
    stock: p.stock,
    image: mockProductDetails[p.id]?.imagenes?.[0] || 'https://images.unsplash.com/photo-1762139258224-236877b2c571?w=500',
    publishDate: p.fecha_fabricacion || new Date().toISOString()
  };
});

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
  ],
};
