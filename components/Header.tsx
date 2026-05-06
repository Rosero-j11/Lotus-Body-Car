'use client';

import Link from 'next/link';
import Image from 'next/image';
import logo from '@/app/icon.png';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ShoppingCart, LayoutDashboard, Plus, Settings, LogOut, UserCircle, ChevronDown } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useCart } from '@/contexts/CartContext';


const roleLabels: Record<string, string> = {
  buyer: 'Comprador',
  seller: 'Vendedor',
  admin: 'Administrador',
};

export default function Header() {
  const { user, logout } = useUser();
  const { itemCount } = useCart();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3 justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex-shrink-0 relative">
              <Image src={logo} alt="Lotus Body Car" fill className="object-contain" priority />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                Lotus Body Car
              </h1>
              <p className="text-xs text-gray-500 hidden lg:block">Piezas Automotrices Premium</p>
            </div>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {user ? (
              <>
                <Link href="/cart"
                  className="relative inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-md hover:bg-gray-100 transition"
                  aria-label="Carrito de compras">
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center bg-red-600 text-white text-xs rounded-full">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1.5 h-9 sm:h-10 px-2 sm:px-3 rounded-md hover:bg-gray-100 transition"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs sm:text-sm font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden lg:inline text-sm font-medium">{user.name}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-gray-500 hidden md:inline" />
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {roleLabels[user.rol] || user.rol}
                          </span>
                        </div>

                        {(user.rol === 'seller' || user.rol === 'admin') && (
                          <>
                            <Link href="/seller/dashboard" onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50">
                              <LayoutDashboard className="h-4 w-4" />
                              Mi Inventario
                            </Link>
                            <Link href="/seller/publish" onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50">
                              <Plus className="h-4 w-4" />
                              Publicar Pieza
                            </Link>
                          </>
                        )}

                        {user.rol === 'admin' && (
                          <>
                            <div className="border-t border-gray-200 my-1" />
                            <Link href="/admin" onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50">
                              <Settings className="h-4 w-4" />
                              Panel de Administración
                            </Link>
                          </>
                        )}

                        <div className="border-t border-gray-200 my-1" />
                        <Link href="/profile" onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50">
                          <UserCircle className="h-4 w-4" />
                          Mi Perfil
                        </Link>
                        <div className="border-t border-gray-200 my-1" />
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600">
                          <LogOut className="h-4 w-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login"
                  className="px-2 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 rounded-md transition">
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Entrar</span>
                </Link>
                <Link href="/register"
                  className="px-2 sm:px-4 py-2 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                  <span className="hidden sm:inline">Registrarse</span>
                  <span className="sm:hidden">Registro</span>
                </Link>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
