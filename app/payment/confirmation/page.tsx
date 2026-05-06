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
  Star,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { formatPrice, formatDateLong } from '@/lib/utils';

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 900000 + 100000));
  return `LBC-${y}-${m}-${d}-${rand}`;
}

async function downloadInvoicePDF(orderData: {
  items: { id: string; name: string; brand: string; model?: string; price: number; quantity: number }[];
  subtotal: number;
  iva: number;
  total: number;
  orderNumber: string;
  transactionId: string;
}, customerName: string, customerEmail: string) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = doc.internal.pageSize.getWidth();
  const red: [number, number, number] = [185, 28, 28];
  const dark: [number, number, number] = [17, 24, 39];
  const gray: [number, number, number] = [107, 114, 128];
  const lightGray: [number, number, number] = [243, 244, 246];
  const white: [number, number, number] = [255, 255, 255];

  // ── Encabezado rojo ──────────────────────────────────────────────
  doc.setFillColor(...red);
  doc.rect(0, 0, W, 42, 'F');

  // Nombre empresa
  doc.setTextColor(...white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('LOTUS BODY CAR', 14, 18);

  // Subtítulo
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Piezas Automotrices Premium', 14, 25);
  doc.text('NIT: 900.123.456-7 | contacto@lotusbodycar.com', 14, 31);
  doc.text('Bogotá, Colombia', 14, 37);

  // Etiqueta FACTURA
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA', W - 14, 22, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`No. ${orderData.orderNumber}`, W - 14, 30, { align: 'right' });

  // Banda decorativa inferior del header
  doc.setFillColor(153, 27, 27);
  doc.rect(0, 42, W, 3, 'F');

  // ── Datos del cliente y orden ─────────────────────────────────────
  let y = 55;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...dark);
  doc.text('DATOS DEL CLIENTE', 14, y);
  doc.text('INFORMACIÓN DE LA ORDEN', W / 2 + 5, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...gray);

  const dateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  const clientLines = [
    ['Cliente:', customerName || 'Cliente Lotus Body Car'],
    ['Correo:', customerEmail || '—'],
    ['Método de pago:', 'Tarjeta Crédito (Visa **** 4242)'],
  ];
  const orderLines = [
    ['Fecha:', dateStr],
    ['Orden:', orderData.orderNumber],
    ['Transacción:', orderData.transactionId],
  ];

  clientLines.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...dark);
    doc.text(label, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...gray);
    doc.text(value, 38, y);
    y += 6;
  });

  let y2 = 61;
  orderLines.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...dark);
    doc.text(label, W / 2 + 5, y2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...gray);
    doc.text(value, W / 2 + 30, y2);
    y2 += 6;
  });

  y = Math.max(y, y2) + 6;

  // ── Línea separadora ──────────────────────────────────────────────
  doc.setDrawColor(...red);
  doc.setLineWidth(0.5);
  doc.line(14, y, W - 14, y);
  y += 6;

  // ── Tabla de productos ────────────────────────────────────────────
  doc.setFillColor(...red);
  doc.rect(14, y, W - 28, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...white);
  doc.text('PRODUCTO', 17, y + 5.5);
  doc.text('MARCA / MODELO', 90, y + 5.5);
  doc.text('CANT.', 140, y + 5.5);
  doc.text('PRECIO UNIT.', 153, y + 5.5);
  doc.text('TOTAL', W - 17, y + 5.5, { align: 'right' });

  y += 10;

  orderData.items.forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(...lightGray);
      doc.rect(14, y - 2, W - 28, 8, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...dark);

    // Nombre del producto (truncado si es muy largo)
    const name = item.name.length > 28 ? item.name.substring(0, 27) + '…' : item.name;
    doc.text(name, 17, y + 4);
    doc.setTextColor(...gray);
    const modelText = `${item.brand}${item.model ? ` • ${item.model}` : ''}`;
    const modelTrunc = modelText.length > 22 ? modelText.substring(0, 21) + '…' : modelText;
    doc.text(modelTrunc, 90, y + 4);
    doc.setTextColor(...dark);
    doc.text(String(item.quantity), 143, y + 4);
    doc.text(formatPrice(item.price), 153, y + 4);
    doc.text(formatPrice(item.price * item.quantity), W - 17, y + 4, { align: 'right' });
    y += 9;
  });

  y += 4;

  // ── Línea separadora ──────────────────────────────────────────────
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(0.3);
  doc.line(14, y, W - 14, y);
  y += 6;

  // ── Totales ───────────────────────────────────────────────────────
  const colLabel = W - 70;
  const colValue = W - 14;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gray);
  doc.text('Subtotal:', colLabel, y);
  doc.text(formatPrice(orderData.subtotal), colValue, y, { align: 'right' });
  y += 7;

  doc.text('IVA (19%):', colLabel, y);
  doc.text(formatPrice(orderData.iva), colValue, y, { align: 'right' });
  y += 7;

  doc.text('Envío:', colLabel, y);
  doc.setTextColor(22, 163, 74);
  doc.text('GRATIS', colValue, y, { align: 'right' });
  y += 3;

  doc.setDrawColor(...red);
  doc.setLineWidth(0.5);
  doc.line(colLabel - 2, y, W - 14, y);
  y += 5;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...dark);
  doc.text('TOTAL PAGADO:', colLabel, y);
  doc.setTextColor(...red);
  doc.text(formatPrice(orderData.total), colValue, y, { align: 'right' });
  y += 12;

  // ── Sello de estado ───────────────────────────────────────────────
  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(1.2);
  doc.roundedRect(14, y, 55, 14, 2, 2, 'D');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text('✓ PAGADO', 41, y + 9, { align: 'center' });

  // ── Pie de página ─────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...red);
  doc.rect(0, pageH - 18, W, 18, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...white);
  doc.text('Lotus Body Car — Piezas Automotrices Premium', W / 2, pageH - 10, { align: 'center' });
  doc.text('Este documento es una factura electrónica válida como comprobante de compra.', W / 2, pageH - 5, { align: 'center' });

  doc.save(`Factura-${orderData.orderNumber}.pdf`);
}

export default function PaymentConfirmationPage() {
  const router = useRouter();
  const { user } = useUser();
  const { cartItems, getSubtotal, getIVA, getTotal, clearCart } = useCart();
  const success = true;

  type SellerRatingState = {
    score: number;
    comment: string;
    submitted: boolean;
    submitting: boolean;
    error: string | null;
  };

  type OrderData = {
    items: typeof cartItems;
    subtotal: number;
    iva: number;
    total: number;
    orderNumber: string;
    transactionId: string;
  };

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [sellerRatings, setSellerRatings] = useState<Record<string, SellerRatingState>>({});

  useEffect(() => {
    setOrderData({
      items: [...cartItems],
      subtotal: getSubtotal(),
      iva: getIVA(),
      total: getTotal(),
      orderNumber: generateOrderNumber(),
      transactionId: `TXN-${Math.floor(Math.random() * 900000000 + 100000000)}`,
    });

    // Inicializar estado de calificación por vendedor único
    const uniqueSellers: Record<string, string> = {};
    cartItems.forEach((item) => {
      if (item.sellerId && item.sellerName && !uniqueSellers[item.sellerId]) {
        uniqueSellers[item.sellerId] = item.sellerName;
      }
    });
    const initialRatings: Record<string, SellerRatingState> = {};
    Object.keys(uniqueSellers).forEach((sid) => {
      initialRatings[sid] = { score: 0, comment: '', submitted: false, submitting: false, error: null };
    });
    setSellerRatings(initialRatings);

    clearCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

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

            {/* Calificar vendedores */}
            {Object.keys(sellerRatings).length > 0 && (
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <h2 className="text-lg font-semibold">Califica a los Vendedores</h2>
                </div>
                <p className="text-sm text-gray-500 mb-5">Tu opinión ayuda a otros compradores. Puedes calificar ahora o hacerlo más tarde desde tu perfil.</p>
                <div className="space-y-6">
                  {orderData.items
                    .filter((item, idx, arr) => item.sellerId && arr.findIndex((i) => i.sellerId === item.sellerId) === idx)
                    .map((item) => {
                      const sid = item.sellerId!;
                      const rs = sellerRatings[sid];
                      if (!rs) return null;
                      return (
                        <div key={sid} className="border border-gray-100 rounded-lg p-4">
                          <p className="text-sm font-semibold text-gray-800 mb-3">{item.sellerName ?? 'Vendedor'}</p>
                          {rs.submitted ? (
                            <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                              <CheckCircle2 className="h-4 w-4" />
                              ¡Gracias por tu calificación!
                            </div>
                          ) : (
                            <>
                              {/* Estrellas */}
                              <div className="flex gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() => setSellerRatings((prev) => ({ ...prev, [sid]: { ...prev[sid], score: n } }))}
                                    className="focus:outline-none"
                                  >
                                    <Star
                                      className={`h-7 w-7 transition-colors ${n <= rs.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                    />
                                  </button>
                                ))}
                                <span className="ml-2 text-sm text-gray-500 self-center">
                                  {rs.score === 0 ? 'Sin calificar' : ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][rs.score]}
                                </span>
                              </div>
                              {/* Comentario */}
                              <textarea
                                rows={2}
                                maxLength={300}
                                placeholder="Comentario opcional..."
                                value={rs.comment}
                                onChange={(e) => setSellerRatings((prev) => ({ ...prev, [sid]: { ...prev[sid], comment: e.target.value } }))}
                                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-3"
                              />
                              {rs.error && <p className="text-xs text-red-600 mb-2">{rs.error}</p>}
                              <button
                                type="button"
                                disabled={rs.score === 0 || rs.submitting}
                                onClick={async () => {
                                  setSellerRatings((prev) => ({ ...prev, [sid]: { ...prev[sid], submitting: true, error: null } }));
                                  try {
                                    const res = await fetch('/api/ratings', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        sellerId: sid,
                                        score: rs.score,
                                        comment: rs.comment,
                                        orderId: orderData.orderNumber,
                                      }),
                                    });
                                    if (res.ok) {
                                      setSellerRatings((prev) => ({ ...prev, [sid]: { ...prev[sid], submitted: true, submitting: false } }));
                                    } else {
                                      const d = await res.json() as { error?: string };
                                      setSellerRatings((prev) => ({ ...prev, [sid]: { ...prev[sid], submitting: false, error: d.error ?? 'Error al enviar' } }));
                                    }
                                  } catch {
                                    setSellerRatings((prev) => ({ ...prev, [sid]: { ...prev[sid], submitting: false, error: 'Error de conexión' } }));
                                  }
                                }}
                                className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 text-gray-900 text-sm font-semibold px-4 py-2 rounded-md transition flex items-center gap-1.5"
                              >
                                <Star className="h-4 w-4 fill-gray-900" />
                                {rs.submitting ? 'Enviando...' : 'Enviar calificación'}
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
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
              onClick={() => downloadInvoicePDF(orderData, user?.name ?? '', user?.email ?? '')}
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
