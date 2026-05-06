import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/utils/supabase/admin';

// GET /api/ratings/seller/[id] — Obtener calificaciones de un vendedor
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sellerId } = await params;

  if (!sellerId) {
    return NextResponse.json({ error: 'ID de vendedor requerido' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from('calificacion')
    .select('id, puntaje, comentario, fecha, id_calificador, usuario!calificacion_id_calificador_fkey(nombre)')
    .eq('id_calificado', sellerId)
    .order('fecha', { ascending: false });

  if (error) {
    // Si el join falla (FK no encontrada), intentar sin el join
    const { data: fallback, error: fallbackError } = await admin
      .from('calificacion')
      .select('id, puntaje, comentario, fecha, id_calificador')
      .eq('id_calificado', sellerId)
      .order('fecha', { ascending: false });

    if (fallbackError) {
      return NextResponse.json({ error: 'Error al obtener calificaciones' }, { status: 500 });
    }

    const ratings = (fallback ?? []).map((r) => ({
      id: r.id,
      score: r.puntaje,
      comment: r.comentario,
      date: r.fecha,
      buyerName: 'Comprador',
    }));

    const average =
      ratings.length > 0
        ? Math.round((ratings.reduce((s, r) => s + r.score, 0) / ratings.length) * 10) / 10
        : null;

    return NextResponse.json({ ratings, average, total: ratings.length });
  }

  const ratings = (data ?? []).map((r) => {
    const u = r.usuario as { nombre: string } | null;
    return {
      id: r.id,
      score: r.puntaje,
      comment: r.comentario,
      date: r.fecha,
      buyerName: u?.nombre ?? 'Comprador',
    };
  });

  const average =
    ratings.length > 0
      ? Math.round((ratings.reduce((s, r) => s + r.score, 0) / ratings.length) * 10) / 10
      : null;

  return NextResponse.json({ ratings, average, total: ratings.length });
}
