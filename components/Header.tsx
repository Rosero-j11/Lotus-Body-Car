'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ShoppingCart, LayoutDashboard, Plus, Settings, LogOut, UserCircle, Search, X, Clock, ChevronDown } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useCart } from '@/contexts/CartContext';

const SEARCH_HISTORY_KEY = 'lotus_search_history';
const MAX_HISTORY = 5;

function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) ?? '[]'); } catch { return []; }
}

function saveToHistory(term: string) {
  const trimmed = term.trim();
  if (!trimmed) return;
  const prev = getSearchHistory().filter((h) => h !== trimmed);
  const next = [trimmed, ...prev].slice(0, MAX_HISTORY);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
}

function clearHistory() {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
}

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

  // Búsqueda global (HU-013)
  const [searchInput, setSearchInput] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false); // móvil toggle
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setHistory(getSearchHistory()); }, []);

  // Cerrar dropdown al clicar fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (term: string) => {
    const q = (term ?? searchInput).trim();
    if (!q) return;
    saveToHistory(q);
    setHistory(getSearchHistory());
    setShowHistory(false);
    setSearchInput(q);
    setIsSearchOpen(false);
    router.push(`/?q=${encodeURIComponent(q)}`);
  };

  const handleHistoryClick = (term: string) => {
    setSearchInput(term);
    handleSearch(term);
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearHistory();
    setHistory([]);
  };

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
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg sm:text-xl lg:text-2xl font-bold">L</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                Lotus Body Car
              </h1>
              <p className="text-xs text-gray-500 hidden lg:block">Piezas Automotrices Premium</p>
            </div>
          </Link>

          {/* Global Search Bar — Desktop (HU-013) */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-md lg:max-w-xl relative mx-2">
            <div className="flex w-full items-center border border-gray-300 rounded-lg bg-gray-50 focus-within:bg-white focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-300 transition">
              <Search className="h-4 w-4 text-gray-400 ml-3 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchInput}
                placeholder="Buscar piezas, marcas, modelos..."
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => { setHistory(getSearchHistory()); setShowHistory(true); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchInput)}
                className="flex-1 px-2 py-2 text-sm bg-transparent border-0 focus:outline-none"
                autoComplete="off"
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="mr-1 p-1 text-gray-400 hover:text-gray-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={() => handleSearch(searchInput)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-r-lg text-sm font-medium transition">
                Buscar
              </button>
            </div>

            {/* Historial de búsquedas (HU-013) */}
            {showHistory && history.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                  <span className="text-xs text-gray-500 font-medium">Búsquedas recientes</span>
                  <button onClick={handleClearHistory} className="text-xs text-gray-400 hover:text-gray-600">Limpiar</button>
                </div>
                {history.map((term, i) => (
                  <button key={i} onMouseDown={() => handleHistoryClick(term)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-left">
                    <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    {term}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Toggle (HU-013) */}
            <button
              onClick={() => { setIsSearchOpen(!isSearchOpen); if (!isSearchOpen) setTimeout(() => inputRef.current?.focus(), 50); }}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
              aria-label="Buscar"
            >
              <Search className="h-4 w-4" />
            </button>

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
                            {roleLabels[user.role] || user.role}
                          </span>
                        </div>

                        {(user.role === 'seller' || user.role === 'admin') && (
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

                        {user.role === 'admin' && (
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

        {/* Mobile Search Bar expandible (HU-013) */}
        {isSearchOpen && (
          <div ref={searchRef} className="md:hidden mt-2 pb-1 relative">
            <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 focus-within:bg-white focus-within:border-red-400">
              <Search className="h-4 w-4 text-gray-400 ml-3 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchInput}
                placeholder="Buscar piezas..."
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => { setHistory(getSearchHistory()); setShowHistory(true); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchInput)}
                className="flex-1 px-2 py-2 text-sm bg-transparent border-0 focus:outline-none"
                autoComplete="off"
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="mr-1 p-1 text-gray-400">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={() => handleSearch(searchInput)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-r-lg text-sm font-medium">
                OK
              </button>
            </div>

            {showHistory && history.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                  <span className="text-xs text-gray-500 font-medium">Búsquedas recientes</span>
                  <button onClick={handleClearHistory} className="text-xs text-gray-400 hover:text-gray-600">Limpiar</button>
                </div>
                {history.map((term, i) => (
                  <button key={i} onMouseDown={() => handleHistoryClick(term)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-left">
                    <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    {term}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
