import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/utils/supabase/admin';

// POST /api/auth/login — verifica credenciales en Supabase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const adminSupabase = createAdminClient();

    const { data: dbUser, error } = await adminSupabase
      .from('usuario')
      .select('id, nombre, correo, rol, telefono, fecha_registro')
      .eq('correo', normalizedEmail)
      .eq('contrasena', password)
      .single();

    if (error || !dbUser) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    const role = dbUser.rol as 'buyer' | 'seller' | 'admin';
    const user = {
      id: String(dbUser.id),
      name: dbUser.nombre,
      email: dbUser.correo,
      role,
      phone: dbUser.telefono ?? '',
      joinedDate: dbUser.fecha_registro ?? new Date().toISOString(),
    };

    const response = NextResponse.json({ user }, { status: 200 });

    response.cookies.set('lotus_auth', user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    response.cookies.set('lotus_role', role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

