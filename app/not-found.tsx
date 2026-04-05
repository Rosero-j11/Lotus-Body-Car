import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-red-600 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Página no encontrada
        </h1>
        <p className="text-gray-500 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <Home size={18} />
            Ir al inicio
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            <Search size={18} />
            Ver catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
