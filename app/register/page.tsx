'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { validatePassword, saveRegisteredUser } from '@/lib/utils';
import { mockRegisteredEmails } from '@/lib/data';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useUser();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'buyer' as 'buyer' | 'seller',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string; email?: string; phone?: string;
    password?: string; confirm?: string; terms?: string;
  }>({});

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined, confirm: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof fieldErrors = {};

    if (!formData.name.trim()) errs.name = 'El nombre es obligatorio';
    
    if (!formData.email.trim()) {
      errs.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(formData.email)) {
      errs.email = 'El correo no es válido';
    } else if (mockRegisteredEmails.has(formData.email.toLowerCase())) {
      errs.email = 'Este correo ya está registrado';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'El número de contacto es obligatorio';
    } else if (!/^[\d\s\+\-\(\)]{7,20}$/.test(formData.phone)) {
      errs.phone = 'El formato del teléfono no es válido';
    }

    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length) errs.password = passwordErrors[0];

    if (!formData.confirmPassword) {
      errs.confirm = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirm = 'Las contraseñas no coinciden';
    }

    if (!formData.acceptTerms) errs.terms = 'Debes aceptar los términos y condiciones';

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    // Mock registration - en producción llamar a /api/auth/register
    const newUser = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      rol: formData.role,
      phone: formData.phone,
      joinedDate: new Date().toISOString(),
    };

    saveRegisteredUser({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: formData.role,
      phone: formData.phone,
      joinedDate: newUser.joinedDate,
      password: formData.password,
    });
    login(newUser);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 flex items-center justify-center p-3 sm:p-4 py-16 sm:py-4">
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm text-white hover:bg-white/10 rounded transition h-9 sm:h-10"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Volver al inicio</span>
          <span className="sm:hidden">Volver</span>
        </Link>
      </div>

      <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-xl">
        <div className="p-4 sm:p-6 space-y-1">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
              <span className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold">L</span>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl text-center font-bold">Crear Cuenta</h2>
          <p className="text-center text-sm sm:text-base text-gray-600">
            Regístrate en Lotus Body Car para comenzar
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="name" className="block text-sm font-medium">Nombre Completo *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input id="name" type="text" placeholder="Juan Pérez"
                    value={formData.name} onChange={(e) => updateField('name', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    autoComplete="name" />
                </div>
                {fieldErrors.name && <p className="text-xs text-red-600">{fieldErrors.name}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="phone" className="block text-sm font-medium">Número de Contacto *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input id="phone" type="tel" placeholder="+57 300 123 4567"
                    value={formData.phone} onChange={(e) => updateField('phone', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    autoComplete="tel" />
                </div>
                {fieldErrors.phone && <p className="text-xs text-red-600">{fieldErrors.phone}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium">Correo Electrónico *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input id="email" type="email" placeholder="correo@ejemplo.com"
                  value={formData.email} onChange={(e) => updateField('email', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  autoComplete="email" />
              </div>
              {fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium">Contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  value={formData.password} onChange={(e) => updateField('password', e.target.value)}
                  className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" aria-label="Mostrar/ocultar contraseña">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password
                ? <p className="text-xs text-red-600">{fieldErrors.password}</p>
                : <p className="text-xs text-gray-500">Mínimo 8 caracteres, mayúsculas, números y caracteres especiales</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirmar Contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••"
                  value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.confirm ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  autoComplete="new-password" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" aria-label="Mostrar/ocultar confirmación">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.confirm && <p className="text-xs text-red-600">{fieldErrors.confirm}</p>}
            </div>

            {/* Tipo de Cuenta */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Tipo de Cuenta *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div
                  className={`flex items-center space-x-2 border rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-gray-50 ${
                    formData.role === 'buyer'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200'
                  }`}
                  onClick={() => updateField('role', 'buyer')}
                >
                  <input
                    type="radio"
                    id="buyer"
                    name="role"
                    value="buyer"
                    checked={formData.role === 'buyer'}
                    onChange={() => updateField('role', 'buyer')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="buyer" className="cursor-pointer flex-1">
                    <p className="text-sm sm:text-base font-medium">Comprador</p>
                    <p className="text-xs text-gray-500">Buscar y comprar piezas</p>
                  </label>
                </div>
                <div
                  className={`flex items-center space-x-2 border rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-gray-50 ${
                    formData.role === 'seller'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200'
                  }`}
                  onClick={() => updateField('role', 'seller')}
                >
                  <input
                    type="radio"
                    id="seller"
                    name="role"
                    value="seller"
                    checked={formData.role === 'seller'}
                    onChange={() => updateField('role', 'seller')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="seller" className="cursor-pointer flex-1">
                    <p className="text-sm sm:text-base font-medium">Vendedor</p>
                    <p className="text-xs text-gray-500">Vender piezas automotrices</p>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1">
            <div className="flex items-start gap-2 text-xs sm:text-sm">
              <input
                type="checkbox"
                id="terms"
                checked={formData.acceptTerms}
                onChange={(e) => updateField('acceptTerms', e.target.checked)}
                className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="terms" className="text-gray-600 cursor-pointer">
                Acepto los términos y condiciones y la política de privacidad de Lotus Body Car
              </label>
            </div>
            {fieldErrors.terms && <p className="text-xs text-red-600">{fieldErrors.terms}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-6">
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-md font-medium transition text-sm sm:text-base"
            >
              Crear Cuenta
            </button>
            <div className="text-center text-xs sm:text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-red-600 hover:underline">
                Inicia sesión aquí
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
