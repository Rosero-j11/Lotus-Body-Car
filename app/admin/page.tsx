'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  FileText,
  Package,
  Users,
  TrendingUp,
  Download,
  BarChart3,
  Shield,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { adminStats, mockPlatformUsers } from '@/lib/data';
import { formatPrice, formatDate } from '@/lib/utils';
import { toastInfo } from '@/lib/swal';

type Tab = 'reports' | 'sales' | 'products' | 'orders' | 'users';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>('reports');
  const [platformUsers, setPlatformUsers] = useState(mockPlatformUsers);
  const [userSearch, setUserSearch] = useState('');
  const [reportType, setReportType] = useState('sales');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [reportPeriod, setReportPeriod] = useState('monthly');

  const handleRoleChange = (userId: string, newRole: string) => {
    setPlatformUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, rol: newRole } : u))
    );
  };

  const handleToggleActive = (userId: string) => {
    setPlatformUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, verificado: !u.verificado } : u))
    );
  };

  const filteredUsers = platformUsers.filter((u) =>
    u.nombre.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.correo.toLowerCase().includes(userSearch.toLowerCase())
  );

  useEffect(() => {
    if (!isLoading && (!user || user.rol !== 'admin')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Cargando...</div>
      </div>
    );
  }

  if (!user || user.rol !== 'admin') return null;

  const maxSales = Math.max(...adminStats.monthlySales.map((s) => s.sales));

  const statusConfig: Record<string, string> = {
    Pagado: 'bg-green-100 text-green-700',
    Pendiente: 'bg-yellow-100 text-yellow-700',
    Enviado: 'bg-blue-100 text-blue-700',
  };

  const tabs = [
    { id: 'reports' as Tab, label: 'Reportes' },
    { id: 'sales' as Tab, label: 'Ventas' },
    { id: 'products' as Tab, label: 'Productos' },
    { id: 'orders' as Tab, label: 'Pedidos' },
    { id: 'users' as Tab, label: 'Usuarios' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Panel de Administración</h1>
            <p className="text-sm text-gray-600 mt-1">Gestión y reportes del sistema</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50"
          >
            Volver al inicio
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                +12%
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Ventas Totales</p>
            <p className="text-lg sm:text-2xl font-bold">{formatPrice(adminStats.totalSales)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                +8%
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Pedidos</p>
            <p className="text-lg sm:text-2xl font-bold">{adminStats.totalOrders}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Productos</p>
            <p className="text-lg sm:text-2xl font-bold">{adminStats.totalProducts}</p>
            <p className="text-xs text-gray-500">activos</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Usuarios</p>
            <p className="text-lg sm:text-2xl font-bold">{adminStats.totalUsers}</p>
            <p className="text-xs text-gray-500">registrados</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          {/* Tab Headers */}
          <div className="border-b border-gray-200 px-4 sm:px-6">
            <div className="flex gap-1 sm:gap-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 sm:py-4 px-2 sm:px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Reportes Tab */}
            {activeTab === 'reports' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Generador de Reportes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Reporte</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="sales">Ventas</option>
                      <option value="inventory">Inventario</option>
                      <option value="purchases">Compras</option>
                      <option value="customers">Clientes</option>
                      <option value="income">Ingresos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Período</label>
                    <select
                      value={reportPeriod}
                      onChange={(e) => setReportPeriod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                      <option value="month">Mensual</option>
                      <option value="quarterly">Trimestral</option>
                      <option value="annual">Anual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Formato</label>
                    <select
                      value={reportFormat}
                      onChange={(e) => setReportFormat(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() =>
                    toastInfo(`Generando reporte de ${reportType} (${reportPeriod}) en ${reportFormat.toUpperCase()}...`)
                  }
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md text-sm font-medium"
                >
                  <Download className="h-4 w-4" />
                  Generar y Descargar Reporte
                </button>
              </div>
            )}

            {/* Ventas Tab */}
            {activeTab === 'sales' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Ventas Mensuales</h2>
                  <div className="space-y-3">
                    {adminStats.monthlySales.map((month) => (
                      <div key={month.month} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-8">{month.month}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3">
                          <div
                            className="bg-red-600 h-3 rounded-full transition-all"
                            style={{ width: `${(month.sales / maxSales) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-28 text-right">
                          {formatPrice(month.sales)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4">Productos Más Vendidos</h2>
                  <div className="space-y-3">
                    {adminStats.topProducts.map((product, i) => (
                      <div
                        key={product.name}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="w-6 h-6 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sales} unidades vendidas</p>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          {formatPrice(product.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Productos Tab */}
            {activeTab === 'products' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Análisis de Productos</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold">{adminStats.totalProducts}</p>
                    <p className="text-sm text-gray-500">Total</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-700">142</p>
                    <p className="text-sm text-gray-500">Activos</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold">14</p>
                    <p className="text-sm text-gray-500">Vendidos</p>
                  </div>
                </div>
                <button className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md text-sm">
                  <BarChart3 className="h-4 w-4" />
                  Ver Reporte Detallado
                </button>
              </div>
            )}

            {/* Pedidos Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Pedidos Recientes</h2>
                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-medium text-gray-500">ID</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-500">Cliente</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-500">Producto</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-500">Monto</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-500">Estado</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-500">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {adminStats.recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-red-600">{order.id}</td>
                          <td className="py-3 px-4">{order.customer}</td>
                          <td className="py-3 px-4 text-gray-600">{order.product}</td>
                          <td className="py-3 px-4 font-medium">{formatPrice(order.amount)}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${statusConfig[order.status] || 'bg-gray-100 text-gray-700'}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500">{formatDate(order.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile Cards */}
                <div className="sm:hidden space-y-3">
                  {adminStats.recentOrders.map((order) => (
                    <div key={order.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-red-600">{order.id}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${statusConfig[order.status] || 'bg-gray-100 text-gray-700'}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm">{order.customer}</p>
                      <p className="text-xs text-gray-500 mb-1">{order.product}</p>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{formatPrice(order.amount)}</span>
                        <span className="text-xs text-gray-500">{formatDate(order.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Usuarios Tab — HU-007 */}
            {activeTab === 'users' && (
              <div>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Gestión de Usuarios</h2>
                  <input
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="overflow-x-auto hidden sm:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2 px-3 font-medium text-gray-600">Usuario</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600">Rol</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600">Estado</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600">Registro</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className={`hover:bg-gray-50 ${!u.verificado ? 'opacity-50' : ''}`}>
                          <td className="py-3 px-3">
                            <div>
                              <p className="font-medium">{u.nombre}</p>
                              <p className="text-xs text-gray-500">{u.correo}</p>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="relative inline-block">
                              <select
                                value={u.rol}
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                disabled={u.id === user?.id} // No puede cambiar su propio rol
                                className="border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-60"
                              >
                                <option value="buyer">Comprador</option>
                                <option value="seller">Vendedor</option>
                                <option value="admin">Administrador</option>
                              </select>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${u.verificado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {u.verificado ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-gray-500 text-xs">-</td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() => handleToggleActive(u.id)}
                              disabled={u.id === user?.id}
                              title={u.verificado ? 'Desactivar cuenta' : 'Activar cuenta'}
                              className={`p-1.5 rounded transition disabled:opacity-40 ${u.verificado ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'}`}
                            >
                              {u.verificado ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {filteredUsers.map((u) => (
                    <div key={u.id} className={`bg-gray-50 rounded-lg p-3 ${!u.verificado ? 'opacity-60' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm">{u.nombre}</p>
                          <p className="text-xs text-gray-500">{u.correo}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.verificado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {u.verificado ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <select
                          value={u.rol}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={u.id === user?.id}
                          className="border border-gray-200 rounded px-2 py-1 text-xs bg-white flex-1 focus:outline-none disabled:opacity-60"
                        >
                          <option value="buyer">Comprador</option>
                          <option value="seller">Vendedor</option>
                          <option value="admin">Administrador</option>
                        </select>
                        <button
                          onClick={() => handleToggleActive(u.id)}
                          disabled={u.id === user?.id}
                          className={`p-1.5 rounded border text-xs disabled:opacity-40 ${u.verificado ? 'border-red-200 text-red-600' : 'border-green-200 text-green-600'}`}
                        >
                          {u.verificado ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No se encontraron usuarios</p>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-4">
                  * Los cambios de rol se aplican de inmediato. No puedes modificar tu propio rol o cuenta.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
