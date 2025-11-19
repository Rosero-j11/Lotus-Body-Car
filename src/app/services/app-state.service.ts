import { Injectable, signal } from '@angular/core';
import { User, View } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  currentView = signal<View>('home');
  user = signal<User | null>(null);
  selectedProductId = signal<string | null>(null);

  setCurrentView(view: View) {
    this.currentView.set(view);
  }

  setUser(user: User | null) {
    this.user.set(user);
  }

  setSelectedProductId(productId: string | null) {
    this.selectedProductId.set(productId);
  }

  login(userData: User) {
    this.setUser(userData);
    this.setCurrentView('home');
  }

  logout() {
    this.setUser(null);
    this.setCurrentView('home');
  }

  viewProduct(productId: string) {
    this.setSelectedProductId(productId);
    this.setCurrentView('product-detail');
  }

  navigateTo(view: View) {
    this.setCurrentView(view);
  }
}
