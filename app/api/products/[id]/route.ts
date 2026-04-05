import { NextRequest, NextResponse } from 'next/server';
import { mockProducts } from '@/lib/data';

// GET /api/products/[id] — Detalle de un producto
// PUT /api/products/[id] — Actualizar producto (solo propietario o admin)
// DELETE /api/products/[id] — Eliminar producto (solo propietario o admin)

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // TODO: Reemplazar con consulta real a la base de datos
    // const product = await prisma.product.findUnique({ where: { id } });

    const product = mockProducts.find((p) => p.id === id);

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const authCookie = request.cookies.get('lotus_auth')?.value;
    const roleCookie = request.cookies.get('lotus_role')?.value;

    if (!authCookie || !['seller', 'admin'].includes(roleCookie || '')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // TODO: Reemplazar con actualización real en la base de datos
    // const updated = await prisma.product.update({ where: { id }, data: body });

    return NextResponse.json({ product: { id, ...body }, message: 'Producto actualizado' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const authCookie = request.cookies.get('lotus_auth')?.value;
    const roleCookie = request.cookies.get('lotus_role')?.value;

    if (!authCookie || !['seller', 'admin'].includes(roleCookie || '')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // TODO: Reemplazar con eliminación real en la base de datos
    // await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: `Producto ${id} eliminado` }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 });
  }
}
