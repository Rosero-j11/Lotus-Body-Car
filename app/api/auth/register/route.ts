import { NextRequest, NextResponse } from 'next/server';

// POST /api/auth/register
// Stub listo para integración con base de datos.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, role } = body;

    // Validaciones básicas en servidor
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

    // TODO: Reemplazar con inserción real en la base de datos
    // Ejemplo con Prisma:
    // const existingUser = await prisma.user.findUnique({ where: { email } });
    // if (existingUser) return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 });
    // const passwordHash = await bcrypt.hash(password, 12);
    // const user = await prisma.user.create({ data: { name, email, passwordHash, phone, role } });

    // Mock: simulación de registro exitoso
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      role,
      phone: phone || '',
      joinedDate: new Date().toISOString(),
    };

    const response = NextResponse.json(
      { user: newUser, message: 'Cuenta creada exitosamente' },
      { status: 201 }
    );

    response.cookies.set('lotus_auth', '1', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    response.cookies.set('lotus_role', newUser.role, {
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
