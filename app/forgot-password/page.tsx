'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle2, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [devLink, setDevLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setApiError('');

    if (!email.trim()) {
      setEmailError('El correo es obligatorio');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Ingresa un correo valido');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar el correo');
      }

      if (data.devResetLink) setDevLink(data.devResetLink);
      setSent(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error inesperado. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6 text-center space-y-4">
          <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">Revisa tu correo</h2>
          <p className="text-sm text-gray-600">
            Si el correo <span className="font-medium">{email}</span> esta registrado,
            recibiras un enlace en los proximos minutos.
          </p>
          <p className="text-xs text-gray-500">El enlace expira en 15 minutos. Revisa spam.</p>

          {devLink && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
              <p className="text-xs font-semibold text-amber-800 mb-1">⚙️ Modo desarrollo — enlace generado:</p>
              <Link href={devLink} className="text-xs text-blue-600 underline break-all">
                {devLink}
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button onClick={() => { setSent(false); setEmail(''); }} className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <Send className="h-4 w-4" />Reenviar enlace
            </button>
            <Link href="/login" className="text-sm text-red-600 hover:underline font-medium">Volver al login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-white hover:bg-white/10 px-3 py-2 rounded transition">
          <ArrowLeft className="h-4 w-4" />
          Volver al login
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
              <Mail className="h-7 w-7 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Recuperar contraseña</h2>
          <p className="text-sm text-gray-500 mt-1">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm text-red-700">
              {apiError}
            </div>
          )}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); setApiError(''); }}
                className={`w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${emailError ? 'border-red-400' : 'border-gray-300'}`}
                autoComplete="email"
              />
            </div>
            {emailError && <p className="text-xs text-red-600">{emailError}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2.5 rounded-md font-medium text-sm transition"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
          <p className="text-center text-sm text-gray-500">
            ¿Recordaste tu contraseña?{' '}
            <Link href="/login" className="text-red-600 hover:underline font-medium">Iniciar sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
