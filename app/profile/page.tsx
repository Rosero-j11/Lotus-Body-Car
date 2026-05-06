'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Camera, Save, LogOut, Trash2, Eye, EyeOff, AlertTriangle, Star } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toastSuccess, lotusConfirmDanger } from '@/lib/swal';

interface FieldErrors {
  name?: string;
  phone?: string;
  email?: string;
  emailPassword?: string;
  currentPasswordForDelete?: string;
}

interface SellerRating {
  id: string;
  score: number;
  comment: string | null;
  date: string;
  buyerName: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, updateUser, logout, deleteAccount } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Calificaciones recibidas (vendedores)
  const [ratings, setRatings] = useState<SellerRating[]>([]);
  const [ratingsAvg, setRatingsAvg] = useState<number | null>(null);
  const [ratingsLoading, setRatingsLoading] = useState(false);

  // Modal eliminar cuenta (HU-006)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, phone: user.phone ?? '', address: user.address ?? '' });
      setNewEmail(user.email);
      setAvatarPreview(user.avatar ?? null);
    }
  }, [user]);

  // Cargar calificaciones si es vendedor
  useEffect(() => {
    if (!user || user.rol !== 'seller') return;
    setRatingsLoading(true);
    fetch(`/api/ratings/seller/${user.id}`)
      .then((r) => r.json())
      .then((data: { ratings?: SellerRating[]; average?: number | null }) => {
        setRatings(data.ratings ?? []);
        setRatingsAvg(data.average ?? null);
      })
      .catch(() => {})
      .finally(() => setRatingsLoading(false));
  }, [user]);

  if (isLoading || !user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
    </div>
  );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // En producción: subir a Cloudinary/S3 y guardar URL (HU-004)
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    updateUser({ avatar: previewUrl });
  };

  const validateFields = (): boolean => {
    const errors: FieldErrors = {};
    if (!formData.name.trim()) errors.name = 'El nombre es obligatorio';
    if (formData.phone && !/^\+?[\d\s\-()]{7,15}$/.test(formData.phone)) {
      errors.phone = 'Número de contacto inválido';
    }
    // Si el email cambió, requiere contraseña actual (HU-004)
    if (newEmail !== user.email) {
      if (!emailPassword) errors.emailPassword = 'Debes confirmar tu contraseña para cambiar el correo';
      // Mock: contraseña válida para demo
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;

    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));

    const updates: Partial<typeof user> = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
    };
    if (newEmail !== user.email && emailPassword) {
      // En producción: verificar contraseña en backend
      updates.email = newEmail;
    }

    updateUser(updates);
    toastSuccess('Cambios guardados correctamente');
    setEmailPassword('');
    setIsSaving(false);
  };

  // HU-005: Cierre de sesión global
  const handleLogoutAll = async () => {
    const result = await lotusConfirmDanger(
      '¿Cerrar todas las sesiones?',
      'Se cerrará tu sesión en todos los dispositivos conectados.',
      'Cerrar todas las sesiones',
      'Cancelar'
    );
    if (!result.isConfirmed) return;
    logout(true);
    router.push('/login');
  };

  // HU-006: Eliminar cuenta
  const handleDeleteAccount = async () => {
    setDeleteError('');
    if (!deletePassword) {
      setDeleteError('Debes ingresar tu contraseña para confirmar');
      return;
    }
    // Mock: cualquier contraseña no vacía confirma en demo
    setIsDeleting(true);
    await new Promise((r) => setTimeout(r, 800));
    // En producción: POST /api/auth/delete con { password }
    // Backend hace soft delete + anonimización
    deleteAccount();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>

        {/* Avatar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-3xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition"
                title="Cambiar foto"
              >
                <Camera className="h-3.5 w-3.5 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded capitalize">
                {user.rol === 'buyer' ? 'Comprador' : user.rol === 'seller' ? 'Vendedor' : 'Administrador'}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Foto almacenada en Cloudinary/S3 (en producción)</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSave} className="bg-white rounded-lg shadow-sm p-6 mb-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Información personal</h2>

          {/* Nombre */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Nombre completo *</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => { setFormData((p) => ({ ...p, name: e.target.value })); setFieldErrors((p) => ({ ...p, name: undefined })); }}
                className={`w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.name ? 'border-red-400' : 'border-gray-300'}`}
              />
            </div>
            {fieldErrors.name && <p className="text-xs text-red-600">{fieldErrors.name}</p>}
          </div>

          {/* Correo */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => { setNewEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            {newEmail !== user.email && (
              <div className="space-y-1">
                <p className="text-xs text-amber-600">Para cambiar el correo debes confirmar tu contraseña actual</p>
                <div className="relative">
                  <input
                    type={showEmailPassword ? 'text' : 'password'}
                    placeholder="Contraseña actual"
                    value={emailPassword}
                    onChange={(e) => { setEmailPassword(e.target.value); setFieldErrors((p) => ({ ...p, emailPassword: undefined })); }}
                    className={`w-full pl-3 pr-10 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.emailPassword ? 'border-red-400' : 'border-gray-300'}`}
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowEmailPassword(!showEmailPassword)} className="absolute right-3 top-3 text-gray-400">
                    {showEmailPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.emailPassword && <p className="text-xs text-red-600">{fieldErrors.emailPassword}</p>}
              </div>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Número de contacto</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => { setFormData((p) => ({ ...p, phone: e.target.value })); setFieldErrors((p) => ({ ...p, phone: undefined })); }}
                placeholder="+57 300 000 0000"
                className={`w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.phone ? 'border-red-400' : 'border-gray-300'}`}
              />
            </div>
            {fieldErrors.phone && <p className="text-xs text-red-600">{fieldErrors.phone}</p>}
          </div>

          {/* Dirección */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Dirección / Ciudad</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                placeholder="Ej: Bogotá, Colombia"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <button type="submit" disabled={isSaving}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-md font-medium text-sm transition">
            <Save className="h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        {/* Calificaciones recibidas — solo vendedores */}
        {user.rol === 'seller' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <div className="flex items-center gap-2 border-b pb-3 mb-4">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-800">Mis Calificaciones</h2>
            </div>

            {/* Promedio */}
            <div className="flex items-center gap-4 mb-5">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">
                  {ratingsAvg !== null ? ratingsAvg.toFixed(1) : '—'}
                </p>
                <div className="flex gap-0.5 justify-center mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-4 w-4 ${ratingsAvg && n <= Math.round(ratingsAvg) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">{ratings.length} {ratings.length === 1 ? 'calificación' : 'calificaciones'}</p>
              </div>
              {/* Barras de distribución */}
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((n) => {
                  const count = ratings.filter((r) => r.score === n).length;
                  const pct = ratings.length > 0 ? (count / ratings.length) * 100 : 0;
                  return (
                    <div key={n} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-2">{n}</span>
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-4">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lista de calificaciones */}
            {ratingsLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500" />
              </div>
            ) : ratings.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Aún no has recibido calificaciones.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {ratings.map((r) => (
                  <div key={r.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">{r.buyerName}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={`h-3.5 w-3.5 ${n <= r.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(r.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HU-005: Cierre de sesión */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Sesión</h2>
          <p className="text-sm text-gray-600 mb-3">Cierra tu sesión solo en este dispositivo o en todos los dispositivos simultáneamente.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => { logout(); router.push('/login'); }}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
            <button onClick={handleLogoutAll}
              className="flex items-center gap-2 border border-amber-400 text-amber-700 px-4 py-2 rounded-md text-sm hover:bg-amber-50 transition">
              <LogOut className="h-4 w-4" />
              Cerrar sesión en todos los dispositivos
            </button>
          </div>
        </div>

        {/* HU-006: Eliminar cuenta */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-red-100">
          <h2 className="text-lg font-semibold text-red-700 border-b border-red-100 pb-2 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Zona de peligro
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Eliminar tu cuenta es una acción <strong>irreversible</strong>. Tus datos personales serán anonimizados y todas tus publicaciones serán desactivadas.
          </p>
          <button onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-md text-sm hover:bg-red-100 transition font-medium">
            <Trash2 className="h-4 w-4" />
            Eliminar mi cuenta
          </button>
        </div>
      </div>

      {/* Modal confirmación eliminar cuenta */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">¿Eliminar cuenta definitivamente?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Esta acción no se puede deshacer. Tus datos quedarán anonimizados y tus publicaciones serán desactivadas.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Confirma con tu contraseña</label>
              <div className="relative">
                <input
                  type={showDeletePassword ? 'text' : 'password'}
                  value={deletePassword}
                  onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }}
                  placeholder="Tu contraseña actual"
                  className={`w-full pl-3 pr-10 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${deleteError ? 'border-red-400' : 'border-gray-300'}`}
                />
                <button type="button" onClick={() => setShowDeletePassword(!showDeletePassword)} className="absolute right-3 top-3 text-gray-400">
                  {showDeletePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(''); }}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={handleDeleteAccount} disabled={isDeleting}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition">
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
