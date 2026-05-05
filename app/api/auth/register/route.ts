import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben estar presentes' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    if (!['buyer', 'seller'].includes(role)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: existing } = await supabase
      .from('usuario')
      .select('id')
      .eq('correo', email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Este correo ya está registrado' }, { status: 409 });
    }

    const { data: newUser, error: insertError } = await supabase
      .from('usuario')
      .insert([{
        nombre: name,
        correo: email,
        rol: role,
        telefono: phone || '',
        verificado: false,
      }])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    const response = NextResponse.json(
      { user: newUser, message: 'Cuenta creada exitosamente' },
      { status: 201 }
    );

    response.cookies.set('lotus_auth', newUser.id, {
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[POST /api/auth/register]', err);
    return NextResponse.json({ error: 'Error al registrar', details: message }, { status: 500 });
  }
}
