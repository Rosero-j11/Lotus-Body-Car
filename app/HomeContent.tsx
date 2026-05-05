"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Search, Filter, X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { brands, categories, modelsByBrand } from "@/lib/data";
import { formatPrice, debounce } from "@/lib/utils";
import type { Producto } from "@/lib/types";

const conditions = ["Nuevo", "Usado", "Reacondicionado"];

interface ProductWithRelations extends Producto {
  detalle_producto?: Array<{
    descripcion: string;
    especificaciones: Record<string, string>;
    imagenes: string[];
  }>;
  usuario?: { id: string; nombre: string; direccion: string };
}

interface FilterPanelProps {
  selectedBrands: string[];
  selectedModel: string;
  selectedCategories: string[];
  selectedConditions: string[];
  availableModels: string[];
  toggleBrand: (brand: string) => void;
  toggleCategory: (cat: string) => void;
  toggleCondition: (cond: string) => void;
  setSelectedModel: (model: string) => void;
}

function FilterPanel({
  selectedBrands,
  selectedModel,
  selectedCategories,
  selectedConditions,
  availableModels,
  toggleBrand,
  toggleCategory,
  toggleCondition,
  setSelectedModel,
}: FilterPanelProps) {
  return (
    <div className="space-y-5">
      <div>
        <h5 className="font-semibold text-sm mb-2">Marca</h5>
        <div className="space-y-1.5">
          {brands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-gray-900"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-3.5 w-3.5"
              />
              {brand}
            </label>
          ))}
        </div>
      </div>

      {availableModels.length > 0 && (
        <div>
          <h5 className="font-semibold text-sm mb-2">Modelo</h5>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Todos los modelos</option>
            {availableModels.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <h5 className="font-semibold text-sm mb-2">Categoría</h5>
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-gray-900"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-3.5 w-3.5"
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h5 className="font-semibold text-sm mb-2">Estado</h5>
        <div className="space-y-1.5">
          {conditions.map((cond) => (
            <label
              key={cond}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-gray-900"
            >
              <input
                type="checkbox"
                checked={selectedConditions.includes(cond)}
                onChange={() => toggleCondition(cond)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-3.5 w-3.5"
              />
              {cond}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estado inicializado desde URL params (HU-012)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(
    searchParams.get("q") ?? "",
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") ?? "relevance");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get("brand") ? searchParams.get("brand")!.split(",") : [],
  );
  const [selectedModel, setSelectedModel] = useState(
    searchParams.get("model") ?? "",
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("cat") ? searchParams.get("cat")!.split(",") : [],
  );
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    searchParams.get("cond") ? searchParams.get("cond")!.split(",") : [],
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Modelos disponibles según marcas seleccionadas (HU-014)
  const availableModels =
    selectedBrands.length === 1
      ? (modelsByBrand[selectedBrands[0]] ?? [])
      : selectedBrands.length > 1
        ? selectedBrands.flatMap((b) => modelsByBrand[b] ?? [])
        : [];

  // Debounce del input de búsqueda (HU-011) — useRef para función estable sin warnings de hooks
  const debouncedSetQuery = useRef(
    debounce((val: string) => setDebouncedQuery(val), 300),
  ).current;

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    debouncedSetQuery(val);
  };

  // Sincronizar filtros en URL (HU-012)
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (sortBy !== "relevance") params.set("sort", sortBy);
    if (selectedBrands.length) params.set("brand", selectedBrands.join(","));
    if (selectedModel) params.set("model", selectedModel);
    if (selectedCategories.length)
      params.set("cat", selectedCategories.join(","));
    if (selectedConditions.length)
      params.set("cond", selectedConditions.join(","));
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }, [
    debouncedQuery,
    sortBy,
    selectedBrands,
    selectedModel,
    selectedCategories,
    selectedConditions,
    router,
  ]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => {
      const next = prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand];
      // Resetear modelo si la marca ya no está seleccionada
      if (!next.includes(brand) && selectedModel) setSelectedModel("");
      return next;
    });
  };
  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  const toggleCondition = (cond: string) =>
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond],
    );

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setSortBy("relevance");
    setSelectedBrands([]);
    setSelectedModel("");
    setSelectedCategories([]);
    setSelectedConditions([]);
  };

  // Chips de filtros activos (HU-012)
  const activeFilters: { label: string; onRemove: () => void }[] = [
    ...selectedBrands.map((b) => ({
      label: `Marca: ${b}`,
      onRemove: () => toggleBrand(b),
    })),
    ...(selectedModel
      ? [
          {
            label: `Modelo: ${selectedModel}`,
            onRemove: () => setSelectedModel(""),
          },
        ]
      : []),
    ...selectedCategories.map((c) => ({
      label: `Cat: ${c}`,
      onRemove: () => toggleCategory(c),
    })),
    ...selectedConditions.map((c) => ({
      label: c,
      onRemove: () => toggleCondition(c),
    })),
    ...(sortBy !== "relevance"
      ? [
          {
            label: `Orden: ${sortBy === "price-low" ? "↑ Precio" : sortBy === "price-high" ? "↓ Precio" : "Reciente"}`,
            onRemove: () => setSortBy("relevance"),
          },
        ]
      : []),
  ];

  const [products, setProducts] = useState<ProductWithRelations[]>([]);

  // Fetch products from Supabase API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    fetchProducts();
  }, []);

  // Filtrado y ordenamiento (HU-011, HU-014)
  const filteredProducts = products
    .filter((p) => {
      const q = debouncedQuery.toLowerCase();
      const matchesSearch =
        !q ||
        p.nombre?.toLowerCase().includes(q) ||
        p.marca?.toLowerCase().includes(q) ||
        p.modelo?.toLowerCase().includes(q) ||
        p.categoria?.toLowerCase().includes(q);
      const matchesBrand =
        !selectedBrands.length || selectedBrands.includes(p.marca);
      const matchesModel = !selectedModel || p.modelo === selectedModel;
      const matchesCat =
        !selectedCategories.length || selectedCategories.includes(p.categoria);
      const matchesCond =
        !selectedConditions.length ||
        selectedConditions.includes(p.condicion_pieza);
      return (
        matchesSearch &&
        matchesBrand &&
        matchesModel &&
        matchesCat &&
        matchesCond
      );
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.precio - b.precio;
      if (sortBy === "price-high") return b.precio - a.precio;
      if (sortBy === "date-new") {
        const dateA = a.fecha_fabricacion
          ? new Date(a.fecha_fabricacion).getTime()
          : 0;
        const dateB = b.fecha_fabricacion
          ? new Date(b.fecha_fabricacion).getTime()
          : 0;
        return dateB - dateA;
      }
      return 0;
    });

  const FilterPanel = () => (
    <div className="space-y-5">
      {/* Marca */}
      <div>
        <h5 className="font-semibold text-sm mb-2">Marca</h5>
        <div className="space-y-1.5">
          {brands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-gray-900"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-3.5 w-3.5"
              />
              {brand}
            </label>
          ))}
        </div>
      </div>

      {/* Modelo — dependiente de marca (HU-014) */}
      {availableModels.length > 0 && (
        <div>
          <h5 className="font-semibold text-sm mb-2">Modelo</h5>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Todos los modelos</option>
            {availableModels.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Categoría */}
      <div>
        <h5 className="font-semibold text-sm mb-2">Categoría</h5>
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-gray-900"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-3.5 w-3.5"
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      {/* Estado de la pieza */}
      <div>
        <h5 className="font-semibold text-sm mb-2">Estado</h5>
        <div className="space-y-1.5">
          {conditions.map((cond) => (
            <label
              key={cond}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-gray-900"
            >
              <input
                type="checkbox"
                checked={selectedConditions.includes(cond)}
                onChange={() => toggleCondition(cond)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-3.5 w-3.5"
              />
              {cond}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-red-900 text-white">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Encuentra las Mejores Piezas Automotrices de Alta Gama
            </h2>
            <p className="text-sm sm:text-base text-red-100 mb-4 sm:mb-6 px-4">
              Marketplace especializado en piezas premium para vehículos de lujo
            </p>

            {/* Barra de búsqueda principal */}
            <div className="bg-white rounded-lg p-1.5 sm:p-2 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 px-2 sm:px-3">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, marca, modelo..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setDebouncedQuery(searchQuery)
                  }
                  className="flex-1 border-0 focus:outline-none text-gray-900 text-sm sm:text-base px-1 py-2"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded w-full sm:w-auto text-sm sm:text-base font-medium transition">
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Chips de filtros activos (HU-012) */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 text-xs px-2.5 py-1 rounded-full"
              >
                {f.label}
                <button
                  onClick={f.onRemove}
                  className="hover:text-red-900 ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-2.5 py-1 rounded-full hover:bg-gray-50"
            >
              <RotateCcw className="h-3 w-3" />
              Restablecer filtros
            </button>
          </div>
        )}

        {/* Header de resultados */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold mb-1">
              Catálogo de Piezas
            </h3>
            <p className="text-sm text-gray-600">
              {filteredProducts.length} producto(s) encontrado(s)
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex-1 sm:flex-none border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {activeFilters.length > 0 && (
                <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-[200px] text-sm border border-gray-300 rounded px-3 py-2"
            >
              <option value="relevance">Relevancia</option>
              <option value="price-low">Precio: Menor a Mayor</option>
              <option value="price-high">Precio: Mayor a Menor</option>
              <option value="date-new">Más Reciente</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Sidebar filtros — desktop */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                </h4>
                {activeFilters.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Limpiar todo
                  </button>
                )}
              </div>
              <FilterPanel />
            </div>
          </div>

          {/* Grid de productos */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <SlidersHorizontal className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-1">
                  No se encontraron piezas con los criterios de búsqueda
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Intenta con otros términos o elimina algunos filtros
                </p>
                <button
                  onClick={clearFilters}
                  className="text-red-600 hover:underline text-sm font-medium"
                >
                  Volver al catálogo completo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                {filteredProducts.map((product) => {
                  const rawDetails = product.detalle_producto;
                  const details = Array.isArray(rawDetails)
                    ? rawDetails[0]
                    : rawDetails;
                  const seller = product.usuario;
                  const image =
                    details?.imagenes?.[0] ||
                    "https://images.unsplash.com/photo-1762139258224-236877b2c571?w=500";

                  return (
                    <div
                      key={product.id}
                      onClick={() => router.push(`/products/${product.id}`)}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                      <div className="aspect-square relative overflow-hidden bg-gray-100">
                        <Image
                          src={image}
                          alt={product.nombre}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                        <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded">
                          {product.condicion_pieza}
                        </span>
                      </div>
                      <div className="p-3 sm:p-4">
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded mb-2">
                          {product.categoria}
                        </span>
                        <h3 className="text-sm sm:text-base font-semibold mb-0.5 line-clamp-1">
                          {product.nombre}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          {product.marca} · {product.modelo}
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-red-600 mb-2">
                          {formatPrice(product.precio)}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="truncate max-w-[60%]">
                            {seller?.nombre || "Vendedor"}
                          </span>
                          <span>{seller?.direccion || "Colombia"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sheet de filtros — móvil */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl flex flex-col">
            <div className="px-4 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filtros</h3>
              <div className="flex gap-2">
                {activeFilters.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Limpiar
                  </button>
                )}
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <FilterPanel />
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-md text-sm font-medium"
              >
                Ver {filteredProducts.length} resultado(s)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-400">Cargando catálogo...</p>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
