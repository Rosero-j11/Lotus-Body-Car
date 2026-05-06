import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.RESET_TOKEN_SECRET || 'lotus-reset-secret';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Correo invÃ¡lido' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Generar JWT vÃ¡lido por 15 minutos â€” no requiere tabla extra en Supabase
    const token = jwt.sign(
      { email: normalizedEmail, type: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const resetLink = `${APP_URL}/reset-password?token=${token}`;
    const isDev = process.env.NODE_ENV === 'development';

    const htmlBody = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#b91c1c;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;">LOTUS BODY CAR</h1>
            <p style="margin:6px 0 0;color:#fca5a5;font-size:13px;">Piezas Automotrices Premium</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">Recupera tu contraseÃ±a</h2>
            <p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.6;">
              Recibimos una solicitud para restablecer la contraseÃ±a de <strong>${normalizedEmail}</strong>.
            </p>
            <p style="margin:0 0 28px;color:#374151;font-size:15px;line-height:1.6;">
              El enlace expira en <strong>15 minutos</strong>.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td style="background:#b91c1c;border-radius:8px;">
                  <a href="${resetLink}" style="display:block;padding:14px 36px;color:#fff;font-size:16px;font-weight:700;text-decoration:none;">
                    Cambiar contraseÃ±a
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;color:#6b7280;font-size:12px;">Si el botÃ³n no funciona, copia este enlace:</p>
            <p style="margin:0 0 28px;word-break:break-all;">
              <a href="${resetLink}" style="color:#b91c1c;font-size:12px;">${resetLink}</a>
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">Si no solicitaste este cambio, ignora este correo.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#1f2937;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">Â© 2026 Lotus Body Car â€” BogotÃ¡, Colombia</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    try {
      await transporter.sendMail({
        from: `"Lotus Body Car" <${process.env.GMAIL_USER}>`,
        to: normalizedEmail,
        subject: 'Recupera tu contraseÃ±a â€” Lotus Body Car',
        html: htmlBody,
      });
    } catch (mailErr) {
      console.error('[forgot-password] Gmail SMTP error:', mailErr);
      if (isDev) {
        return NextResponse.json({ success: true, devResetLink: resetLink });
      }
    }

    return NextResponse.json({
      success: true,
      ...(isDev && { devResetLink: resetLink }),
    });
  } catch (err) {
    console.error('[forgot-password]', err);
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}
