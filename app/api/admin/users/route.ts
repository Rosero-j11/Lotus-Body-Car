import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/utils/supabase/admin';

// GET /api/admin/users — lista todos los usuarios
export async function GET(_req: NextRequest) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('usuario')
    .select('id, nombre, correo, rol, telefono, direccion, verificado, fecha_registro')
    .order('nombre', { ascending: true });

  if (error) {
    // Puede que verificado/fecha_registro no existan aún — fallback
    const { data: base, error: baseErr } = await admin
      .from('usuario')
      .select('id, nombre, correo, rol, telefono, direccion')
      .order('nombre', { ascending: true });

    if (baseErr) {
      return NextResponse.json({ error: baseErr.message }, { status: 500 });
    }

    return NextResponse.json({
      users: (base ?? []).map((u) => ({ ...u, verificado: true, fecha_registro: null })),
    });
  }

  return NextResponse.json({ users: data ?? [] });
}

// PATCH /api/admin/users — actualiza rol o estado de un usuario
export async function PATCH(req: NextRequest) {
  const admin = createAdminClient();

  const body = await req.json().catch(() => null);
  if (!body || !body.id) {
    return NextResponse.json({ error: 'Falta el id del usuario' }, { status: 400 });
  }

  const { id, rol, verificado } = body as { id: string; rol?: string; verificado?: boolean };

  const updatePayload: Record<string, unknown> = {};
  if (rol !== undefined) {
    const validRoles = ['buyer', 'seller', 'admin'];
    if (!validRoles.includes(rol)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
    }
    updatePayload.rol = rol;
  }
  if (verificado !== undefined) {
    updatePayload.verificado = verificado;
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
  }

  const { error } = await admin.from('usuario').update(updatePayload).eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
