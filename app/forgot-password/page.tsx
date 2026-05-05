'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail } from 'lucide-react';
import { generateResetToken, saveResetToken } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!email.trim()) {
      setEmailError('El correo es obligatorio');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Ingresa un correo válido');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setEmailError(data.error || 'Correo no encontrado');
        return;
      }

      const token = generateResetToken();
      saveResetToken(email, token);
      router.push(`/reset-password?token=${token}`);
    } catch {
      setEmailError('Error de conexión al servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Ingresa tu correo registrado para restablecer tu contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
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
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
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
            {isSubmitting ? 'Verificando...' : 'Restablecer contraseña'}
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
