import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/utils/supabase/admin';

// POST /api/ratings — Crear calificación de un vendedor
export async function POST(request: NextRequest) {
  const userId = request.cookies.get('lotus_auth')?.value;
  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  let body: { sellerId: string; score: number; comment?: string; orderId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const { sellerId, score, comment, orderId } = body;

  if (!sellerId || typeof score !== 'number' || score < 1 || score > 5) {
    return NextResponse.json({ error: 'Datos incompletos o inválidos' }, { status: 400 });
  }

  if (userId === sellerId) {
    return NextResponse.json({ error: 'No puedes calificarte a ti mismo' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verificar duplicado (solo por calificador + calificado + orden si existe id_pedido)
  const { data: existing } = await admin
    .from('calificacion')
    .select('id')
    .eq('id_calificador', userId)
    .eq('id_calificado', sellerId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Ya calificaste a este vendedor' }, { status: 409 });
  }

  // Construir objeto a insertar — id_pedido y fecha son opcionales por si la tabla no los tiene
  const insertData: Record<string, unknown> = {
    id_calificador: userId,
    id_calificado: sellerId,
    puntaje: score,
    comentario: comment?.trim() || null,
  };

  if (orderId) insertData.id_pedido = orderId;

  const { error: insertError } = await admin.from('calificacion').insert(insertData);

  if (insertError) {
    // En desarrollo devolver el error real para debug
    const msg = process.env.NODE_ENV === 'development'
      ? `Supabase: ${insertError.message} (${insertError.code})`
      : 'Error al guardar calificación';
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Recalcular promedio de reputación del vendedor
  const { data: ratings } = await admin
    .from('calificacion')
    .select('puntaje')
    .eq('id_calificado', sellerId);

  if (ratings && ratings.length > 0) {
    const avg = ratings.reduce((sum, r) => sum + r.puntaje, 0) / ratings.length;
    await admin
      .from('usuario')
      .update({ reputacion: Math.round(avg * 10) / 10 })
      .eq('id', sellerId);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
