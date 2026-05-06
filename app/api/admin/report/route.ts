import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/utils/supabase/admin';

function formatCLP(n: number) {
  return `$${n.toLocaleString('es-CO')}`;
}

function toCSV(headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))];
  return lines.join('\r\n');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') ?? 'sales';
  const period = searchParams.get('period') ?? 'monthly';
  const format = searchParams.get('format') ?? 'csv';

  const admin = createAdminClient();

  // Determinar rango de fechas según período
  const now = new Date();
  let fromDate: Date;
  switch (period) {
    case 'daily':
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'quarterly':
      fromDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case 'annual':
      fromDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'monthly':
    default:
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  const fromISO = fromDate.toISOString();

  let csvContent = '';
  let filename = `reporte_${type}_${period}`;

  if (type === 'sales' || type === 'income') {
    // Reporte de ventas/ingresos
    const { data: pedidos } = await admin
      .from('pedido')
      .select('numero_pedido, fecha, total, subtotal, impuestos_iva, estado_pedido, id_usuario, direccion_entrega')
      .gte('fecha', fromISO)
      .order('fecha', { ascending: false });

    const userIds = [...new Set((pedidos ?? []).map((p) => p.id_usuario).filter(Boolean))];
    let userMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: users } = await admin.from('usuario').select('id, nombre').in('id', userIds);
      userMap = Object.fromEntries((users ?? []).map((u) => [u.id, u.nombre]));
    }

    const headers = ['# Pedido', 'Fecha', 'Cliente', 'Subtotal', 'IVA', 'Total', 'Estado', 'Dirección'];
    const rows = (pedidos ?? []).map((p) => [
      p.numero_pedido,
      new Date(p.fecha).toLocaleDateString('es-CO'),
      userMap[p.id_usuario] ?? 'N/A',
      formatCLP(p.subtotal ?? 0),
      formatCLP(p.impuestos_iva ?? 0),
      formatCLP(p.total ?? 0),
      p.estado_pedido,
      p.direccion_entrega ?? '',
    ]);

    const totalSum = (pedidos ?? []).reduce((s, p) => s + (p.total ?? 0), 0);
    rows.push(['', '', 'TOTAL', '', '', formatCLP(totalSum), '', '']);

    csvContent = toCSV(headers, rows);
    filename = `reporte_ventas_${period}`;
  } else if (type === 'inventory') {
    // Reporte de inventario/productos
    const { data: productos } = await admin
      .from('producto')
      .select('id, nombre, marca, modelo, categoria, precio, stock, estado_publicacion, condicion_pieza')
      .order('nombre');

    const headers = ['ID', 'Nombre', 'Marca', 'Modelo', 'Categoría', 'Precio', 'Stock', 'Estado', 'Condición'];
    const rows = (productos ?? []).map((p) => [
      p.id,
      p.nombre,
      p.marca,
      p.modelo,
      p.categoria,
      formatCLP(p.precio ?? 0),
      p.stock ?? 0,
      p.estado_publicacion,
      p.condicion_pieza,
    ]);

    csvContent = toCSV(headers, rows);
    filename = `reporte_inventario`;
  } else if (type === 'purchases') {
    // Reporte de compras/artículos pedido
    const { data: articulos } = await admin
      .from('articulo_pedido')
      .select('id_pedido, id_producto, cantidad, precio_compra');

    const prodIds = [...new Set((articulos ?? []).map((a) => a.id_producto))];
    let prodMap: Record<string, string> = {};
    if (prodIds.length > 0) {
      const { data: prods } = await admin.from('producto').select('id, nombre').in('id', prodIds);
      prodMap = Object.fromEntries((prods ?? []).map((p) => [p.id, p.nombre]));
    }

    const headers = ['# Pedido', 'Producto', 'Cantidad', 'Precio Unitario', 'Subtotal'];
    const rows = (articulos ?? []).map((a) => [
      a.id_pedido,
      prodMap[a.id_producto] ?? a.id_producto,
      a.cantidad,
      formatCLP(a.precio_compra ?? 0),
      formatCLP((a.cantidad ?? 0) * (a.precio_compra ?? 0)),
    ]);

    csvContent = toCSV(headers, rows);
    filename = `reporte_compras`;
  } else if (type === 'customers') {
    // Reporte de clientes
    const { data: users } = await admin
      .from('usuario')
      .select('id, nombre, correo, rol, telefono, direccion')
      .order('nombre');

    const headers = ['ID', 'Nombre', 'Correo', 'Rol', 'Teléfono', 'Dirección'];
    const rows = (users ?? []).map((u) => [
      u.id,
      u.nombre,
      u.correo,
      u.rol,
      u.telefono ?? '',
      u.direccion ?? '',
    ]);

    csvContent = toCSV(headers, rows);
    filename = `reporte_clientes`;
  }

  // Agregar BOM para Excel (UTF-8)
  const bom = '\uFEFF';
  const content = bom + csvContent;

  const ext = format === 'excel' ? 'xls' : 'csv';
  const mimeType = format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv';

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': `${mimeType}; charset=utf-8`,
      'Content-Disposition': `attachment; filename="${filename}_${new Date().toISOString().slice(0, 10)}.${ext}"`,
    },
  });
}
