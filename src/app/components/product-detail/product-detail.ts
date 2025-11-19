import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  description: string;
  images: string[];
  seller: {
    name: string;
    rating: number;
    reviews: number;
    verified: boolean;
  };
  location: string;
  category: string;
  stock: number;
  specifications: Record<string, string>;
}

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, Header],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {
  selectedImage = signal(0);
  quantity = signal(1);
  product = signal<Product>({
    id: '1',
    name: 'Motor V8 BMW M5',
    brand: 'BMW',
    model: 'M5 F90',
    price: 15000000,
    condition: 'Nuevo',
    description: 'Motor V8 biturbo de alto rendimiento para BMW M5 F90. Incluye garantía del fabricante y certificado de autenticidad. Perfecto estado, nunca instalado. Compatible con modelos 2018-2023.',
    images: [
      'https://images.unsplash.com/photo-1762139258224-236877b2c571?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBlbmdpbmUlMjBwYXJ0c3xlbnwxfHx8fDE3NjMyMjYwOTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1752959818576-b0991721789d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXIlMjBwYXJ0c3xlbnwxfHx8fDE3NjMyMjc3NTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1759580596227-741485a217e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibXclMjBjYXIlMjBwYXJ0c3xlbnwxfHx8fDE3NjMyMjc3NjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    seller: {
      name: 'Premium Parts Co.',
      rating: 4.8,
      reviews: 127,
      verified: true,
    },
    location: 'Bogotá, Colombia',
    category: 'Motor',
    stock: 3,
    specifications: {
      'Compatibilidad': 'BMW M5 F90 (2018-2023)',
      'Cilindrada': '4.4L V8 Biturbo',
      'Potencia': '600 HP',
      'Estado': 'Nuevo sin usar',
      'Garantía': '12 meses',
      'Origen': 'Alemania - Original BMW',
    }
  });

  user: WritableSignal<User | null>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appState: AppStateService
  ) {
    this.user = this.appState.user;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      // Aquí cargarías el producto real desde un servicio
      console.log('Loading product:', productId);
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  }

  selectImage(index: number) {
    this.selectedImage.set(index);
  }

  decreaseQuantity() {
    this.quantity.update(q => Math.max(1, q - 1));
  }

  increaseQuantity() {
    this.quantity.update(q => Math.min(this.product().stock, q + 1));
  }

  handleAddToCart() {
    alert(`Se agregaron ${this.quantity()} unidad(es) al carrito`);
  }

  buyNow() {
    this.router.navigate(['/cart']);
  }

  contactSeller() {
    alert('Funcionalidad de contacto próximamente');
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  getSpecificationsEntries() {
    return Object.entries(this.product().specifications);
  }
}
