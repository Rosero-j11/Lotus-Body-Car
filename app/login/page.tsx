'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import {
  isLoginBlocked,
  recordFailedAttempt,
  clearLoginAttempts,
  getLoginAttempts,
  findRegisteredUser,
} from '@/lib/utils';

function formatRemainingTime(ms: number): string {
  const minutes = Math.ceil(ms / 60000);
  return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
}

// Credenciales de demo — en producción reemplazar con /api/auth/login + DB
const VALID_CREDENTIALS = [
  { email: 'admin@lotusbodycar.com', password: 'Admin123!', role: 'admin' as const, name: 'Administrador LBC', id: 'u1' },
  { email: 'vendedor@lotusbodycar.com', password: 'Vend123!', role: 'seller' as const, name: 'Carlos Vendedor', id: 'u2' },
  { email: 'buyer@lotusbodycar.com', password: 'Buy123!', role: 'buyer' as const, name: 'María Compradora', id: 'u3' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedMsg, setBlockedMsg] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const check = () => {
      const blockStatus = isLoginBlocked();
      if (blockStatus.blocked) {
        setIsBlocked(true);
        setBlockedMsg(formatRemainingTime(blockStatus.remainingMs ?? 0));
      } else {
        setIsBlocked(false);
        const attempts = getLoginAttempts();
        setAttemptsLeft(Math.max(0, 3 - attempts.count));
      }
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const blockStatus = isLoginBlocked();
    if (blockStatus.blocked) {
      setIsBlocked(true);
      setBlockedMsg(formatRemainingTime(blockStatus.remainingMs ?? 0));
      return;
    }

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    const found = VALID_CREDENTIALS.find((c) => c.email === email && c.password === password);

    if (found) {
      clearLoginAttempts();
      login({ id: found.id, name: found.name, email: found.email, role: found.role, joinedDate: new Date().toISOString() });
      router.push('/');
    } else {
      // Buscar en usuarios registrados via localStorage
      const registeredUser = findRegisteredUser(email, password);
      if (registeredUser) {
        clearLoginAttempts();
        login({ id: registeredUser.id, name: registeredUser.name, email: registeredUser.email, role: registeredUser.role, joinedDate: registeredUser.joinedDate });
        router.push('/');
      } else {
        const updated = recordFailedAttempt();
        const remaining = 3 - updated.count;
        if (updated.blockedUntil && Date.now() < updated.blockedUntil) {
          setIsBlocked(true);
          setBlockedMsg(formatRemainingTime(updated.blockedUntil - Date.now()));
        } else {
          setAttemptsLeft(Math.max(0, remaining));
          setError(
            remaining > 0
              ? `Credenciales incorrectas. Te quedan ${remaining} intento${remaining !== 1 ? 's' : ''}.`
              : 'Credenciales incorrectas.'
          );
        }
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
        <Link href="/" className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm text-white hover:bg-white/10 rounded transition">
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Volver al inicio</span>
          <span className="sm:hidden">Volver</span>
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-xl">
        <div className="p-4 sm:p-6 space-y-1">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
              <span className="text-white text-3xl sm:text-4xl font-bold">L</span>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl text-center font-bold">Iniciar Sesión</h2>
          <p className="text-center text-sm text-gray-600">Ingresa a tu cuenta de Lotus Body Car</p>
        </div>

        {isBlocked && (
          <div className="mx-4 sm:mx-6 mb-2 bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
            <ShieldAlert className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-800">Acceso bloqueado temporalmente</p>
              <p className="text-xs text-orange-700 mt-1">Demasiados intentos fallidos. Intenta de nuevo en {blockedMsg}.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 p-4 sm:p-6 pt-2">
            {error && !isBlocked && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 items-start">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            {attemptsLeft < 3 && attemptsLeft > 0 && !isBlocked && (
              <p className="text-xs text-amber-600 text-center">
                {attemptsLeft} intento{attemptsLeft !== 1 ? 's' : ''} restante{attemptsLeft !== 1 ? 's' : ''} antes del bloqueo
              </p>
            )}

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="email" type="email" placeholder="correo@ejemplo.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  autoComplete="email" disabled={isBlocked}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  autoComplete="current-password" disabled={isBlocked}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded border-gray-300" />
                Recordarme
              </label>
              <Link href="/forgot-password" className="text-sm text-red-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Credenciales de demo */}
            <div className="bg-blue-50 border border-blue-100 rounded p-3 text-xs text-blue-700 space-y-1">
              <p className="font-semibold">Cuentas de prueba:</p>
              <p>Admin: admin@lotusbodycar.com / Admin123!</p>
              <p>Vendedor: vendedor@lotusbodycar.com / Vend123!</p>
              <p>Comprador: buyer@lotusbodycar.com / Buy123!</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 sm:p-6 pt-0">
            <button type="submit" disabled={isBlocked || isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-md font-medium transition text-sm">
              {isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
            <p className="text-center text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="text-red-600 hover:underline font-medium">Regístrate aquí</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
