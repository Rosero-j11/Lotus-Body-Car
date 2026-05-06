'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { validatePassword, updateRegisteredUserPassword } from '@/lib/utils';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [tokenStatus, setTokenStatus] = useState<'checking' | 'valid' | 'invalid' | 'expired'>('checking');
  const [tokenEmail, setTokenEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenStatus('invalid');
      return;
    }
    // Validar token en el servidor
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data: { valid: boolean; email?: string; reason?: string }) => {
        if (data.valid && data.email) {
          setTokenStatus('valid');
          setTokenEmail(data.email);
        } else if (data.reason === 'expired') {
          setTokenStatus('expired');
        } else {
          setTokenStatus('invalid');
        }
      })
      .catch(() => setTokenStatus('invalid'));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { password?: string; confirm?: string } = {};

    const pwErrors = validatePassword(password);
    if (pwErrors.length > 0) errors.password = pwErrors[0];
    if (password !== confirmPassword) errors.confirm = 'Las contraseñas no coinciden';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json() as { success?: boolean; email?: string; error?: string };

      if (!res.ok) throw new Error(data.error || 'Error al actualizar');

      // Actualizar también en localStorage (para usuarios registrados localmente)
      if (data.email) {
        updateRegisteredUserPassword(data.email, password);
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setFieldErrors({ password: err instanceof Error ? err.message : 'Error inesperado' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Token inválido
  if (tokenStatus === 'invalid' || tokenStatus === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold">
            {tokenStatus === 'expired' ? 'Enlace caducado' : 'Enlace inválido'}
          </h2>
          <p className="text-sm text-gray-600">
            {tokenStatus === 'expired'
              ? 'Este enlace de recuperación ha expirado (máx. 15 minutos). Solicita uno nuevo.'
              : 'El enlace no es válido o ya fue utilizado.'}
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/forgot-password" className="w-full bg-red-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-red-700 transition text-center">
              Solicitar nuevo enlace
            </Link>
            <Link href="/login" className="text-sm text-gray-500 hover:underline">Volver al login</Link>
          </div>
        </div>
      </div>
    );
  }

  // Cambio exitoso
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900">¡Contraseña actualizada!</h2>
          <p className="text-sm text-gray-600">Tu contraseña fue cambiada exitosamente. Serás redirigido al login en unos segundos.</p>
          <Link href="/login" className="inline-block bg-red-600 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-red-700 transition">
            Ir al login ahora
          </Link>
        </div>
      </div>
    );
  }

  // Verificando token
  if (tokenStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Verificando enlace...</p>
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
              <Lock className="h-7 w-7 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold">Nueva contraseña</h2>
          {tokenEmail && <p className="text-sm text-gray-500 mt-1">Para la cuenta: <strong>{tokenEmail}</strong></p>}
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium">Nueva contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                placeholder="Mínimo 8 caracteres"
                className={`w-full pl-10 pr-10 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.password ? 'border-red-400' : 'border-gray-300'}`}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-xs text-red-600">{fieldErrors.password}</p>}
            <p className="text-xs text-gray-500">Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial</p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Confirmar contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirm: undefined })); }}
                placeholder="Repite la contraseña"
                className={`w-full pl-10 pr-10 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.confirm ? 'border-red-400' : 'border-gray-300'}`}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.confirm && <p className="text-xs text-red-600">{fieldErrors.confirm}</p>}
          </div>

          <button type="submit" disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2.5 rounded-md font-medium text-sm transition">
            {isSubmitting ? 'Guardando...' : 'Guardar nueva contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-900"><p className="text-white">Cargando...</p></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
