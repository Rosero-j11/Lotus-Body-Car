'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield, Star, MapPin, Package, Calendar } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface SellerProfile {
  id: string;
  name: string;
  location: string;
  reputation: number | null;
  verified: boolean;
  joinedDate: string;
}

interface SellerProduct {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  image: string;
  condition: string;
  category: string;
}

interface Rating {
  id: string;
  score: number;
  comment: string | null;
  date: string;
  buyerName: string;
}

export default function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [ratingsAvg, setRatingsAvg] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sellerRes, ratingsRes] = await Promise.all([
          fetch(`/api/seller/${id}/profile`),
          fetch(`/api/ratings/seller/${id}`),
        ]);

        if (sellerRes.ok) {
          const d = await sellerRes.json() as { seller: SellerProfile; products: SellerProduct[] };
          setSeller(d.seller);
          setProducts(d.products ?? []);
        }

        if (ratingsRes.ok) {
          const d = await ratingsRes.json() as { ratings: Rating[]; average: number | null };
          setRatings(d.ratings ?? []);
          setRatingsAvg(d.average ?? null);
        }
      } catch {
        // ignorar
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Vendedor no encontrado.</p>
        <button onClick={() => router.back()} className="text-red-600 hover:underline text-sm">Volver</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm hover:bg-gray-100 px-3 py-2 rounded transition mb-5"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        {/* Cabecera del vendedor */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-2xl font-bold">{seller.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{seller.name}</h1>
                {seller.verified && (
                  <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                    <Shield className="h-3 w-3" /> Verificado
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {/* Reputación */}
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {ratingsAvg !== null ? ratingsAvg.toFixed(1) : (seller.reputation?.toFixed(1) ?? '—')}
                  </span>
                  <span className="text-gray-400">({ratings.length} {ratings.length === 1 ? 'calificación' : 'calificaciones'})</span>
                </div>

                {seller.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{seller.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Desde {new Date(seller.joinedDate).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span>{products.length} {products.length === 1 ? 'producto' : 'productos'} activos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Productos del vendedor */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Productos en venta</h2>
            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-400 text-sm">
                Este vendedor no tiene productos activos.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((p) => (
                  <Link key={p.id} href={`/products/${p.id}`}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition group">
                    <div className="relative h-36 bg-gray-100">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.brand} · {p.model}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-red-600 font-bold text-sm">{formatPrice(p.price)}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{p.condition}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Calificaciones */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Calificaciones</h2>
            <div className="bg-white rounded-lg shadow-sm p-4">
              {/* Promedio con barras */}
              <div className="flex items-center gap-3 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {ratingsAvg !== null ? ratingsAvg.toFixed(1) : '—'}
                  </p>
                  <div className="flex gap-0.5 justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`h-3.5 w-3.5 ${ratingsAvg && n <= Math.round(ratingsAvg) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{ratings.length} reseñas</p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((n) => {
                    const count = ratings.filter((r) => r.score === n).length;
                    const pct = ratings.length > 0 ? (count / ratings.length) * 100 : 0;
                    return (
                      <div key={n} className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400 w-2">{n}</span>
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-3">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lista */}
              {ratings.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Sin calificaciones aún.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {ratings.map((r) => (
                    <div key={r.id} className="border-t pt-3 first:border-t-0 first:pt-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-800">{r.buyerName}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} className={`h-3 w-3 ${n <= r.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="text-xs text-gray-600">{r.comment}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(r.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
