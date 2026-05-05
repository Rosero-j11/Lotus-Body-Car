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
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json({ error: 'Error al obtener el producto', details: message }, { status: 500 });
  }
}
