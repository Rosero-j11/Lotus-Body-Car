'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // TODO: Enviar error a servicio de logging (Sentry, Datadog, etc.)
    console.error('Error de aplicación:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Algo salió mal
        </h1>
        <p className="text-gray-500 mb-2">
          Ocurrió un error inesperado. Por favor intenta de nuevo.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6 font-mono">
            ID de error: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <RefreshCcw size={18} />
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            <Home size={18} />
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
