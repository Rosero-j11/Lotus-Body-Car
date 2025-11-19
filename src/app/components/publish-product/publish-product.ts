import { Component, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { User } from '../../models/user.model';
import { Header } from '../shared/header/header';

interface FormData {
  name: string;
  description: string;
  brand: string;
  model: string;
  category: string;
  condition: 'new' | 'used';
  price: string;
  stock: string;
}

@Component({
  selector: 'app-publish-product',
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './publish-product.html',
  styleUrl: './publish-product.css'
})
export class PublishProduct {
  
  formData = signal<FormData>({
    name: '',
    description: '',
    brand: '',
    model: '',
    category: '',
    condition: 'new',
    price: '',
    stock: '',
  });
  
  images = signal<string[]>([]);
  errors = signal<string[]>([]);

  brands = ['BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Ferrari', 'Lamborghini', 'Universal'];
  categories = ['Motor', 'Llantas y Rines', 'Interiores', 'Escape', 'Frenos', 'Suspensión', 'Carrocería', 'Electrónica', 'Accesorios'];

  user: WritableSignal<User | null>;

  constructor(
    private router: Router,
    private appState: AppStateService
  ) {
    this.user = this.appState.user;
  }

  updateFormData(field: keyof FormData, value: string) {
    this.formData.update(data => ({ ...data, [field]: value }));
    this.errors.set([]);
  }

  handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newImages = Array.from(input.files).map(file => URL.createObjectURL(file));
      this.images.update(prev => [...prev, ...newImages].slice(0, 5));
    }
  }

  removeImage(index: number) {
    this.images.update(prev => prev.filter((_, i) => i !== index));
  }

  handleSubmit(e: Event) {
    e.preventDefault();
    const validationErrors: string[] = [];
    const data = this.formData();

    if (!data.name) validationErrors.push('El nombre es obligatorio');
    if (!data.description) validationErrors.push('La descripción es obligatoria');
    if (!data.brand) validationErrors.push('La marca es obligatoria');
    if (!data.model) validationErrors.push('El modelo es obligatorio');
    if (!data.category) validationErrors.push('La categoría es obligatoria');
    if (!data.price || parseFloat(data.price) <= 0) validationErrors.push('El precio debe ser mayor a 0');
    if (!data.stock || parseInt(data.stock) <= 0) validationErrors.push('El stock debe ser mayor a 0');
    if (this.images().length === 0) validationErrors.push('Debes agregar al menos 1 fotografía');

    if (validationErrors.length > 0) {
      this.errors.set(validationErrors);
      return;
    }

    alert('¡Pieza publicada exitosamente!');
    this.router.navigate(['/seller-dashboard']);
  }

  goToSellerDashboard() {
    this.router.navigate(['/seller-dashboard']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  formatPrice(price: string): string {
    if (!price) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(parseFloat(price));
  }
}
