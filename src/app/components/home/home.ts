import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Header } from '../shared/header/header';

interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  condition: string;
  image: string;
  seller: string;
  location: string;
  category: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, Header, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  searchQuery = signal('');
  sortBy = signal('relevance');
  selectedBrands = signal<string[]>([]);
  selectedCategories = signal<string[]>([]);
  isFilterSheetOpen = signal(false);

  brands = ['BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Ferrari', 'Lamborghini'];
  categories = ['Motor', 'Llantas y Rines', 'Interiores', 'Escape', 'Frenos', 'Suspensión', 'Carrocería'];

  mockProducts: Product[] = [
    {
      id: '1',
      name: 'Motor V8 BMW M5',
      brand: 'BMW',
      model: 'M5 F90',
      price: 15000000,
      condition: 'Nuevo',
      image: 'https://images.unsplash.com/photo-1762139258224-236877b2c571?w=500',
      seller: 'Premium Parts Co.',
      location: 'Bogotá',
      category: 'Motor'
    },
    {
      id: '2',
      name: 'Rines Deportivos AMG 20"',
      brand: 'Mercedes-Benz',
      model: 'AMG GT',
      price: 8500000,
      condition: 'Nuevo',
      image: 'https://images.unsplash.com/photo-1677917362048-a9e5267d7882?w=500',
      seller: 'AutoLux Parts',
      location: 'Medellín',
      category: 'Llantas y Rines'
    },
    {
      id: '3',
      name: 'Asientos Deportivos Recaro',
      brand: 'Universal',
      model: 'Deportivos',
      price: 4500000,
      condition: 'Nuevo',
      image: 'https://images.unsplash.com/photo-1741086011537-c935f6f29724?w=500',
      seller: 'Racing Parts',
      location: 'Cali',
      category: 'Interiores'
    },
    {
      id: '4',
      name: 'Sistema de Escape Akrapovic',
      brand: 'Porsche',
      model: '911 GT3',
      price: 12000000,
      condition: 'Nuevo',
      image: 'https://images.unsplash.com/photo-1752959818576-b0991721789d?w=500',
      seller: 'Performance Shop',
      location: 'Bogotá',
      category: 'Escape'
    },
    {
      id: '5',
      name: 'Turbo Garrett GT3582R',
      brand: 'Universal',
      model: 'Alto Rendimiento',
      price: 6800000,
      condition: 'Nuevo',
      image: 'https://images.unsplash.com/photo-1759580596227-741485a217e6?w=500',
      seller: 'Turbo Masters',
      location: 'Medellín',
      category: 'Motor'
    },
    {
      id: '6',
      name: 'Frenos Brembo Gran Turismo',
      brand: 'Audi',
      model: 'RS6',
      price: 9500000,
      condition: 'Nuevo',
      image: 'https://images.unsplash.com/photo-1564128246944-88ea677875f6?w=500',
      seller: 'Brake Systems Pro',
      location: 'Bogotá',
      category: 'Frenos'
    },
  ];

  constructor(private router: Router) {}

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  }

  toggleBrand(brand: string) {
    const current = this.selectedBrands();
    if (current.includes(brand)) {
      this.selectedBrands.set(current.filter(b => b !== brand));
    } else {
      this.selectedBrands.set([...current, brand]);
    }
  }

  toggleCategory(category: string) {
    const current = this.selectedCategories();
    if (current.includes(category)) {
      this.selectedCategories.set(current.filter(c => c !== category));
    } else {
      this.selectedCategories.set([...current, category]);
    }
  }

  clearFilters() {
    this.selectedBrands.set([]);
    this.selectedCategories.set([]);
  }

  viewProduct(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  toggleFilterSheet() {
    this.isFilterSheetOpen.set(!this.isFilterSheetOpen());
  }
}
