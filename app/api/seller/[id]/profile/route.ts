import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/utils/supabase/admin';

// GET /api/seller/[id]/profile — Perfil público del vendedor + productos activos
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Datos del vendedor — columnas base que siempre existen
  const { data: userData, error: userError } = await admin
    .from('usuario')
    .select('id, nombre, direccion, rol, telefono')
    .eq('id', id)
    .maybeSingle();

  if (userError || !userData) {
    const detail = process.env.NODE_ENV === 'development' ? { supabaseError: userError?.message } : {};
    return NextResponse.json({ error: 'Vendedor no encontrado', ...detail }, { status: 404 });
  }

  if (userData.rol !== 'seller' && userData.rol !== 'admin') {
    return NextResponse.json({ error: 'Este usuario no es vendedor' }, { status: 403 });
  }

  // Intentar obtener columnas opcionales (pueden no existir aún)
  const { data: extraData } = await admin
    .from('usuario')
    .select('reputacion, verificado, fecha_registro')
    .eq('id', id)
    .maybeSingle();

  // Productos activos del vendedor
  const { data: productsData } = await admin
    .from('producto')
    .select('id, nombre, marca, modelo, precio, condicion_pieza, categoria, detalle_producto(imagenes)')
    .eq('id_vendedor', id)
    .eq('estado_publicacion', 'Activa')
    .order('id', { ascending: false })
    .limit(12);

  const products = (productsData ?? []).map((p) => {
    const detail = Array.isArray(p.detalle_producto) ? p.detalle_producto[0] : p.detalle_producto;
    const images = detail?.imagenes ?? [];
    return {
      id: p.id,
      name: p.nombre,
      brand: p.marca,
      model: p.modelo,
      price: p.precio,
      condition: p.condicion_pieza,
      category: p.categoria,
      image: images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1762139258224-236877b2c571?w=500',
    };
  });

  const seller = {
    id: userData.id,
    name: userData.nombre,
    location: userData.direccion ?? 'Colombia',
    reputation: (extraData as { reputacion?: number | null } | null)?.reputacion ?? null,
    verified: (extraData as { verificado?: boolean | null } | null)?.verificado ?? false,
    joinedDate: (extraData as { fecha_registro?: string | null } | null)?.fecha_registro ?? new Date().toISOString(),
  };

  return NextResponse.json({ seller, products });
}
