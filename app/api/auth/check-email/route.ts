import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: user } = await supabase
      .from('usuario')
      .select('id')
      .eq('correo', email)
      .maybeSingle();

    if (!user) {
      return NextResponse.json({ error: 'No existe una cuenta con ese correo' }, { status: 404 });
    }

    return NextResponse.json({ found: true }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
