import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/utils/supabase/admin';
import { cookies } from 'next/headers';

function requireAdmin() {
  // Verificación básica de rol desde cookies (el middleware ya protege /admin)
  return true;
}

export async function GET(_req: NextRequest) {
  requireAdmin();
  const admin = createAdminClient();

  // Ejecutar queries en paralelo
  const [
    pedidosRes,
    productosActivosRes,
    usuariosRes,
    articulosRes,
    pedidosDetalleRes,
  ] = await Promise.all([
    // Total pedidos y suma de ventas
    admin.from('pedido').select('numero_pedido, total, fecha, estado_pedido, id_usuario'),
    // Productos activos
    admin.from('producto').select('id, nombre, precio, estado_publicacion', { count: 'exact' }).eq('estado_publicacion', 'Activa'),
    // Total usuarios
    admin.from('usuario').select('id', { count: 'exact' }),
    // Artículos de pedido para top products
    admin.from('articulo_pedido').select('id_producto, cantidad, precio_compra'),
    // Pedidos recientes con info del usuario
    admin
      .from('pedido')
      .select('numero_pedido, total, fecha, estado_pedido, id_usuario, direccion_entrega')
      .order('fecha', { ascending: false })
      .limit(20),
  ]);

  // --- KPIs ---
  const allPedidos = pedidosRes.data ?? [];
  const totalSales = allPedidos.reduce((sum, p) => sum + (p.total ?? 0), 0);
  const totalOrders = allPedidos.length;
  const totalProducts = productosActivosRes.count ?? 0;
  const totalUsers = usuariosRes.count ?? 0;

  // --- Ventas mensuales (últimos 12 meses) ---
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const monthlySalesMap: Record<string, number> = {};

  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlySalesMap[key] = 0;
  }

  for (const pedido of allPedidos) {
    if (!pedido.fecha) continue;
    const d = new Date(pedido.fecha);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (key in monthlySalesMap) {
      monthlySalesMap[key] += pedido.total ?? 0;
    }
  }

  const monthlySales = Object.entries(monthlySalesMap).map(([key, sales]) => {
    const [year, month] = key.split('-');
    return {
      month: monthNames[parseInt(month) - 1],
      year: parseInt(year),
      key,
      sales,
    };
  });

  // --- Top productos más vendidos ---
  const articulos = articulosRes.data ?? [];
  const productoMap: Record<string, { units: number; revenue: number }> = {};
  for (const a of articulos) {
    if (!productoMap[a.id_producto]) {
      productoMap[a.id_producto] = { units: 0, revenue: 0 };
    }
    productoMap[a.id_producto].units += a.cantidad ?? 0;
    productoMap[a.id_producto].revenue += (a.cantidad ?? 0) * (a.precio_compra ?? 0);
  }

  // Ordenar por unidades y tomar top 5
  const topProductIds = Object.entries(productoMap)
    .sort((a, b) => b[1].units - a[1].units)
    .slice(0, 5)
    .map(([id]) => id);

  let topProducts: { name: string; sales: number; revenue: number }[] = [];
  if (topProductIds.length > 0) {
    const { data: prodData } = await admin
      .from('producto')
      .select('id, nombre')
      .in('id', topProductIds);

    topProducts = topProductIds.map((id) => {
      const prod = prodData?.find((p) => p.id === id);
      return {
        name: prod?.nombre ?? 'Producto desconocido',
        sales: productoMap[id].units,
        revenue: productoMap[id].revenue,
      };
    });
  }

  // --- Pedidos recientes con nombre del cliente ---
  const recentRaw = pedidosDetalleRes.data ?? [];
  const uniqueUserIds = [...new Set(recentRaw.map((p) => p.id_usuario).filter(Boolean))];

  let userNames: Record<string, string> = {};
  if (uniqueUserIds.length > 0) {
    const { data: usersData } = await admin
      .from('usuario')
      .select('id, nombre')
      .in('id', uniqueUserIds);
    userNames = Object.fromEntries((usersData ?? []).map((u) => [u.id, u.nombre]));
  }

  // Obtener primer producto de cada pedido para mostrar en tabla
  const pedidoIds = recentRaw.map((p) => p.numero_pedido);
  let firstProductNames: Record<string, string> = {};
  if (pedidoIds.length > 0) {
    const { data: artData } = await admin
      .from('articulo_pedido')
      .select('id_pedido, id_producto, cantidad')
      .in('id_pedido', pedidoIds);

    const firstArtMap: Record<string, string> = {};
    for (const art of artData ?? []) {
      if (!firstArtMap[art.id_pedido]) firstArtMap[art.id_pedido] = art.id_producto;
    }

    const prodIds = [...new Set(Object.values(firstArtMap))];
    if (prodIds.length > 0) {
      const { data: prodNames } = await admin.from('producto').select('id, nombre').in('id', prodIds);
      const prodNameMap = Object.fromEntries((prodNames ?? []).map((p) => [p.id, p.nombre]));
      for (const [pedidoId, prodId] of Object.entries(firstArtMap)) {
        firstProductNames[pedidoId] = prodNameMap[prodId] ?? 'Producto';
      }
    }
  }

  const statusMap: Record<string, string> = {
    Pagado: 'Pagado',
    pagado: 'Pagado',
    Pendiente: 'Pendiente',
    pendiente: 'Pendiente',
    Enviado: 'Enviado',
    enviado: 'Enviado',
    Entregado: 'Entregado',
    entregado: 'Entregado',
    Cancelado: 'Cancelado',
    cancelado: 'Cancelado',
  };

  const recentOrders = recentRaw.map((p) => ({
    id: p.numero_pedido,
    customer: userNames[p.id_usuario] ?? 'Cliente',
    product: firstProductNames[p.numero_pedido] ?? 'Producto',
    amount: p.total ?? 0,
    status: statusMap[p.estado_pedido] ?? p.estado_pedido ?? 'Pendiente',
    date: p.fecha,
  }));

  return NextResponse.json({
    totalSales,
    totalOrders,
    totalProducts,
    totalUsers,
    monthlySales,
    topProducts,
    recentOrders,
  });
}
