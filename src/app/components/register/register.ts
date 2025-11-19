import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'buyer' | 'seller';
  acceptTerms: boolean;
}

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  formData = signal<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
    acceptTerms: false
  });
  
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  errors = signal<string[]>([]);

  constructor(
    private appState: AppStateService,
    private router: Router
  ) {}

  updateField(field: keyof FormData, value: any) {
    this.formData.update(data => ({ ...data, [field]: value }));
    this.errors.set([]);
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  validatePassword(password: string): string[] {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe incluir al menos una mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Debe incluir al menos una minúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Debe incluir al menos un número');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Debe incluir al menos un carácter especial (!@#$%^&*)');
    }
    return errors;
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    const validationErrors: string[] = [];
    const data = this.formData();

    // HU-001 validations
    if (!data.name || !data.email || !data.phone || !data.password) {
      validationErrors.push('Todos los campos son obligatorios');
    }

    const passwordErrors = this.validatePassword(data.password);
    validationErrors.push(...passwordErrors);

    if (data.password !== data.confirmPassword) {
      validationErrors.push('Las contraseñas no coinciden');
    }

    if (!data.acceptTerms) {
      validationErrors.push('Debes aceptar los términos y condiciones');
    }

    if (validationErrors.length > 0) {
      this.errors.set(validationErrors);
      return;
    }

    // Mock successful registration
    const newUser = {
      id: '1',
      name: data.name,
      email: data.email,
      role: data.role,
    };

    this.appState.setUser(newUser);
    this.router.navigate(['/']);
  }
}
