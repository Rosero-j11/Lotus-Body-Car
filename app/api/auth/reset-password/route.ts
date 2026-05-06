import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createAdminClient } from '@/app/utils/supabase/admin';

const JWT_SECRET = process.env.RESET_TOKEN_SECRET || 'lotus-reset-secret';

interface ResetTokenPayload {
  email: string;
  type: string;
}

// GET /api/auth/reset-password?token=xxx — valida el token y devuelve el email
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ valid: false, reason: 'missing' }, { status: 400 });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as ResetTokenPayload;

    if (payload.type !== 'password_reset') {
      return NextResponse.json({ valid: false, reason: 'invalid' }, { status: 400 });
    }

    return NextResponse.json({ valid: true, email: payload.email });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ valid: false, reason: 'expired' }, { status: 400 });
    }
    return NextResponse.json({ valid: false, reason: 'invalid' }, { status: 400 });
  }
}

// POST /api/auth/reset-password — verifica token y actualiza contraseña en Supabase
export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Verificar JWT
    let payload: ResetTokenPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as ResetTokenPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return NextResponse.json({ error: 'El enlace ha expirado' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Enlace inválido' }, { status: 400 });
    }

    if (payload.type !== 'password_reset') {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
    }

    const email = payload.email;

    // Actualizar en Supabase si el usuario existe (para consistencia)
    const adminSupabase = createAdminClient();
    const { data: user } = await adminSupabase
      .from('usuario')
      .select('id')
      .eq('correo', email)
      .single();

    if (user) {
      // Si el campo contrasena existe en la tabla, actualizar
      // (ignorar error si la columna no existe)
      await adminSupabase
        .from('usuario')
        .update({ contrasena: newPassword })
        .eq('correo', email);
    }

    // Devolver el email para que el cliente actualice localStorage
    return NextResponse.json({ success: true, email });
  } catch (err) {
    console.error('[reset-password POST]', err);
    return NextResponse.json({ error: 'Error al actualizar la contraseña' }, { status: 500 });
  }
}
