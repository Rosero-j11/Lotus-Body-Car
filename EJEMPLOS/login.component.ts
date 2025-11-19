import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-angular';
import { AppStateService } from '../../services/app-state.service';
import { User } from '../../models/user.model';
import { ButtonComponent } from '../shared/ui/button/button';
import { InputComponent } from '../shared/ui/input/input';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent, CardFooterComponent } from '../shared/ui/card/card';
import { LabelComponent } from '../shared/ui/label/label';
import { AlertComponent, AlertTitleComponent, AlertDescriptionComponent } from '../shared/ui/alert/alert';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    LucideAngularModule,
    ButtonComponent,
    InputComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    CardFooterComponent,
    LabelComponent,
    AlertComponent,
    AlertTitleComponent,
    AlertDescriptionComponent
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private appState = inject(AppStateService);
  
  // Lucide icons
  readonly ArrowLeft = ArrowLeft;
  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  
  // Reactive state with signals
  email = signal('');
  password = signal('');
  showPassword = signal(false);
  error = signal('');
  
  // Logo path (copiar imagen a src/assets/)
  logoLotus = 'assets/logo-lotus.png';

  handleSubmit(e: Event) {
    e.preventDefault();
    this.error.set('');

    // Validation
    if (!this.email() || !this.password()) {
      this.error.set('Por favor completa todos los campos');
      return;
    }

    // Mock login - HU-002 (simula autenticación)
    const mockUser: User = {
      id: '1',
      name: 'Juan Pérez',
      email: this.email(),
      role: 'seller', // Cambiar a 'buyer' o 'admin' para probar diferentes roles
    };

    this.appState.login(mockUser);
  }

  navigateHome() {
    this.appState.navigateTo('home');
  }

  navigateToRegister() {
    this.appState.navigateTo('register');
  }
}
