import { NextRequest, NextResponse } from 'next/server';
import { mockProducts } from '@/lib/data';

// GET /api/products — Lista de productos con filtros opcionales
// POST /api/products — Crear nuevo producto (solo vendedores)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const brand = searchParams.get('brand') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'relevance';

    // TODO: Reemplazar con consulta real a la base de datos
    // Ejemplo con Prisma:
    // const products = await prisma.product.findMany({
    //   where: {
    //     AND: [
    //       search ? { OR: [{ name: { contains: search } }, { description: { contains: search } }] } : {},
    //       brand ? { brand } : {},
    //       category ? { category } : {},
    //     ],
    //   },
    //   orderBy: sort === 'price-asc' ? { price: 'asc' } : sort === 'price-desc' ? { price: 'desc' } : {},
    // });

    let products = [...mockProducts];

    // Filtros sobre datos mock
    if (search) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.brand.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (brand) {
      products = products.filter((p) => p.brand === brand);
    }
    if (category) {
      products = products.filter((p) => p.category === category);
    }

    if (sort === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    }

    return NextResponse.json({ products }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación mediante cookie
    const authCookie = request.cookies.get('lotus_auth')?.value;
    const roleCookie = request.cookies.get('lotus_role')?.value;

    if (!authCookie || !['seller', 'admin'].includes(roleCookie || '')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, brand, model, category, condition, price, stock } = body;

    if (!name || !brand || !category || !condition || !price) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      return NextResponse.json({ error: 'Precio inválido' }, { status: 400 });
    }

    // TODO: Reemplazar con inserción real en la base de datos
    // También manejar upload de imágenes (ej. Cloudinary, S3, Vercel Blob)
    // const product = await prisma.product.create({ data: { name, description, brand, model, category, condition, price: Number(price), stock: Number(stock) || 1 } });

    const newProduct = {
      id: Date.now().toString(),
      name,
      description,
      brand,
      model,
      category,
      condition,
      price: Number(price),
      stock: Number(stock) || 1,
      images: [],
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}
