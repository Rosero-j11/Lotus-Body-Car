"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  Loader2,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { formatPrice, formatDate } from "@/lib/utils";
import { toastError } from "@/lib/swal";
import { Save, RotateCcw } from "lucide-react";

type Tab = "reports" | "sales" | "products" | "orders" | "users";

interface MonthlySale {
  month: string;
  year: number;
  key: string;
  sales: number;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: string;
  date: string;
}

interface AdminStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  monthlySales: MonthlySale[];
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
}

interface PlatformUser {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  telefono?: string;
  direccion?: string;
  verificado: boolean;
  fecha_registro?: string | null;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("reports");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([]);
  const [originalUsers, setOriginalUsers] = useState<PlatformUser[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Record<string, Partial<PlatformUser>>>({});
  const [saving, setSaving] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const [reportType, setReportType] = useState("sales");
  const [reportFormat, setReportFormat] = useState("pdf");
  const [reportPeriod, setReportPeriod] = useState("monthly");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user || user.rol !== "admin") return;
    setStatsLoading(true);
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => toastError("No se pudieron cargar las estadisticas"))
      .finally(() => setStatsLoading(false));
  }, [user]);

  const loadUsers = useCallback(() => {
    setUsersLoading(true);
    setPendingChanges({});
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        const users = data.users ?? [];
        setPlatformUsers(users);
        setOriginalUsers(users);
      })
      .catch(() => toastError("No se pudieron cargar los usuarios"))
      .finally(() => setUsersLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "users" && platformUsers.length === 0 && !usersLoading) {
      loadUsers();
    }
  }, [activeTab, platformUsers.length, usersLoading, loadUsers]);

  useEffect(() => {
    if (!isLoading && (!user || user.rol !== "admin")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleRoleChange = (userId: string, newRole: string) => {
    if (userId === user?.id) return;
    setPlatformUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, rol: newRole } : u))
    );
    const orig = originalUsers.find((u) => u.id === userId);
    setPendingChanges((prev) => {
      const current = { ...prev[userId] };
      if (orig && orig.rol === newRole) {
        delete current.rol;
      } else {
        current.rol = newRole;
      }
      if (Object.keys(current).length === 0) {
        const next = { ...prev };
        delete next[userId];
        return next;
      }
      return { ...prev, [userId]: current };
    });
  };

  const handleToggleActive = (userId: string) => {
    if (userId === user?.id) return;
    const target = platformUsers.find((u) => u.id === userId);
    if (!target) return;
    const newVal = !target.verificado;
    setPlatformUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, verificado: newVal } : u))
    );
    const orig = originalUsers.find((u) => u.id === userId);
    setPendingChanges((prev) => {
      const current = { ...prev[userId] };
      if (orig && orig.verificado === newVal) {
        delete current.verificado;
      } else {
        current.verificado = newVal;
      }
      if (Object.keys(current).length === 0) {
        const next = { ...prev };
        delete next[userId];
        return next;
      }
      return { ...prev, [userId]: current };
    });
  };

  const handleDiscardChanges = () => {
    setPlatformUsers(originalUsers);
    setPendingChanges({});
  };

  const handleSaveChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) return;
    setSaving(true);
    try {
      const results = await Promise.all(
        Object.entries(pendingChanges).map(([id, changes]) =>
          fetch("/api/admin/users", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...changes }),
          })
        )
      );
      const failed = results.filter((r) => !r.ok);
      if (failed.length > 0) {
        toastError(`${failed.length} cambio(s) no se pudieron guardar`);
        loadUsers();
      } else {
        setOriginalUsers(platformUsers);
        setPendingChanges({});
      }
    } catch {
      toastError("Error al guardar los cambios");
      loadUsers();
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const periodLabels: Record<string, string> = { daily: "Diario", weekly: "Semanal", monthly: "Mensual", quarterly: "Trimestral", annual: "Anual" };
    const typeLabels: Record<string, string> = { sales: "Ventas", inventory: "Inventario", purchases: "Compras", customers: "Clientes", income: "Ingresos" };

    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text("Lotus Body Car", 14, 20);
    doc.setFontSize(12); doc.setFont("helvetica", "normal");
    doc.text("Piezas Automotrices Premium", 14, 27);
    doc.setDrawColor(200, 0, 0); doc.setLineWidth(0.5); doc.line(14, 31, 196, 31);
    doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text(`Reporte de ${typeLabels[reportType] ?? reportType}`, 14, 40);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Periodo: ${periodLabels[reportPeriod] ?? reportPeriod}`, 14, 47);
    doc.text(`Generado: ${new Date().toLocaleDateString("es-CO")}`, 14, 53);

    let y = 62;
    if (stats && (reportType === "sales" || reportType === "income")) {
      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("Resumen de Ventas", 14, y); y += 8;
      doc.setFontSize(10); doc.setFont("helvetica", "normal");
      doc.text(`Total de Ventas: ${formatPrice(stats.totalSales)}`, 14, y); y += 6;
      doc.text(`Total de Pedidos: ${stats.totalOrders}`, 14, y); y += 6;
      doc.text(`Productos Activos: ${stats.totalProducts}`, 14, y); y += 10;

      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("Ventas Mensuales", 14, y); y += 7;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      doc.text("Mes", 14, y); doc.text("Ventas", 100, y); y += 4;
      doc.setDrawColor(200, 200, 200); doc.line(14, y, 196, y); y += 4;
      for (const m of stats.monthlySales) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`${m.month} ${m.year}`, 14, y); doc.text(formatPrice(m.sales), 100, y); y += 5;
      }
      y += 5;
      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("Productos Mas Vendidos", 14, y); y += 7;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      doc.text("Producto", 14, y); doc.text("Unidades", 120, y); doc.text("Ingresos", 160, y); y += 4;
      doc.line(14, y, 196, y); y += 4;
      for (const p of stats.topProducts) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(p.name.length > 45 ? p.name.slice(0, 45) + "..." : p.name, 14, y);
        doc.text(String(p.sales), 120, y); doc.text(formatPrice(p.revenue), 160, y); y += 5;
      }
    } else {
      doc.setFontSize(10); doc.setFont("helvetica", "normal");
      doc.text("Para este tipo de reporte descarga en formato CSV o Excel.", 14, y);
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150);
      doc.text(`Lotus Body Car - Documento confidencial - Pag. ${i}/${pageCount}`, 14, 290);
      doc.setTextColor(0);
    }
    doc.save(`reporte_${reportType}_${reportPeriod}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      if (reportFormat === "pdf") {
        await generatePDF();
      } else {
        const url = `/api/admin/report?type=${reportType}&period=${reportPeriod}&format=${reportFormat}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const blob = await res.blob();
        const ext = reportFormat === "excel" ? "xls" : "csv";
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `reporte_${reportType}_${reportPeriod}_${new Date().toISOString().slice(0, 10)}.${ext}`;
        a.click();
        URL.revokeObjectURL(a.href);
      }
    } catch {
      toastError("No se pudo generar el reporte");
    } finally {
      setGenerating(false);
    }
  };

  const filteredUsers = platformUsers.filter(
    (u) =>
      u.nombre.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.correo.toLowerCase().includes(userSearch.toLowerCase())
  );

  const statusConfig: Record<string, string> = {
    Pagado: "bg-green-100 text-green-700",
    Pendiente: "bg-yellow-100 text-yellow-700",
    Enviado: "bg-blue-100 text-blue-700",
    Entregado: "bg-green-100 text-green-700",
    Cancelado: "bg-red-100 text-red-700",
  };

  const tabs = [
    { id: "reports" as Tab, label: "Reportes" },
    { id: "sales" as Tab, label: "Ventas" },
    { id: "products" as Tab, label: "Productos" },
    { id: "orders" as Tab, label: "Pedidos" },
    { id: "users" as Tab, label: "Usuarios" },
  ];

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Cargando...</div>
    </div>
  );

  if (!user || user.rol !== "admin") return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
    </div>
  );

  const maxSales = stats ? Math.max(...stats.monthlySales.map((s) => s.sales), 1) : 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Panel de Administracion</h1>
            <p className="text-sm text-gray-600 mt-1">Gestion y reportes del sistema</p>
          </div>
          <button onClick={() => router.push("/")} className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50">
            Volver al inicio
          </button>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 sm:p-6 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
                <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-7 w-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600"><TrendingUp className="h-3 w-3" />Real</div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Ventas Totales</p>
              <p className="text-lg sm:text-2xl font-bold">{formatPrice(stats?.totalSales ?? 0)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Pedidos</p>
              <p className="text-lg sm:text-2xl font-bold">{stats?.totalOrders ?? 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Productos</p>
              <p className="text-lg sm:text-2xl font-bold">{stats?.totalProducts ?? 0}</p>
              <p className="text-xs text-gray-500">activos</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Usuarios</p>
              <p className="text-lg sm:text-2xl font-bold">{stats?.totalUsers ?? 0}</p>
              <p className="text-xs text-gray-500">registrados</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 px-4 sm:px-6">
            <div className="flex gap-1 sm:gap-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`py-3 sm:py-4 px-2 sm:px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "reports" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Generador de Reportes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Reporte</label>
                    <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option value="sales">Ventas</option>
                      <option value="inventory">Inventario</option>
                      <option value="purchases">Compras</option>
                      <option value="customers">Clientes</option>
                      <option value="income">Ingresos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Periodo</label>
                    <select value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                      <option value="quarterly">Trimestral</option>
                      <option value="annual">Anual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Formato</label>
                    <select value={reportFormat} onChange={(e) => setReportFormat(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleGenerateReport} disabled={generating}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-md text-sm font-medium">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {generating ? "Generando..." : "Generar y Descargar Reporte"}
                </button>
                {stats && (
                  <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center"><p className="text-xs text-gray-500">Ventas Totales</p><p className="font-bold text-sm">{formatPrice(stats.totalSales)}</p></div>
                    <div className="text-center"><p className="text-xs text-gray-500">Pedidos</p><p className="font-bold text-sm">{stats.totalOrders}</p></div>
                    <div className="text-center"><p className="text-xs text-gray-500">Productos</p><p className="font-bold text-sm">{stats.totalProducts}</p></div>
                    <div className="text-center"><p className="text-xs text-gray-500">Usuarios</p><p className="font-bold text-sm">{stats.totalUsers}</p></div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "sales" && (
              <div className="space-y-6">
                {statsLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-red-600" /></div>
                ) : (
                  <>
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Ventas Mensuales</h2>
                      {stats?.monthlySales?.every((m) => m.sales === 0) ? (
                        <p className="text-sm text-gray-500">No hay ventas registradas aun.</p>
                      ) : (
                        <div className="space-y-3">
                          {stats?.monthlySales.map((month) => (
                            <div key={month.key} className="flex items-center gap-3">
                              <span className="text-sm font-medium w-10 shrink-0">{month.month}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-3">
                                <div className="bg-red-600 h-3 rounded-full transition-all" style={{ width: `${(month.sales / maxSales) * 100}%` }} />
                              </div>
                              <span className="text-sm text-gray-600 w-32 text-right shrink-0">{formatPrice(month.sales)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Productos Mas Vendidos</h2>
                      {!stats?.topProducts?.length ? (
                        <p className="text-sm text-gray-500">No hay datos de ventas aun.</p>
                      ) : (
                        <div className="space-y-3">
                          {stats.topProducts.map((product, i) => (
                            <div key={product.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <span className="w-6 h-6 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.sales} unidades vendidas</p>
                              </div>
                              <span className="text-sm font-medium text-green-600 shrink-0">{formatPrice(product.revenue)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "products" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Analisis de Productos</h2>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-red-600" /></div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-700">{stats?.totalProducts ?? 0}</p>
                        <p className="text-sm text-gray-500">Activos</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold">{stats?.topProducts.reduce((s, p) => s + p.sales, 0) ?? 0}</p>
                        <p className="text-sm text-gray-500">Unidades Vendidas</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-red-700">{stats?.topProducts.length ?? 0}</p>
                        <p className="text-sm text-gray-500">Con Ventas</p>
                      </div>
                    </div>
                    <button onClick={() => { setReportType("inventory"); setActiveTab("reports"); }}
                      className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md text-sm">
                      <BarChart3 className="h-4 w-4" />
                      Generar Reporte de Inventario
                    </button>
                  </>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Pedidos Recientes</h2>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-red-600" /></div>
                ) : !stats?.recentOrders?.length ? (
                  <p className="text-sm text-gray-500 py-8 text-center">No hay pedidos registrados.</p>
                ) : (
                  <>
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
                          {stats.recentOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-red-600 text-xs">{order.id.slice(0, 8)}...</td>
                              <td className="py-3 px-4">{order.customer}</td>
                              <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{order.product}</td>
                              <td className="py-3 px-4 font-medium">{formatPrice(order.amount)}</td>
                              <td className="py-3 px-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${statusConfig[order.status] ?? "bg-gray-100 text-gray-700"}`}>{order.status}</span>
                              </td>
                              <td className="py-3 px-4 text-gray-500">{formatDate(order.date)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="sm:hidden space-y-3">
                      {stats.recentOrders.map((order) => (
                        <div key={order.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-medium text-red-600">{order.id.slice(0, 8)}...</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${statusConfig[order.status] ?? "bg-gray-100 text-gray-700"}`}>{order.status}</span>
                          </div>
                          <p className="text-sm">{order.customer}</p>
                          <p className="text-xs text-gray-500 mb-1 truncate">{order.product}</p>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{formatPrice(order.amount)}</span>
                            <span className="text-xs text-gray-500">{formatDate(order.date)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "users" && (
              <div>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Gestion de Usuarios</h2>
                  <input type="text" placeholder="Buscar por nombre o correo..." value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>

                {Object.keys(pendingChanges).length > 0 && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800 font-medium">
                      {Object.keys(pendingChanges).length} usuario(s) con cambios sin guardar
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDiscardChanges}
                        className="inline-flex items-center gap-1.5 text-sm border border-gray-300 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-md"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Descartar
                      </button>
                      <button
                        onClick={handleSaveChanges}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-1.5 rounded-md font-medium"
                      >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        {saving ? "Guardando..." : "Guardar cambios"}
                      </button>
                    </div>
                  </div>
                )}
                {usersLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-red-600" /></div>
                ) : (
                  <>
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
                            <tr key={u.id} className={`hover:bg-gray-50 ${!u.verificado ? "opacity-60" : ""} ${pendingChanges[u.id] ? "bg-amber-50/50" : ""}`}>
                              <td className="py-3 px-3">
                                <div>
                                  <p className="font-medium">{u.nombre}</p>
                                  <p className="text-xs text-gray-500">{u.correo}</p>
                                  {pendingChanges[u.id] && (
                                    <span className="text-xs text-amber-600 font-medium">Cambio pendiente</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <select value={u.rol} onChange={(e) => handleRoleChange(u.id, e.target.value)} disabled={u.id === user?.id}
                                  className="border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-60">
                                  <option value="buyer">Comprador</option>
                                  <option value="seller">Vendedor</option>
                                  <option value="admin">Administrador</option>
                                </select>
                              </td>
                              <td className="py-3 px-3">
                                <span className={`text-xs px-2 py-1 rounded-full ${u.verificado ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                  {u.verificado ? "Activo" : "Inactivo"}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-gray-500 text-xs">{u.fecha_registro ? formatDate(u.fecha_registro) : "-"}</td>
                              <td className="py-3 px-3">
                                <button onClick={() => handleToggleActive(u.id)} disabled={u.id === user?.id}
                                  title={u.verificado ? "Desactivar cuenta" : "Activar cuenta"}
                                  className={`p-1.5 rounded transition disabled:opacity-40 ${u.verificado ? "hover:bg-red-50 text-red-600" : "hover:bg-green-50 text-green-600"}`}>
                                  {u.verificado ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="sm:hidden space-y-3">
                      {filteredUsers.map((u) => (
                        <div key={u.id} className={`bg-gray-50 rounded-lg p-3 ${!u.verificado ? "opacity-60" : ""}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div><p className="font-medium text-sm">{u.nombre}</p><p className="text-xs text-gray-500">{u.correo}</p></div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${u.verificado ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                              {u.verificado ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Shield className="h-4 w-4 text-gray-400" />
                            <select value={u.rol} onChange={(e) => handleRoleChange(u.id, e.target.value)} disabled={u.id === user?.id}
                              className="border border-gray-200 rounded px-2 py-1 text-xs bg-white flex-1 focus:outline-none disabled:opacity-60">
                              <option value="buyer">Comprador</option>
                              <option value="seller">Vendedor</option>
                              <option value="admin">Administrador</option>
                            </select>
                            <button onClick={() => handleToggleActive(u.id)} disabled={u.id === user?.id}
                              className={`p-1.5 rounded border text-xs disabled:opacity-40 ${u.verificado ? "border-red-200 text-red-600" : "border-green-200 text-green-600"}`}>
                              {u.verificado ? "Desactivar" : "Activar"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {filteredUsers.length === 0 && !usersLoading && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No se encontraron usuarios</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-4">* Los cambios de rol y estado se guardan en tiempo real. No puedes modificar tu propio rol o cuenta.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
