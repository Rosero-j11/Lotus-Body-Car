'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Download,
  Package,
  Calendar,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice, formatDateLong } from '@/lib/utils';
import { toastInfo } from '@/lib/swal';

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 900000 + 100000));
  return `LBC-${y}-${m}-${d}-${rand}`;
}

export default function PaymentConfirmationPage() {
  const router = useRouter();
  const { cartItems, getSubtotal, getIVA, getTotal, clearCart } = useCart();
  const success = true;

  const [orderData] = useState(() => ({
    items: [...cartItems],
    subtotal: getSubtotal(),
    iva: getIVA(),
    total: getTotal(),
    orderNumber: generateOrderNumber(),
    transactionId: `TXN-${Math.floor(Math.random() * 900000000 + 100000000)}`,
  }));

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-3xl">
        {/* Status Section */}
        <div className="text-center mb-6 sm:mb-8">
          {success ? (
            <>
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-green-700 mb-2">
                ¡Pago Exitoso!
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-3">
                Tu pago ha sido procesado correctamente. Recibirás un correo de confirmación.
              </p>
              <span className="inline-block bg-green-100 text-green-800 text-sm px-4 py-2 rounded-full font-medium">
                Orden: {orderData.orderNumber}
              </span>
            </>
          ) : (
            <>
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-red-700 mb-2">
                Pago Rechazado
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-3">
                No pudimos procesar tu pago. Por favor verifica tus datos e intenta nuevamente.
              </p>
              <span className="inline-block bg-red-100 text-red-800 text-sm px-4 py-2 rounded-full font-medium">
                Error: ERR-PAYMENT-DECLINED
              </span>
            </>
          )}
        </div>

        {success && (
          <>
            {/* Order Details */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold">Detalles del Pedido</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Fecha del Pedido</p>
                    <p className="text-sm font-medium">{formatDateLong(new Date())}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Método de Pago</p>
                    <p className="text-sm font-medium">Tarjeta de Crédito (Visa **** 4242)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Dirección de Envío</p>
                    <p className="text-sm font-medium">Calle 123 #45-67, Bogotá, Colombia</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {orderData.transactionId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Productos Comprados</h3>
                <div className="space-y-2">
                  {orderData.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.brand} {item.model ? `• ${item.model}` : ''} — ×{item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
              <h2 className="text-lg font-semibold mb-4">Resumen del Pago</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(orderData.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>IVA (19%)</span>
                  <span>{formatPrice(orderData.iva)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Costo de envío</span>
                  <span className="text-green-600">Gratis</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-base sm:text-lg">
                  <span>Total pagado</span>
                  <span className="text-red-600">{formatPrice(orderData.total)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                📦 Tu pedido será procesado en las próximas 24 horas. Tiempo estimado de entrega:{' '}
                <strong>3-5 días hábiles</strong>.
              </p>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 border border-gray-300 rounded-md py-3 text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la Tienda
          </Link>

          {success ? (
            <button
              onClick={() => toastInfo('Preparando descarga de factura electrónica...')}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-md py-3 text-sm font-medium flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar Factura
            </button>
          ) : (
            <button
              onClick={() => router.push('/cart')}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-md py-3 text-sm font-medium"
            >
              Intentar Nuevamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
