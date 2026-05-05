import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const roleCookie = request.cookies.get('lotus_role')?.value;
    if (!['seller', 'admin'].includes(roleCookie || '')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { base64, mimeType } = await request.json();

    if (!base64 || !mimeType) {
      return NextResponse.json({ error: 'Datos de imagen requeridos' }, { status: 400 });
    }

    // Decode base64 to buffer
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    const buffer = Buffer.from(base64Data, 'base64');

    // Limit file size to 5MB
    if (buffer.byteLength > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'La imagen no debe superar 5 MB' }, { status: 400 });
    }

    const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const supabase = await createClient();

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Error al subir imagen', details: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Error interno', details: message }, { status: 500 });
  }
}
