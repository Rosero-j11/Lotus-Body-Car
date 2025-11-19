import { Component, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { User } from '../../models/user.model';
import { Header } from '../shared/header/header';

interface MonthlySales {
  month: string;
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

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, Header],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {
  
  reportPeriod = signal('month');
  reportType = signal('sales');
  activeTab = signal('reports');
  
  stats = {
    totalSales: 125000000,
    totalOrders: 48,
    totalProducts: 156,
    totalUsers: 342,
    monthlySales: [
      { month: 'Ene', sales: 15000000 },
      { month: 'Feb', sales: 18000000 },
      { month: 'Mar', sales: 22000000 },
      { month: 'Abr', sales: 19000000 },
      { month: 'May', sales: 25000000 },
      { month: 'Jun', sales: 26000000 },
    ] as MonthlySales[],
    topProducts: [
      { name: 'Motor V8 BMW M5', sales: 45, revenue: 67500000 },
      { name: 'Rines AMG 20"', sales: 38, revenue: 32300000 },
      { name: 'Sistema Escape Akrapovic', sales: 24, revenue: 28800000 },
      { name: 'Asientos Recaro', sales: 42, revenue: 18900000 },
      { name: 'Turbo Garrett', sales: 31, revenue: 21080000 },
    ] as TopProduct[],
    recentOrders: [
      { id: 'ORD-1234', customer: 'Carlos Ramírez', product: 'Motor V8 BMW M5', amount: 15000000, status: 'Pagado', date: '2024-11-14' },
      { id: 'ORD-1235', customer: 'María González', product: 'Rines AMG 20"', amount: 8500000, status: 'Pendiente', date: '2024-11-14' },
      { id: 'ORD-1236', customer: 'Juan Pérez', product: 'Asientos Recaro', amount: 4500000, status: 'Pagado', date: '2024-11-13' },
      { id: 'ORD-1237', customer: 'Ana Torres', product: 'Sistema Escape', amount: 12000000, status: 'Pagado', date: '2024-11-13' },
      { id: 'ORD-1238', customer: 'Pedro Sánchez', product: 'Turbo Garrett', amount: 6800000, status: 'Enviado', date: '2024-11-12' },
    ] as RecentOrder[],
  };

  user: WritableSignal<User | null>;

  constructor(
    private router: Router,
    private appState: AppStateService
  ) {
    this.user = this.appState.user;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  }

  handleExportReport() {
    alert(`Exportando reporte de ${this.reportType()} (${this.reportPeriod()})...`);
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  getBarWidth(sales: number): string {
    return `${(sales / 26000000) * 100}%`;
  }

  getStatusClass(status: string): string {
    const classMap: Record<string, string> = {
      'Pagado': 'bg-green-100 text-green-700',
      'Pendiente': 'bg-yellow-100 text-yellow-700',
      'Enviado': 'bg-blue-100 text-blue-700'
    };
    return classMap[status] || 'bg-gray-100 text-gray-700';
  }
}
