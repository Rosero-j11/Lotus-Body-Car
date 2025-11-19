import { Component, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { User } from '../../models/user.model';
import { Header } from '../shared/header/header';

interface OrderItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  quantity: number;
}

interface OrderData {
  orderNumber: string;
  date: string;
  paymentMethod: string;
  transactionId: string;
  items: OrderItem[];
  shippingAddress: string;
  subtotal: number;
  iva: number;
  shippingCost: number;
  total: number;
}

@Component({
  selector: 'app-payment-confirmation',
  imports: [CommonModule, Header],
  templateUrl: './payment-confirmation.html',
  styleUrl: './payment-confirmation.css'
})
export class PaymentConfirmation {
  success = signal(true);
  
  orderData = signal<OrderData>({
    orderNumber: 'LBC-2024-11-15-001234',
    date: new Date().toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    paymentMethod: 'Tarjeta de Crédito Visa ****4532',
    transactionId: 'TXN-987654321',
    items: [
      {
        id: '1',
        name: 'Motor V8 BMW M5',
        brand: 'BMW',
        model: 'M5 F90',
        price: 15000000,
        quantity: 1,
      },
      {
        id: '2',
        name: 'Rines Deportivos AMG 20"',
        brand: 'Mercedes-Benz',
        model: 'AMG GT',
        price: 8500000,
        quantity: 1,
      },
      {
        id: '3',
        name: 'Asientos Deportivos Recaro',
        brand: 'Universal',
        model: 'Deportivos',
        price: 4500000,
        quantity: 2,
      },
    ],
    shippingAddress: 'Calle 123 #45-67, Bogotá, Colombia',
    subtotal: 32500000,
    iva: 6175000,
    shippingCost: 0,
    total: 38675000,
  });

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

  handleDownloadInvoice() {
    alert('Descargando factura electrónica...');
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}
