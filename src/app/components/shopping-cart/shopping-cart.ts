import { Component, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { User } from '../../models/user.model';
import { Header } from '../shared/header/header';

interface CartItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  quantity: number;
  stock: number;
  image: string;
}

@Component({
  selector: 'app-shopping-cart',
  imports: [CommonModule, Header],
  templateUrl: './shopping-cart.html',
  styleUrl: './shopping-cart.css'
})
export class ShoppingCart {
  
  cartItems = signal<CartItem[]>([
    {
      id: '1',
      name: 'Motor V8 BMW M5',
      brand: 'BMW',
      model: 'M5 F90',
      price: 15000000,
      quantity: 1,
      stock: 3,
      image: 'https://images.unsplash.com/photo-1762139258224-236877b2c571?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBlbmdpbmUlMjBwYXJ0c3xlbnwxfHx8fDE3NjMyMjYwOTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: '2',
      name: 'Rines Deportivos AMG 20"',
      brand: 'Mercedes-Benz',
      model: 'AMG GT',
      price: 8500000,
      quantity: 1,
      stock: 5,
      image: 'https://images.unsplash.com/photo-1677917362048-a9e5267d7882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjB3aGVlbHMlMjByaW1zfGVufDF8fHx8MTc2MzE0MjAxOXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: '3',
      name: 'Asientos Deportivos Recaro',
      brand: 'Universal',
      model: 'Deportivos',
      price: 4500000,
      quantity: 2,
      stock: 8,
      image: 'https://images.unsplash.com/photo-1741086011537-c935f6f29724?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBpbnRlcmlvciUyMHBhcnRzfGVufDF8fHx8MTc2MzIyNzc2MXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ]);

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

  updateQuantity(id: string, newQuantity: number) {
    this.cartItems.update(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Math.min(item.stock, newQuantity)) }
          : item
      )
    );
  }

  removeItem(id: string) {
    this.cartItems.update(items => items.filter(item => item.id !== id));
  }

  clearCart() {
    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      this.cartItems.set([]);
    }
  }

  getSubtotal(): number {
    return this.cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getIVA(): number {
    return this.getSubtotal() * 0.19;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getIVA();
  }

  handleCheckout() {
    alert('Redirigiendo a la pasarela de pago externa...');
    setTimeout(() => {
      this.router.navigate(['/payment']);
    }, 1000);
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
