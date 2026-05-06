import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/utils/supabase/admin';

// POST /api/products/[id]/views — incrementa el contador de visitas en 1
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminSupabase = createAdminClient();

    const { data: current } = await adminSupabase
      .from('producto')
      .select('visitas')
      .eq('id', id)
      .single();

    await adminSupabase
      .from('producto')
      .update({ visitas: ((current?.visitas as number) ?? 0) + 1 })
      .eq('id', id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[POST /api/products/[id]/views]', err);
    // No lanzar error al cliente — las vistas no deben bloquear la carga del producto
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
