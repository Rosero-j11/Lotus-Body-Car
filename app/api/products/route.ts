import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { createAdminClient } from '@/app/utils/supabase/admin';
import { toUUID } from '@/lib/server-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const brand = searchParams.get('brand') || '';
    const category = searchParams.get('category') || '';
    const sellerEmail = searchParams.get('sellerEmail') || '';
    const sort = searchParams.get('sort') || 'relevance';

    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    let query = supabase.from('producto').select(`
      *,
      detalle_producto (
        *
      ),
      usuario:id_vendedor (
        id,
        nombre,
        direccion
      )
    `);

    if (search) {
      query = query.ilike('nombre', `%${search}%`);
    }
    if (brand) {
      query = query.eq('marca', brand);
    }
    if (category) {
      query = query.eq('categoria', category);
    }
    if (sellerEmail) {
      const { data: sellerData } = await adminSupabase
        .from('usuario')
        .select('id')
        .eq('correo', sellerEmail)
        .single();
      if (sellerData) {
        query = query.eq('id_vendedor', sellerData.id);
      } else {
        // El vendedor no existe en la BD, devolver lista vacía
        return NextResponse.json({ products: [] }, { status: 200 });
      }
    }

    if (sort === 'price-asc') {
      query = query.order('precio', { ascending: true });
    } else if (sort === 'price-desc') {
      query = query.order('precio', { ascending: false });
    }

    const { data: products, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ products }, { status: 200 });
  } catch (err: unknown) {
    let message = 'Error desconocido';
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'object' && err !== null) {
      const e = err as Record<string, unknown>;
      message = String(e.message || e.details || e.code || JSON.stringify(err));
    } else if (typeof err === 'string') {
      message = err;
    }
    console.error('[POST /api/products]', err);
    return NextResponse.json({ error: 'Error al crear producto', details: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('lotus_auth')?.value;
    const roleCookie = request.cookies.get('lotus_role')?.value;

    if (!authCookie || !['seller', 'admin'].includes(roleCookie || '')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      nombre, 
      marca, 
      modelo, 
      categoria, 
      condicion_pieza, 
      anio,
      precio, 
      stock,
      descripcion,
      imagenes
    } = body;

    if (!nombre || !marca || !categoria || !condicion_pieza || !anio || !precio) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    if (isNaN(Number(precio)) || Number(precio) <= 0) {
      return NextResponse.json({ error: 'Precio inválido' }, { status: 400 });
    }

    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const userEmail = request.cookies.get('lotus_email')?.value;
    const userName = decodeURIComponent(request.cookies.get('lotus_name')?.value || '');

    if (!userEmail) {
      return NextResponse.json({ error: 'No se pudo identificar al vendedor' }, { status: 401 });
    }

    // Buscar el UUID real del usuario en la tabla usuario de Supabase
    let { data: userData } = await adminSupabase
      .from('usuario')
      .select('id')
      .eq('correo', userEmail)
      .single();

    // Si no existe, crear el registro automáticamente (usuario demo / primer acceso)
    if (!userData) {
      const { data: newUser, error: insertError } = await adminSupabase
        .from('usuario')
        .insert([{
          nombre: userName || userEmail.split('@')[0],
          correo: userEmail,
          rol: roleCookie || 'seller',
          telefono: '',
          verificado: false,
        }])
        .select('id')
        .single();

      if (insertError || !newUser) {
        console.error('[POST /api/products] No se pudo crear el usuario en la BD:', insertError);
        return NextResponse.json({ error: 'No se pudo registrar el vendedor en la base de datos' }, { status: 500 });
      }
      userData = newUser;
    }

    const id_vendedor = userData.id;

    // 1. Insertar producto
    const { data: newProduct, error: productError } = await supabase.from('producto').insert([{
      id_vendedor,
      nombre,
      marca,
      modelo,
      anio: Number(anio),
      categoria,
      condicion_pieza,
      precio: Number(precio),
      stock: Number(stock) || 1,
      estado_publicacion: 'Activa'
    }]).select().single();

    if (productError) {
      throw productError;
    }

    // 2. Insertar detalle
    const { error: detailError } = await supabase.from('detalle_producto').insert([{
      id_producto: newProduct.id,
      descripcion: descripcion || '',
      imagenes: imagenes || [],
      especificaciones: {}
    }]);

    if (detailError) {
      // Intento de limpieza si falla el detalle
      await supabase.from('producto').delete().eq('id', newProduct.id);
      throw detailError;
    }

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as Record<string, unknown>).message)
          : String(err);
    return NextResponse.json({ error: 'Error al crear producto', details: message }, { status: 500 });
  }
}
