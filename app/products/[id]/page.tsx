"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Share2,
  Package,
  Shield,
  Star,
  MapPin,
  ShoppingCart,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";
import { toastSuccess } from "@/lib/swal";
import Image from "next/image";

interface ProductDetail {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  condition: string;
  description: string;
  images: string[];
  sellerId: string;
  sellerInfo: {
    name: string;
    rating: number;
    reviews: number;
    verified: boolean;
  };
  location: string;
  category: string;
  stock: number;
  specifications: Record<string, string>;
  status: string;
  visitas: number;
}

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useUser();
  const { addItem } = useCart();

  // Carrusel (HU-015)
  const [activeImg, setActiveImg] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();

        if (data.product) {
          const dbProd = data.product;
          const rawDetail = dbProd.detalle_producto;
          const detail = Array.isArray(rawDetail) ? rawDetail[0] : rawDetail;
          const seller = dbProd.usuario;

          setProduct({
            id: dbProd.id,
            name: dbProd.nombre,
            brand: dbProd.marca,
            model: dbProd.modelo,
            price: dbProd.precio,
            condition: dbProd.condicion_pieza,
            description: detail?.descripcion ?? "Sin descripción disponible.",
            images: detail?.imagenes?.length
              ? detail.imagenes
              : [
                  "https://images.unsplash.com/photo-1762139258224-236877b2c571?w=500",
                ],
            sellerId: dbProd.id_vendedor ?? '',
            sellerInfo: {
              name: seller?.nombre ?? "Vendedor Anónimo",
              rating: seller?.reputacion ?? 4.5,
              reviews: 12,
              verified: seller?.verificado ?? false,
            },
            location: seller?.direccion ?? "Colombia",
            category: dbProd.categoria,
            stock: dbProd.stock ?? 1,
            specifications: (detail?.especificaciones ?? {}) as Record<
              string,
              string
            >,
            status: dbProd.estado_publicacion ?? "active",
            visitas: dbProd.visitas ?? 0,
          });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // Contador de vistas real en Supabase (fire-and-forget)
  useEffect(() => {
    if (!product) return;
    fetch(`/api/products/${product.id}/views`, { method: 'POST' }).catch(() => {});
  }, [product?.id]);

  const prevImage = () => {
    if (!product) return;
    setActiveImg(
      (i) => (i - 1 + product.images.length) % product.images.length,
    );
  };
  const nextImage = () => {
    if (!product) return;
    setActiveImg((i) => (i + 1) % product.images.length);
  };

  // Teclado para el zoom modal
  useEffect(() => {
    if (!isZoomed || !product) return;
    const total = product.images.length;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsZoomed(false);
      if (e.key === "ArrowLeft") setActiveImg((i) => (i - 1 + total) % total);
      if (e.key === "ArrowRight") setActiveImg((i) => (i + 1) % total);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isZoomed, product?.images?.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Cargando producto...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Producto no encontrado.
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      model: product.model,
      price: product.price,
      quantity,
      stock: product.stock,
      image: product.images[0],
      sellerId: product.sellerId,
      sellerName: product.sellerInfo.name,
    });
    toastSuccess(`¡${quantity} unidad(es) agregada(s) al carrito!`);
  };

  const isSold = product.status === "sold";
  const isReserved = product.status === "reserved";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded transition mb-3 sm:mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </button>

        {/* Banners de estado (HU-015) */}
        {isSold && (
          <div className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 mb-4 flex items-center gap-2 text-red-700 text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            Este producto ya fue vendido y no está disponible.
          </div>
        )}
        {isReserved && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-3 mb-4 flex items-center gap-2 text-yellow-700 text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            Este producto está reservado actualmente.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Carrusel de imágenes (HU-015) */}
          <div>
            <div className="relative overflow-hidden mb-3 bg-white rounded-lg shadow group">
              <div
                className="aspect-square relative bg-gray-100 cursor-zoom-in"
                onClick={() => setIsZoomed(true)}
              >
                <Image
                  src={product.images[activeImg]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                {/* Zoom hint overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/10">
                  <div className="bg-white/80 rounded-full p-2">
                    <ZoomIn className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
              </div>

              {/* Flechas del carrusel */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-1.5 transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-1.5 transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  {/* Indicadores */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {product.images.map((_: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`h-1.5 rounded-full transition-all ${i === activeImg ? "w-4 bg-red-600" : "w-1.5 bg-white/70"}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Contador de vistas */}
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Eye className="h-3 w-3" /> {(product.visitas ?? 0) + 1}
              </div>
            </div>

            {/* Miniaturas */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition ${i === activeImg ? "border-red-600" : "border-transparent hover:border-gray-300"}`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info del producto */}
          <div>
            <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
              <div className="flex-1 min-w-0">
                <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded mb-2">
                  {product.category}
                </span>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                  {product.name}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  {product.brand} • {product.model}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  className="h-9 w-9 sm:h-10 sm:w-10 border rounded-md hover:bg-gray-50 flex items-center justify-center"
                  aria-label="Favoritos"
                >
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
                <button
                  className="h-9 w-9 sm:h-10 sm:w-10 border rounded-md hover:bg-gray-50 flex items-center justify-center"
                  aria-label="Compartir"
                >
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            {/* Precio */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <p className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
                {formatPrice(product.price)}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{product.stock} disponibles</span>
                </div>
                <span className="px-2 py-1 bg-gray-100 rounded">
                  {product.condition}
                </span>
              </div>
            </div>

            {/* Info vendedor */}
            <div className="bg-white rounded-lg shadow mb-4 sm:mb-6 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm sm:text-base font-medium">
                      {product.sellerInfo.name}
                    </p>
                    {product.sellerInfo.verified && (
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{product.sellerInfo.rating}</span>
                    <span>•</span>
                    <span>{product.sellerInfo.reviews} reseñas</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{product.location}</span>
                  </div>
                </div>
                <Link
                  href={`/seller/${product.sellerId}`}
                  className="border rounded-md px-4 py-2 hover:bg-gray-50 text-xs sm:text-sm w-full sm:w-auto text-center"
                >
                  Ver perfil
                </Link>
              </div>
            </div>

            {/* Acciones: protegidas si no hay login (HU-015) */}
            {user && !isSold ? (
              <div className="space-y-3 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <label className="text-xs sm:text-sm font-medium">
                    Cantidad:
                  </label>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-gray-100 rounded-l-lg flex items-center justify-center"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 sm:px-4 py-2 min-w-[2.5rem] text-center text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock, q + 1))
                      }
                      className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-gray-100 rounded-r-lg flex items-center justify-center"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="border rounded-md px-4 py-2 hover:bg-gray-50 text-xs sm:text-sm flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Agregar al carrito</span>
                    <span className="sm:hidden">Al carrito</span>
                  </button>
                  <button
                    onClick={() => {
                      handleAddToCart();
                      router.push("/cart");
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-xs sm:text-sm"
                  >
                    Comprar ahora
                  </button>
                </div>
                <button className="w-full border rounded-md px-4 py-2 hover:bg-gray-50 text-xs sm:text-sm">
                  Contactar al vendedor
                </button>
              </div>
            ) : !user ? (
              /* Contacto protegido (HU-015) */
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 sm:mb-6">
                <p className="text-sm text-yellow-800 mb-3 font-medium">
                  Inicia sesión para contactar al vendedor y comprar este
                  producto
                </p>
                <Link
                  href="/login"
                  className="block w-full bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm text-center transition"
                >
                  Iniciar Sesión
                </Link>
              </div>
            ) : (
              <div className="bg-gray-50 border rounded-lg p-4 mb-4 text-sm text-gray-500 text-center">
                Este producto no está disponible para compra en este momento.
              </div>
            )}

            <div className="border-t my-4 sm:my-6" />

            {/* Descripción */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
                Descripción
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Especificaciones */}
            {Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
                  Especificaciones Técnicas
                </h3>
                <div className="bg-white rounded-lg shadow p-3 sm:p-4">
                  <dl className="space-y-2 sm:space-y-3">
                    {Object.entries(product.specifications).map(
                      ([key, value]: [string, string]) => (
                        <div
                          key={key}
                          className="flex flex-col sm:flex-row sm:justify-between py-2 border-b last:border-0 gap-1 sm:gap-0"
                        >
                          <dt className="text-xs sm:text-sm text-gray-600 font-medium">
                            {key}
                          </dt>
                          <dd className="text-xs sm:text-sm sm:text-right">
                            {String(value)}
                          </dd>
                        </div>
                      ),
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Zoom (HU-015) */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/30 rounded-full p-2 z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {product.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/20 hover:bg-white/30 rounded-full p-2 z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/20 hover:bg-white/30 rounded-full p-2 z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[activeImg]}
            alt={product.name}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {product.images.map((_: string, i: number) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImg(i);
                }}
                className={`h-2 rounded-full transition-all ${i === activeImg ? "w-6 bg-white" : "w-2 bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
