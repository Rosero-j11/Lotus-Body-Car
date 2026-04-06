'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, Package, DollarSign, ShoppingBag, Eye, Edit, Trash2,
  Archive, History, ChevronLeft, ChevronRight, X, Save,
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { mockSellerProducts } from '@/lib/data';
import { formatPrice, formatDate } from '@/lib/utils';
import { lotusWarning, lotusConfirmDanger, toastSuccess } from '@/lib/swal';
import Image from 'next/image';
import { SellerProduct, ProductHistory } from '@/lib/types';

const ITEMS_PER_PAGE = 6;

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [products, setProducts] = useState<SellerProduct[]>(
    mockSellerProducts.map((p) => ({ ...p, history: [], views: Math.floor(Math.random() * 200) }))
  );
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal historial
  const [historyModal, setHistoryModal] = useState<{ open: boolean; product: SellerProduct | null }>({ open: false, product: null });

  // Modal editar
  const [editModal, setEditModal] = useState<{ open: boolean; product: SellerProduct | null }>({ open: false, product: null });
  const [editForm, setEditForm] = useState({ description: '', price: '', stock: '', condition: '' });

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'seller' && user.role !== 'admin'))) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-pulse text-gray-400">Cargando...</div></div>;
  if (!user || (user.role !== 'seller' && user.role !== 'admin')) return null;

  const statusConfig: Record<string, { label: string; className: string }> = {
    available: { label: 'Disponible', className: 'bg-green-100 text-green-800' },
    reserved: { label: 'Reservado', className: 'bg-yellow-100 text-yellow-800' },
    sold: { label: 'Vendido', className: 'bg-gray-100 text-gray-800' },
    archived: { label: 'Archivado', className: 'bg-purple-100 text-purple-700' },
  };

  // Filtrado y ordenamiento
  const filtered = products
    .filter((p) => filterStatus === 'all' || p.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'date-asc') return a.publishDate.localeCompare(b.publishDate);
      return b.publishDate.localeCompare(a.publishDate); // date-desc default
    });

  // Paginación (HU-010)
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const soldCount = products.filter((p) => p.status === 'sold').length;
  const availableCount = products.filter((p) => p.status === 'available').length;

  const addHistory = (id: string, action: ProductHistory['action'], description: string) => {
    const entry: ProductHistory = {
      id: Date.now().toString(),
      action,
      description,
      date: new Date().toISOString(),
      author: user.name,
    };
    setProducts((prev) =>
      prev.map((p) => p.id === id ? { ...p, history: [entry, ...(p.history ?? [])] } : p)
    );
  };

  const updateStatus = (id: string, newStatus: SellerProduct['status']) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, status: newStatus } : p));
    addHistory(id, 'status_changed', `Estado cambiado de "${statusConfig[product.status].label}" a "${statusConfig[newStatus].label}"`);
  };

  const handleDelete = async (product: SellerProduct) => {
    if (product.status === 'sold') {
      await lotusWarning(
        'No se puede eliminar',
        'Las piezas vendidas no pueden eliminarse. Solo puedes archivarlas.'
      );
      return;
    }
    const result = await lotusConfirmDanger(
      `\u00bfEliminar "${product.name}"?`,
      'Esta acci\u00f3n no se puede deshacer.',
      'Eliminar pieza',
      'Cancelar'
    );
    if (!result.isConfirmed) return;
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    toastSuccess('Pieza eliminada correctamente');
  };

  const handleArchive = (id: string) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, status: 'archived' } : p));
    addHistory(id, 'archived', 'Pieza archivada');
    toastSuccess('Pieza archivada correctamente');
  };

  const openEdit = (product: SellerProduct) => {
    setEditForm({ description: '', price: product.price.toString(), stock: product.stock.toString(), condition: product.condition });
    setEditModal({ open: true, product });
  };

  const handleSaveEdit = () => {
    if (!editModal.product) return;
    const id = editModal.product.id;
    const changes: Partial<SellerProduct> = {};
    const changesDesc: string[] = [];

    if (editForm.price && Number(editForm.price) !== editModal.product.price) {
      changes.price = Number(editForm.price);
      changesDesc.push(`precio cambiado a ${formatPrice(Number(editForm.price))}`);
    }
    if (editForm.stock && Number(editForm.stock) !== editModal.product.stock) {
      changes.stock = Number(editForm.stock);
      changesDesc.push(`stock cambiado a ${editForm.stock}`);
    }
    if (editForm.condition && editForm.condition !== editModal.product.condition) {
      changes.condition = editForm.condition;
      changesDesc.push(`condición cambiada a ${editForm.condition}`);
    }

    if (Object.keys(changes).length > 0) {
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, ...changes } : p));
      addHistory(id, 'edited', changesDesc.join(', '));
      toastSuccess('Cambios guardados correctamente');
    }
    setEditModal({ open: false, product: null });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Mi Inventario</h1>
            <p className="text-sm text-gray-600 mt-1">Gestiona tus piezas publicadas</p>
          </div>
          <Link href="/seller/publish" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            <Plus className="h-4 w-4" />
            Publicar Pieza
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total</p>
              <p className="text-xl sm:text-2xl font-bold">{products.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Valor Total</p>
              <p className="text-base sm:text-xl font-bold">{formatPrice(totalValue)}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Vendidas</p>
              <p className="text-xl sm:text-2xl font-bold">{soldCount}</p>
            </div>
          </div>
        </div>

        {/* Filtros y orden */}
        <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Estado:</label>
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm">
              <option value="all">Todos ({products.length})</option>
              <option value="available">Disponible ({availableCount})</option>
              <option value="reserved">Reservado ({products.filter((p) => p.status === 'reserved').length})</option>
              <option value="sold">Vendido ({soldCount})</option>
              <option value="archived">Archivado ({products.filter((p) => p.status === 'archived').length})</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Ordenar:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm">
              <option value="date-desc">Más reciente</option>
              <option value="date-asc">Más antiguo</option>
              <option value="price-asc">Precio menor a mayor</option>
              <option value="price-desc">Precio mayor a menor</option>
            </select>
          </div>
          <span className="text-sm text-gray-500 ml-auto">{filtered.length} resultado(s)</span>
        </div>

        {/* Vacío */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">No tienes piezas en esta categoría</p>
            <Link href="/seller/publish" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              <Plus className="h-4 w-4" />
              Publicar tu primera pieza
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vistas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Publicado</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginated.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="48px" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.brand} {product.model}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-red-600">{formatPrice(product.price)}</td>
                      <td className="px-4 py-4 text-sm">{product.stock}</td>
                      <td className="px-4 py-4">
                        <select
                          value={product.status}
                          onChange={(e) => updateStatus(product.id, e.target.value as SellerProduct['status'])}
                          className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${statusConfig[product.status]?.className}`}
                        >
                          <option value="available">Disponible</option>
                          <option value="reserved">Reservado</option>
                          <option value="sold">Vendido</option>
                          <option value="archived">Archivado</option>
                        </select>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">{product.views ?? 0}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatDate(product.publishDate)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => router.push(`/products/${product.id}`)} className="p-1.5 hover:bg-gray-100 rounded" title="Ver">
                            <Eye className="h-4 w-4 text-gray-500" />
                          </button>
                          <button onClick={() => openEdit(product)} className="p-1.5 hover:bg-blue-50 rounded" title="Editar">
                            <Edit className="h-4 w-4 text-blue-600" />
                          </button>
                          <button onClick={() => setHistoryModal({ open: true, product })} className="p-1.5 hover:bg-purple-50 rounded" title="Historial">
                            <History className="h-4 w-4 text-purple-600" />
                          </button>
                          {product.status === 'sold' ? (
                            <button onClick={() => handleArchive(product.id)} className="p-1.5 hover:bg-purple-50 rounded" title="Archivar (vendida)">
                              <Archive className="h-4 w-4 text-purple-600" />
                            </button>
                          ) : (
                            <button onClick={() => handleDelete(product)} className="p-1.5 hover:bg-red-50 rounded" title="Eliminar">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {paginated.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex gap-3 mb-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image src={product.image} alt={product.name} fill className="object-cover" sizes="64px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.brand} {product.model}</p>
                      <p className="text-sm font-bold text-red-600 mt-0.5">{formatPrice(product.price)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <select value={product.status} onChange={(e) => updateStatus(product.id, e.target.value as SellerProduct['status'])}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 ${statusConfig[product.status]?.className}`}>
                      <option value="available">Disponible</option>
                      <option value="reserved">Reservado</option>
                      <option value="sold">Vendido</option>
                      <option value="archived">Archivado</option>
                    </select>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(product)} className="p-1.5 hover:bg-blue-50 rounded border border-gray-200"><Edit className="h-4 w-4 text-blue-600" /></button>
                      <button onClick={() => setHistoryModal({ open: true, product })} className="p-1.5 hover:bg-purple-50 rounded border border-gray-200"><History className="h-4 w-4 text-purple-600" /></button>
                      {product.status === 'sold'
                        ? <button onClick={() => handleArchive(product.id)} className="p-1.5 hover:bg-purple-50 rounded border border-gray-200"><Archive className="h-4 w-4 text-purple-600" /></button>
                        : <button onClick={() => handleDelete(product)} className="p-1.5 hover:bg-red-50 rounded border border-gray-200"><Trash2 className="h-4 w-4 text-red-500" /></button>
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-2 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded border text-sm font-medium transition ${currentPage === page ? 'bg-red-600 text-white border-red-600' : 'border-gray-300 hover:bg-gray-50'}`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-2 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Historial */}
      {historyModal.open && historyModal.product && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Historial — {historyModal.product.name}</h3>
              <button onClick={() => setHistoryModal({ open: false, product: null })} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3 flex-1">
              {(historyModal.product.history?.length ?? 0) === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Sin cambios registrados aún</p>
              ) : (
                historyModal.product.history?.map((entry) => (
                  <div key={entry.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-800">{entry.description}</p>
                      <p className="text-xs text-gray-400">{new Date(entry.date).toLocaleString('es-CO')} · {entry.author}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {editModal.open && editModal.product && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Editar — {editModal.product.name}</h3>
              <button onClick={() => setEditModal({ open: false, product: null })} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium">Precio (COP)</label>
                <input type="number" value={editForm.price} onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium">Stock disponible</label>
                <input type="number" min="0" value={editForm.stock} onChange={(e) => setEditForm((p) => ({ ...p, stock: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium">Estado de la pieza</label>
                <select value={editForm.condition} onChange={(e) => setEditForm((p) => ({ ...p, condition: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="Nuevo">Nuevo</option>
                  <option value="Usado">Usado</option>
                  <option value="Reacondicionado">Reacondicionado</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t">
              <button onClick={() => setEditModal({ open: false, product: null })} className="flex-1 border border-gray-300 rounded-md py-2 text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSaveEdit} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-md py-2 text-sm font-medium flex items-center justify-center gap-2">
                <Save className="h-4 w-4" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
