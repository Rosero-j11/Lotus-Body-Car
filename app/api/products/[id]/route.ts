import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { toUUID } from '@/lib/server-utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const resolvedParams = await params;

    const { data: product, error } = await supabase
      .from('producto')
      .select(`
        *,
        detalle_producto (
          *
        ),
        usuario:id_vendedor (
          id,
          nombre,
          direccion,
          reputacion,
          verificado
        )
      `)
      .eq('id', toUUID(resolvedParams.id))
      .single();

    if (error) {
      throw error;
    }

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (err: unknown) {
    let message = 'Error desconocido';
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'object' && err !== null) {
      const e = err as Record<string, unknown>;
      message = String(e.message || e.details || e.code || JSON.stringify(err));
    }
    console.error('[GET /api/products/[id]]', err);
    return NextResponse.json({ error: 'Error al obtener el producto', details: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authCookie = request.cookies.get('lotus_auth')?.value;
    const roleCookie = request.cookies.get('lotus_role')?.value;

    if (!authCookie || !['seller', 'admin'].includes(roleCookie || '')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const resolvedParams = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    if (body.precio !== undefined) updates.precio = Number(body.precio);
    if (body.stock !== undefined) updates.stock = Number(body.stock);
    if (body.condicion_pieza !== undefined) updates.condicion_pieza = body.condicion_pieza;
    if (body.estado_publicacion !== undefined) updates.estado_publicacion = body.estado_publicacion;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    const { data: product, error } = await supabase
      .from('producto')
      .update(updates)
      .eq('id', toUUID(resolvedParams.id))
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[PATCH /api/products/[id]]', err);
    return NextResponse.json({ error: 'Error al actualizar producto', details: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authCookie = request.cookies.get('lotus_auth')?.value;
    const roleCookie = request.cookies.get('lotus_role')?.value;

    if (!authCookie || !['seller', 'admin'].includes(roleCookie || '')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const resolvedParams = await params;
    const productId = toUUID(resolvedParams.id);

    await supabase.from('detalle_producto').delete().eq('id_producto', productId);
    const { error } = await supabase.from('producto').delete().eq('id', productId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[DELETE /api/products/[id]]', err);
    return NextResponse.json({ error: 'Error al eliminar producto', details: message }, { status: 500 });
  }
}
