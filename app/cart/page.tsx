'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Minus, Plus } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { lotusConfirmDanger, toastInfo } from '@/lib/swal';
import Image from 'next/image';

export default function CartPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const { cartItems, removeItem, updateQuantity, clearCart, getSubtotal, getIVA, getTotal } =
    useCart();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleCheckout = async () => {
    await toastInfo('Redirigiendo a la pasarela de pago...');
    setTimeout(() => router.push('/payment/confirmation'), 1200);
  };

  const handleClearCart = async () => {
    const result = await lotusConfirmDanger(
      '¿Vaciar carrito?',
      'Se eliminarán todos los productos del carrito. Esta acción no se puede deshacer.',
      'Vaciar carrito',
      'Cancelar'
    );
    if (result.isConfirmed) clearCart();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl mb-4">Debes iniciar sesión para ver tu carrito</h2>
          <Link
            href="/login"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md inline-block"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded transition mb-3 sm:mb-4"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          Continuar comprando
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Carrito de Compras</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-gray-600 mb-4">Tu carrito está vacío</p>
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md text-xs sm:text-sm"
            >
              Explorar productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                    <h2 className="text-lg sm:text-xl font-bold">
                      Productos ({cartItems.length})
                    </h2>
                    <button
                      onClick={handleClearCart}
                      className="text-red-600 hover:bg-red-50 px-3 py-2 rounded text-xs sm:text-sm h-9 sm:h-10"
                    >
                      Vaciar carrito
                    </button>
                  </div>
                  <div className="border-t mb-3 sm:mb-4" />

                  <div className="space-y-3 sm:space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row gap-3 sm:gap-4 pb-3 sm:pb-4 border-b last:border-0"
                      >
                        <div className="relative w-full sm:w-20 h-40 sm:h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0 mr-2">
                              <h3 className="text-sm sm:text-base font-medium mb-1">
                                {item.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                {item.brand} • {item.model}
                              </p>
                              <p className="text-sm sm:text-base font-bold text-red-600">
                                {formatPrice(item.price)}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 rounded flex items-center justify-center"
                              aria-label="Eliminar producto"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-gray-100 disabled:opacity-50 rounded-l-lg flex items-center justify-center"
                                aria-label="Disminuir cantidad"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-2 sm:px-3 py-1 min-w-[2rem] sm:min-w-[2.5rem] text-center text-xs sm:text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-gray-100 disabled:opacity-50 rounded-r-lg flex items-center justify-center"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <p className="text-xs sm:text-sm text-gray-500">
                              Subtotal: {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-lg shadow lg:sticky lg:top-20">
                <div className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                    Resumen del Pedido
                  </h2>

                  <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                    <div className="flex justify-between text-sm sm:text-base text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(getSubtotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base text-gray-600">
                      <span>IVA (19%)</span>
                      <span>{formatPrice(getIVA())}</span>
                    </div>
                    <div className="border-t" />
                    <div className="flex justify-between text-base sm:text-lg font-bold">
                      <span>Total</span>
                      <span className="text-red-600">{formatPrice(getTotal())}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-md text-sm sm:text-base font-medium"
                  >
                    Proceder al Pago
                  </button>

                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg text-xs sm:text-sm text-green-700">
                    ✓ Compra segura con garantía
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
