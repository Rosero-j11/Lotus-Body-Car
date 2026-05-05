import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

const DEMO_USERS = [
  { email: 'admin@lotusbodycar.com', password: 'Admin123!', role: 'admin', name: 'Administrador LBC', phone: '+57 300 000 0001' },
  { email: 'vendedor@lotusbodycar.com', password: 'Vend123!', role: 'seller', name: 'Carlos Vendedor', phone: '+57 311 234 5678' },
  { email: 'buyer@lotusbodycar.com', password: 'Buy123!', role: 'buyer', name: 'María Compradora', phone: '+57 322 987 6543' },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, storedPassword } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const demo = DEMO_USERS.find((u) => u.email === email && u.password === password);
    const isStoredMatch = storedPassword && password === storedPassword;

    if (!demo && !isStoredMatch) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    const supabase = await createClient();

    let { data: existing } = await supabase
      .from('usuario')
      .select('id, nombre, correo, rol, telefono, reputacion, verificado')
      .eq('correo', email)
      .maybeSingle();

    if (!existing) {
      const userData = demo
        ? { nombre: demo.name, rol: demo.role, telefono: demo.phone, reputacion: demo.role === 'admin' ? 5.0 : demo.role === 'seller' ? 4.8 : null }
        : { nombre: email.split('@')[0], rol: 'buyer', telefono: '' };

      const { data: created, error: insertError } = await supabase
        .from('usuario')
        .insert([{
          ...userData,
          correo: email,
          verificado: true,
        }])
        .select('id, nombre, correo, rol, telefono, reputacion, verificado')
        .single();

      if (insertError) throw insertError;
      existing = created;
    }

    const response = NextResponse.json({ user: existing }, { status: 200 });

    response.cookies.set('lotus_auth', existing.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    response.cookies.set('lotus_role', existing.rol, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json({ error: 'Error interno del servidor', details: message }, { status: 500 });
  }
}
