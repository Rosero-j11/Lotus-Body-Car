import { Component, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { User } from '../../models/user.model';
import { Header } from '../shared/header/header';

interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  condition: string;
  status: 'available' | 'reserved' | 'sold';
  stock: number;
  image: string;
  publishDate: string;
}

@Component({
  selector: 'app-seller-dashboard',
  imports: [CommonModule, Header],
  templateUrl: './seller-dashboard.html',
  styleUrl: './seller-dashboard.css'
})
export class SellerDashboard {
  
  products = signal<Product[]>([
    {
      id: '1',
      name: 'Motor V8 BMW M5',
      brand: 'BMW',
      model: 'M5 F90',
      price: 15000000,
      condition: 'Nuevo',
      status: 'available',
      stock: 3,
      image: 'https://images.unsplash.com/photo-1762139258224-236877b2c571?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBlbmdpbmUlMjBwYXJ0c3xlbnwxfHx8fDE3NjMyMjYwOTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      publishDate: '2024-11-10',
    },
    {
      id: '4',
      name: 'Sistema de Escape Akrapovic',
      brand: 'Porsche',
      model: '911 GT3',
      price: 12000000,
      condition: 'Nuevo',
      status: 'reserved',
      stock: 1,
      image: 'https://images.unsplash.com/photo-1752959818576-b0991721789d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXIlMjBwYXJ0c3xlbnwxfHx8fDE3NjMyMjc3NTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      publishDate: '2024-11-08',
    },
    {
      id: '5',
      name: 'Turbo Garrett GT3582R',
      brand: 'Universal',
      model: 'Alto Rendimiento',
      price: 6800000,
      condition: 'Nuevo',
      status: 'sold',
      stock: 0,
      image: 'https://images.unsplash.com/photo-1759580596227-741485a217e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibXclMjBjYXIlMjBwYXJ0c3xlbnwxfHx8fDE3NjMyMjc3NjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      publishDate: '2024-11-05',
    },
  ]);

  filterStatus = signal<string>('all');

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

  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      available: 'Disponible',
      reserved: 'Reservado',
      sold: 'Vendido'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: Record<string, string> = {
      available: 'bg-green-100 text-green-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-gray-100 text-gray-800'
    };
    return classMap[status] || 'bg-gray-100 text-gray-800';
  }

  updateProductStatus(productId: string, newStatus: 'available' | 'reserved' | 'sold') {
    this.products.update(products =>
      products.map(p => p.id === productId ? { ...p, status: newStatus } : p)
    );
  }

  deleteProduct(productId: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.products.update(products => products.filter(p => p.id !== productId));
    }
  }

  getFilteredProducts(): Product[] {
    const status = this.filterStatus();
    return status === 'all'
      ? this.products()
      : this.products().filter(p => p.status === status);
  }

  getTotalProducts(): number {
    return this.products().length;
  }

  getTotalValue(): number {
    return this.products().reduce((sum, p) => sum + (p.price * p.stock), 0);
  }

  getSoldProducts(): number {
    return this.products().filter(p => p.status === 'sold').length;
  }

  goToPublish() {
    this.router.navigate(['/publish']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  viewProduct(productId: string) {
    this.router.navigate(['/product', productId]);
  }
}
