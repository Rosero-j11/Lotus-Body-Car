import { NextRequest, NextResponse } from 'next/server';

// POST /api/auth/login
// Stub listo para integración con base de datos.
// Reemplaza la lógica mock con tu ORM/DB favorito (Prisma, Drizzle, etc.)
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

    // TODO: Reemplazar con consulta real a la base de datos
    // Ejemplo con Prisma:
    // const user = await prisma.user.findUnique({ where: { email } });
    // if (!user || !await bcrypt.compare(password, user.passwordHash)) { ... }

    // Mock: simulación de login exitoso
    const mockUser = {
      id: '1',
      name: 'Usuario Demo',
      email,
      role: email.includes('admin') ? 'admin' : email.includes('seller') ? 'seller' : 'buyer',
      phone: '+57 300 123 4567',
      joinedDate: new Date().toISOString(),
    };

    const response = NextResponse.json({ user: mockUser }, { status: 200 });

    // Setear cookies HttpOnly para mayor seguridad en producción
    // Por ahora usamos cookies accesibles client-side para el middleware
    response.cookies.set('lotus_auth', '1', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    });
    response.cookies.set('lotus_role', mockUser.role, {
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
