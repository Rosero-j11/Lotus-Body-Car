# Guía de Migración de React a Angular - Lotus Body Car

Este documento contiene la migración completa de tu proyecto React a Angular, manteniendo las mismas vistas, comportamiento y resoluciones.

## ✅ Completado

1. ✅ Proyecto Angular creado con routing
2. ✅ Tailwind CSS configurado
3. ✅ Lucide Angular instalado
4. ✅ Modelos creados (User, View)
5. ✅ Servicio de estado global creado (AppStateService)

## 📋 Estructura del Proyecto Angular

```
project-angular/
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   └── user.model.ts ✅
│   │   ├── services/
│   │   │   └── app-state.service.ts ✅
│   │   ├── components/
│   │   │   ├── shared/
│   │   │   │   ├── header/
│   │   │   │   └── ui/ (botones, inputs, cards, etc.)
│   │   │   ├── home/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── product-detail/
│   │   │   ├── shopping-cart/
│   │   │   ├── seller-dashboard/
│   │   │   ├── publish-product/
│   │   │   ├── admin-dashboard/
│   │   │   └── payment-confirmation/
│   │   ├── app.ts
│   │   ├── app.html
│   │   └── app.routes.ts
│   └── styles.css ✅
```

## 🔧 Pasos Siguientes

### 1. Crear Utilidad cn() para clases CSS

Archivo: `src/app/utils/cn.util.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 2. Componentes UI a Migrar

Los siguientes componentes UI necesitan ser migrados a Angular:

#### Componentes de Prioridad Alta (usados en todos los views):
- Button ⭐
- Input ⭐
- Card (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter) ⭐
- Label ⭐
- Badge ⭐

#### Componentes de Prioridad Media:
- DropdownMenu (usado en Header)
- Select
- Sheet (filtros en Home)
- Checkbox
- RadioGroup
- Separator
- Table
- Tabs
- Dialog
- Alert

#### Componentes Adicionales:
- Avatar
- Accordion
- AlertDialog
- AspectRatio
- Breadcrumb
- Calendar
- Carousel
- Chart
- Collapsible
- Command
- ContextMenu
- Drawer
- Form
- HoverCard
- InputOtp
- Menubar
- NavigationMenu
- Pagination
- Popover
- Progress
- Resizable
- ScrollArea
- Sidebar
- Skeleton
- Slider
- Sonner (toasts)
- Switch
- Textarea
- Toggle
- ToggleGroup
- Tooltip

### 3. Guía de Migración Componente Button

**React (button.tsx):**
```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90...",
        outline: "border bg-background text-foreground hover:bg-accent...",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground...",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
```

**Angular (button.component.ts):**
```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn.util';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [attr.data-slot]="'button'"
      [class]="buttonClass()"
      [type]="type"
      [disabled]="disabled"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariants['variant'] = 'default';
  @Input() size: ButtonVariants['size'] = 'default';
  @Input() className: string = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;

  buttonClass() {
    return cn(buttonVariants({ 
      variant: this.variant, 
      size: this.size, 
      className: this.className 
    }));
  }
}
```

### 4. Migración de Componentes Principales

#### Login Component

**Estructura React → Angular:**

React usa:
- `useState` para estado local
- Props: `onLogin`, `onNavigate`
- Eventos: `onClick`, `onChange`, `onSubmit`

Angular usa:
- `signal()` para estado reactivo
- `@Input()` para props
- `@Output()` EventEmitter para eventos
- `inject()` para servicios

**Template (login.component.html):**
```html
<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 flex items-center justify-center p-3 sm:p-4">
  <div class="absolute top-3 left-3 sm:top-4 sm:left-4">
    <app-button 
      variant="ghost" 
      (click)="navigateHome()"
      className="gap-1 sm:gap-2 text-white hover:text-white hover:bg-white/10 text-xs sm:text-sm px-2 sm:px-4 h-9 sm:h-10"
    >
      <lucide-icon name="arrow-left" [size]="16" class="sm:w-4 sm:h-4"></lucide-icon>
      <span class="hidden sm:inline">Volver al inicio</span>
      <span class="sm:hidden">Volver</span>
    </app-button>
  </div>
  
  <app-card className="w-full max-w-md mx-auto">
    <app-card-header className="text-center">
      <div class="flex justify-center mb-4">
        <img 
          [src]="logoLotus" 
          alt="Lotus Body Car Logo" 
          class="w-20 h-20 sm:w-24 sm:h-24 object-contain"
        />
      </div>
      <app-card-title className="text-xl sm:text-2xl">Iniciar Sesión</app-card-title>
      <app-card-description>
        Ingresa a tu cuenta de Lotus Body Car
      </app-card-description>
    </app-card-header>

    <form (ngSubmit)="handleSubmit($event)">
      <app-card-content className="space-y-4">
        @if (error()) {
          <app-alert variant="destructive">
            <lucide-icon name="alert-circle" [size]="16"></lucide-icon>
            <app-alert-title>Error</app-alert-title>
            <app-alert-description>{{ error() }}</app-alert-description>
          </app-alert>
        }

        <div class="space-y-2">
          <app-label for="email">
            <lucide-icon name="mail" [size]="16" class="mr-2"></lucide-icon>
            Correo Electrónico
          </app-label>
          <app-input
            id="email"
            type="email"
            placeholder="tu@email.com"
            [value]="email()"
            (input)="email.set($any($event.target).value)"
            required
          />
        </div>

        <div class="space-y-2">
          <app-label for="password">
            <lucide-icon name="lock" [size]="16" class="mr-2"></lucide-icon>
            Contraseña
          </app-label>
          <div class="relative">
            <app-input
              id="password"
              [type]="showPassword() ? 'text' : 'password'"
              placeholder="••••••••"
              [value]="password()"
              (input)="password.set($any($event.target).value)"
              required
            />
            <button
              type="button"
              (click)="showPassword.set(!showPassword())"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              @if (showPassword()) {
                <lucide-icon name="eye-off" [size]="18"></lucide-icon>
              } @else {
                <lucide-icon name="eye" [size]="18"></lucide-icon>
              }
            </button>
          </div>
        </div>
      </app-card-content>

      <app-card-footer className="flex-col gap-4">
        <app-button type="submit" className="w-full">
          Iniciar Sesión
        </app-button>
        
        <p class="text-center text-sm text-gray-600">
          ¿No tienes cuenta?
          <button 
            type="button"
            (click)="navigateToRegister()"
            class="text-red-600 hover:text-red-700 ml-1"
          >
            Regístrate aquí
          </button>
        </p>
      </app-card-footer>
    </form>
  </app-card>
</div>
```

**Component (login.component.ts):**
```typescript
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-angular';
import { AppStateService } from '../../services/app-state.service';
import { User } from '../../models/user.model';
import { ButtonComponent } from '../shared/ui/button/button.component';
import { InputComponent } from '../shared/ui/input/input.component';
import { CardComponent } from '../shared/ui/card/card.component';
import { LabelComponent } from '../shared/ui/label/label.component';
import { AlertComponent } from '../shared/ui/alert/alert.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ButtonComponent,
    InputComponent,
    CardComponent,
    LabelComponent,
    AlertComponent
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private appState = inject(AppStateService);
  
  readonly ArrowLeft = ArrowLeft;
  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly AlertCircle = AlertCircle;
  
  email = signal('');
  password = signal('');
  showPassword = signal(false);
  error = signal('');
  logoLotus = 'assets/logo-lotus.png'; // Copiar imagen a assets/

  handleSubmit(e: Event) {
    e.preventDefault();
    this.error.set('');

    if (!this.email() || !this.password()) {
      this.error.set('Por favor completa todos los campos');
      return;
    }

    // Mock login - HU-002
    const mockUser: User = {
      id: '1',
      name: 'Juan Pérez',
      email: this.email(),
      role: 'seller',
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
```

### 5. Componente Principal App

**app.html:**
```html
<div class="min-h-screen bg-gray-50">
  @switch (currentView()) {
    @case ('home') {
      <app-home />
    }
    @case ('login') {
      <app-login />
    }
    @case ('register') {
      <app-register />
    }
    @case ('product-detail') {
      <app-product-detail />
    }
    @case ('cart') {
      <app-shopping-cart />
    }
    @case ('seller-dashboard') {
      <app-seller-dashboard />
    }
    @case ('publish') {
      <app-publish-product />
    }
    @case ('admin') {
      <app-admin-dashboard />
    }
    @case ('payment-confirmation') {
      <app-payment-confirmation />
    }
  }
</div>
```

**app.ts:**
```typescript
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from './services/app-state.service';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';
import { SellerDashboardComponent } from './components/seller-dashboard/seller-dashboard.component';
import { PublishProductComponent } from './components/publish-product/publish-product.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { PaymentConfirmationComponent } from './components/payment-confirmation/payment-confirmation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ProductDetailComponent,
    ShoppingCartComponent,
    SellerDashboardComponent,
    PublishProductComponent,
    AdminDashboardComponent,
    PaymentConfirmationComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  private appState = inject(AppStateService);
  currentView = this.appState.currentView;
}
```

### 6. Diferencias Clave React vs Angular

| Concepto | React | Angular |
|----------|-------|---------|
| **Estado** | `useState` | `signal()` |
| **Props** | Props directas | `@Input()` |
| **Eventos** | Callbacks | `@Output()` EventEmitter |
| **Servicios** | Context/Props | `inject()` o constructor |
| **Condicionales** | `{condition && <Component />}` | `@if (condition) { }` |
| **Listas** | `map()` | `@for (item of items; track item.id) { }` |
| **Estilos** | `className` | `class` o `[class]` |
| **Eventos** | `onClick` | `(click)` |
| **Bindings** | `value={state}` | `[value]="state()"` |
| **Two-way** | `onChange` + `value` | `[(ngModel)]` o signals |

### 7. Comandos para Generar Componentes

```bash
# Componentes principales
ng generate component components/home --standalone
ng generate component components/login --standalone
ng generate component components/register --standalone
ng generate component components/product-detail --standalone
ng generate component components/shopping-cart --standalone
ng generate component components/seller-dashboard --standalone
ng generate component components/publish-product --standalone
ng generate component components/admin-dashboard --standalone
ng generate component components/payment-confirmation --standalone

# Header
ng generate component components/shared/header --standalone

# Componentes UI
ng generate component components/shared/ui/button --standalone
ng generate component components/shared/ui/input --standalone
ng generate component components/shared/ui/card --standalone
ng generate component components/shared/ui/label --standalone
ng generate component components/shared/ui/badge --standalone
ng generate component components/shared/ui/alert --standalone
ng generate component components/shared/ui/dropdown-menu --standalone
ng generate component components/shared/ui/select --standalone
ng generate component components/shared/ui/sheet --standalone
ng generate component components/shared/ui/checkbox --standalone
ng generate component components/shared/ui/radio-group --standalone
ng generate component components/shared/ui/separator --standalone
ng generate component components/shared/ui/table --standalone
ng generate component components/shared/ui/tabs --standalone
ng generate component components/shared/ui/dialog --standalone
```

### 8. Configuración de Lucide Icons

En Angular, lucide-angular funciona diferente. Necesitas registrar los iconos:

**app.config.ts:**
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { LucideAngularModule, icons } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes)
  ]
};
```

**En cada componente que use iconos:**
```typescript
import { LucideAngularModule, Home, User, ShoppingCart } from 'lucide-angular';

@Component({
  imports: [LucideAngularModule],
  // ...
})
export class MyComponent {
  readonly Home = Home;
  readonly User = User;
  readonly ShoppingCart = ShoppingCart;
}
```

**En el template:**
```html
<lucide-icon [img]="Home" [size]="24"></lucide-icon>
```

### 9. Manejo de Imágenes de Figma

Las imágenes con `figma:asset/...` necesitan ser copiadas a la carpeta `src/assets/` del proyecto Angular.

**React:**
```tsx
import logoLotus from 'figma:asset/ef6bdbda28846a4a6dc3fed90c4fb98829d97544.png';
```

**Angular:**
```typescript
logoLotus = 'assets/logo-lotus.png';
```

Debes:
1. Exportar las imágenes de Figma
2. Copiarlas a `project-angular/src/assets/`
3. Referenciarlas como `assets/nombre-imagen.png`

### 10. Ejecutar el Proyecto

```bash
cd project-angular
npm start
# o
ng serve
```

El proyecto estará disponible en `http://localhost:4200`

## 📝 Checklist de Migración

### Componentes UI
- [ ] Button
- [ ] Input  
- [ ] Card (+ subcomponentes)
- [ ] Label
- [ ] Badge
- [ ] Alert (+ subcomponentes)
- [ ] DropdownMenu
- [ ] Select
- [ ] Sheet
- [ ] Checkbox
- [ ] RadioGroup
- [ ] Separator
- [ ] Table
- [ ] Tabs
- [ ] Dialog

### Componentes Principales
- [ ] Header
- [ ] Home
- [ ] Login
- [ ] Register
- [ ] ProductDetail
- [ ] ShoppingCart
- [ ] SellerDashboard
- [ ] PublishProduct
- [ ] AdminDashboard
- [ ] PaymentConfirmation

### Assets
- [ ] Copiar logo-lotus.png
- [ ] Copiar todas las imágenes de productos
- [ ] Copiar iconos/assets adicionales

### Funcionalidad
- [ ] Navegación entre vistas
- [ ] Login/Logout
- [ ] Registro de usuario
- [ ] Validación de formularios
- [ ] Carrito de compras
- [ ] Filtros y búsqueda
- [ ] Dashboard de vendedor
- [ ] Dashboard de admin
- [ ] Publicación de productos
- [ ] Detalle de producto
- [ ] Confirmación de pago

### Responsive
- [ ] Mobile (< 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (> 1024px)
- [ ] Breakpoints: sm, md, lg, xl

## 🎯 Próximos Pasos Recomendados

1. **Crear todos los componentes UI básicos** (Button, Input, Card, Label, Badge, Alert)
2. **Crear componente Header** (usado en todas las páginas)
3. **Migrar componente Home** (página principal con listado de productos)
4. **Migrar Login y Register** (autenticación)
5. **Migrar componentes restantes** uno por uno
6. **Copiar assets** (imágenes, logos)
7. **Probar funcionalidad** en diferentes resoluciones
8. **Ajustar estilos** si es necesario

## 💡 Consejos

- **Usa signals** en lugar de observables para estado simple
- **Standalone components** son más modernos y fáciles de usar
- **Control flow syntax** (@if, @for, @switch) es más legible que *ngIf, *ngFor
- **Inject()** function es más moderna que constructor injection
- **Mantén la misma estructura de clases CSS** para que los estilos sean idénticos
- **Reutiliza buttonVariants y otras utilidades CVA** exactamente igual que en React

## ⚠️ Consideraciones Importantes

1. **No uses NgModules** - el proyecto usa componentes standalone
2. **FormsModule** solo si usas ngModel (preferible usar signals)
3. **CommonModule** necesario en cada componente standalone
4. **Track function** obligatorio en @for para performance
5. **Type safety** - Angular es más estricto con tipos que React

