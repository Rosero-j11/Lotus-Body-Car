import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = signal('');
  password = signal('');
  showPassword = signal(false);
  error = signal('');

  constructor(
    private appState: AppStateService,
    private router: Router
  ) {}

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    this.error.set('');

    if (!this.email() || !this.password()) {
      this.error.set('Por favor completa todos los campos');
      return;
    }

    // Mock login - HU-002
    const mockUser = {
      id: '1',
      name: 'Juan Pérez',
      email: this.email(),
      role: 'seller' as const,
    };

    this.appState.setUser(mockUser);
    this.router.navigate(['/']);
  }
}
