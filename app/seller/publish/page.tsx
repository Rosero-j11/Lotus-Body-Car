"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { brands, categories, modelsByBrand } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { lotusSuccess, lotusError } from "@/lib/swal";

interface FormData {
  name: string;
  description: string;
  brand: string;
  model: string;
  category: string;
  condition: "new" | "used" | "reconditioned";
  year: string;
  price: string;
  stock: string;
}

export default function PublishProductPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    brand: "",
    model: "",
    category: "",
    condition: "new",
    year: "",
    price: "",
    stock: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  const addSpec = () => setSpecs((prev) => [...prev, { key: '', value: '' }]);
  const removeSpec = (i: number) => setSpecs((prev) => prev.filter((_, idx) => idx !== i));
  const updateSpec = (i: number, field: 'key' | 'value', val: string) =>
    setSpecs((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  useEffect(() => {
    if (
      !isLoading &&
      (!user || (user.rol !== "seller" && user.rol !== "admin"))
    ) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Cargando...</div>
      </div>
    );
  }

  if (!user || (user.rol !== "seller" && user.rol !== "admin")) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
    </div>
  );

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Reset model when brand changes (HU-008)
      ...(field === "brand" ? { model: "" } : {}),
    }));
    setErrors([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    let loaded = 0;
    const base64Images: string[] = [];

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        loaded++;
        base64Images.push(reader.result as string);
        if (loaded === fileArray.length) {
          setImages((prev) => [...prev, ...base64Images].slice(0, 5));
        }
      };
      reader.onerror = () => {
        loaded++;
        if (loaded === fileArray.length) {
          setImages((prev) => [...prev, ...base64Images].slice(0, 5));
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset para permitir re-selección del mismo archivo
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: string[] = [];

    if (!formData.name) validationErrors.push("El nombre es obligatorio");
    if (!formData.description)
      validationErrors.push("La descripción es obligatoria");
    if (!formData.brand) validationErrors.push("La marca es obligatoria");
    if (!formData.model) validationErrors.push("El modelo es obligatorio");
    if (!formData.category)
      validationErrors.push("La categoría es obligatoria");
    if (
      !formData.year ||
      parseInt(formData.year) < 1900 ||
      parseInt(formData.year) > new Date().getFullYear() + 1
    )
      validationErrors.push(
        "El año debe ser válido (1900-" + (new Date().getFullYear() + 1) + ")",
      );
    if (!formData.price || parseFloat(formData.price) <= 0)
      validationErrors.push("El precio debe ser mayor a 0");
    if (!formData.stock || parseInt(formData.stock) <= 0)
      validationErrors.push("El stock debe ser mayor a 0");
    if (images.length === 0)
      validationErrors.push("Debes agregar al menos 1 fotografía");

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.name,
          descripcion: formData.description,
          marca: formData.brand,
          modelo: formData.model,
          categoria: formData.category,
          anio: parseInt(formData.year),
          condicion_pieza:
            formData.condition === "new"
              ? "Nuevo"
              : formData.condition === "reconditioned"
                ? "Reacondicionado"
                : "Usado",
          precio: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          imagenes:
            images.length > 0
              ? images
              : [
                  "https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?w=800",
                ],
          especificaciones: Object.fromEntries(
            specs
              .filter((s) => s.key.trim() && s.value.trim())
              .map((s) => [s.key.trim(), s.value.trim()])
          ),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "Error al publicar la pieza",
        );
      }

      await lotusSuccess(
        "¡Pieza publicada!",
        "Tu producto ya está visible en el catálogo.",
      );
      router.push("/seller/dashboard");
    } catch (err: unknown) {
      const isNetworkError = err instanceof TypeError && err.message.includes('fetch');
      await lotusError(
        'No se pudo publicar la pieza',
        isNetworkError
          ? 'Verifica tu conexión a internet e intenta de nuevo.'
          : 'Ocurrió un error inesperado. Por favor intenta de nuevo más tarde.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
        <button
          onClick={() => router.push("/seller/dashboard")}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded transition mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inventario
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
          Publicar Nueva Pieza
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-4 rounded-xl flex gap-3">
                  <span className="text-red-500 mt-0.5 flex-shrink-0 text-lg">
                    ⚠
                  </span>
                  <div>
                    <p className="font-semibold text-sm mb-1">
                      Corrige los siguientes errores:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {errors.map((err, i) => (
                        <li key={i} className="text-sm">
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-3">Fotografías</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Mínimo 1, máximo 5 fotografías. La primera será la imagen
                  principal.
                </p>
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`Foto ${i + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 h-6 w-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                        aria-label="Eliminar imagen"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {images.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-red-400 hover:bg-red-50 transition"
                    >
                      <Upload className="h-5 w-5 text-gray-400" />
                      <span className="text-xs text-gray-400 mt-1">
                        Agregar
                      </span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Product Info */}
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
                <h2 className="text-lg font-semibold">
                  Información del Producto
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre de la Pieza *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Motor V8 BMW M5"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Descripción *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Describe la pieza en detalle..."
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Marca *
                    </label>
                    <select
                      value={formData.brand}
                      onChange={(e) => updateField("brand", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Seleccionar marca</option>
                      {brands.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Modelo Compatible *
                    </label>
                    <select
                      value={formData.model}
                      onChange={(e) => updateField("model", e.target.value)}
                      disabled={!formData.brand}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {formData.brand
                          ? "Seleccionar modelo"
                          : "Primero elige una marca"}
                      </option>
                      {(modelsByBrand[formData.brand] ?? []).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Estado de la Pieza *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 ${
                        formData.condition === "new"
                          ? "border-red-600 bg-red-50"
                          : "border-gray-200"
                      }`}
                      onClick={() => updateField("condition", "new")}
                    >
                      <input
                        type="radio"
                        name="condition"
                        value="new"
                        checked={formData.condition === "new"}
                        onChange={() => updateField("condition", "new")}
                        className="text-red-600"
                      />
                      <div>
                        <p className="text-sm font-medium">Nuevo</p>
                        <p className="text-xs text-gray-500">
                          Sin usar, en su empaque original
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 ${
                        formData.condition === "used"
                          ? "border-red-600 bg-red-50"
                          : "border-gray-200"
                      }`}
                      onClick={() => updateField("condition", "used")}
                    >
                      <input
                        type="radio"
                        name="condition"
                        value="used"
                        checked={formData.condition === "used"}
                        onChange={() => updateField("condition", "used")}
                        className="text-red-600"
                      />
                      <div>
                        <p className="text-sm font-medium">Usado</p>
                        <p className="text-xs text-gray-500">
                          Previamente instalado
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 ${
                        formData.condition === "reconditioned"
                          ? "border-red-600 bg-red-50"
                          : "border-gray-200"
                      }`}
                      onClick={() => updateField("condition", "reconditioned")}
                    >
                      <input
                        type="radio"
                        name="condition"
                        value="reconditioned"
                        checked={formData.condition === "reconditioned"}
                        onChange={() =>
                          updateField("condition", "reconditioned")
                        }
                        className="text-red-600"
                      />
                      <div>
                        <p className="text-sm font-medium">Reacondicionado</p>
                        <p className="text-xs text-gray-500">
                          Restaurado y verificado
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Año *
                    </label>
                    <select
                      value={formData.year}
                      onChange={(e) => updateField("year", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Seleccionar año</option>
                      {Array.from(
                        { length: 30 },
                        (_, i) => new Date().getFullYear() - i,
                      ).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Precio (COP) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="15000000"
                      value={formData.price}
                      onChange={(e) => updateField("price", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Cantidad Disponible *
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={formData.stock}
                      onChange={(e) => updateField("stock", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Especificaciones Técnicas */}
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Especificaciones Técnicas</h2>
                  <button
                    type="button"
                    onClick={addSpec}
                    className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Añadir
                  </button>
                </div>
                <p className="text-xs text-gray-500 -mt-2">
                  Ej: Potencia → 450 HP, Peso → 12 kg, Material → Acero inoxidable
                </p>

                {specs.length === 0 && (
                  <p className="text-sm text-gray-400 italic text-center py-3 border border-dashed border-gray-200 rounded-md">
                    Sin especificaciones. Haz clic en &quot;Añadir&quot; para agregar.
                  </p>
                )}

                <div className="space-y-2">
                  {specs.map((spec, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Nombre (ej: Potencia)"
                        value={spec.key}
                        onChange={(e) => updateSpec(i, 'key', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <input
                        type="text"
                        placeholder="Valor (ej: 450 HP)"
                        value={spec.value}
                        onChange={(e) => updateSpec(i, 'value', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpec(i)}
                        className="p-2 text-gray-400 hover:text-red-600 transition"
                        aria-label="Eliminar especificación"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/seller/dashboard")}
                  className="flex-1 border border-gray-300 rounded-md py-3 text-sm hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-md py-3 text-sm font-medium"
                >
                  {isSubmitting ? "Publicando..." : "Publicar Pieza"}
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:sticky lg:top-20">
                <h2 className="text-lg font-semibold mb-4">Vista Previa</h2>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={images[0]}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <Upload className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">Sin imagen</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm line-clamp-1">
                      {formData.name || "Nombre del producto"}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {formData.brand || "Marca"} • {formData.model || "Modelo"}
                    </p>
                    <p className="text-red-600 font-bold">
                      {formData.price
                        ? formatPrice(parseFloat(formData.price))
                        : "$0"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
