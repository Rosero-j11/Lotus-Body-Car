import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../../services/app-state.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private appState = inject(AppStateService);
  private router = inject(Router);
  
  user = this.appState.user;
  cartItemCount = 3; // TODO: Conectar con servicio de carrito
  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    this.appState.logout();
    this.router.navigate(['/']);
    this.isDropdownOpen = false;
  }

  getRoleName(role: string): string {
    const roles: Record<string, string> = {
      'buyer': 'Comprador',
      'seller': 'Vendedor',
      'admin': 'Administrador'
    };
    return roles[role] || role;
  }
}
