# Scripts de Comandos para Completar la Migración

## Comandos para Generar Componentes UI Faltantes

```bash
# Navegar al proyecto Angular
cd c:\Users\david\OneDrive\Documentos\ing_Software\Front\project-angular

# Generar componentes UI adicionales necesarios
ng g c components/shared/ui/dropdown-menu --standalone --skip-tests
ng g c components/shared/ui/select --standalone --skip-tests
ng g c components/shared/ui/sheet --standalone --skip-tests
ng g c components/shared/ui/checkbox --standalone --skip-tests
ng g c components/shared/ui/radio-group --standalone --skip-tests
ng g c components/shared/ui/separator --standalone --skip-tests
ng g c components/shared/ui/table --standalone --skip-tests
ng g c components/shared/ui/tabs --standalone --skip-tests
ng g c components/shared/ui/dialog --standalone --skip-tests
ng g c components/shared/ui/textarea --standalone --skip-tests
ng g c components/shared/ui/switch --standalone --skip-tests
```

## Copiar Assets del Proyecto React

```bash
# Desde el proyecto Angular
cd c:\Users\david\OneDrive\Documentos\ing_Software\Front\project-angular

# Crear directorio assets si no existe
mkdir src\assets

# Copiar imágenes (ejecutar manualmente desde explorador de Windows)
# Desde: c:\Users\david\OneDrive\Documentos\ing_Software\Front\project\
# A: c:\Users\david\OneDrive\Documentos\ing_Software\Front\project-angular\src\assets\

# Buscar archivos de imagen en el proyecto React
# Copiar logo-lotus.png y cualquier otra imagen
```

## Ejecutar el Proyecto

```bash
# Navegar al proyecto
cd c:\Users\david\OneDrive\Documentos\ing_Software\Front\project-angular

# Instalar dependencias (si aún no están instaladas)
npm install

# Ejecutar servidor de desarrollo
ng serve

# O usar npm start
npm start

# Abrir en navegador
# http://localhost:4200
```

## Build de Producción

```bash
# Construir para producción
ng build

# Los archivos se generarán en dist/project-angular/
```

## Comandos de Desarrollo

```bash
# Generar nuevo componente
ng generate component components/nombre --standalone --skip-tests
# o forma corta:
ng g c components/nombre --standalone --skip-tests

# Generar nuevo servicio
ng generate service services/nombre
# o forma corta:
ng g s services/nombre

# Generar nueva interfaz/modelo
ng generate interface models/nombre
# o forma corta:
ng g i models/nombre

# Generar directiva
ng generate directive directives/nombre --standalone
# o forma corta:
ng g d directives/nombre --standalone

# Generar pipe
ng generate pipe pipes/nombre --standalone
# o forma corta:
ng g p pipes/nombre --standalone
```

## Verificar Estado del Proyecto

```bash
# Ver versión de Angular
ng version

# Ver dependencias instaladas
npm list --depth=0

# Verificar si hay actualizaciones
npm outdated

# Ejecutar linter (si está configurado)
ng lint

# Ejecutar tests (si están configurados)
ng test
```

## Instalar Dependencias Adicionales (Si son Necesarias)

```bash
# Si necesitas @angular/forms para formularios
npm install @angular/forms

# Si necesitas date-fns para manejo de fechas
npm install date-fns

# Si necesitas rxjs operators adicionales (ya incluido en Angular)
# npm install rxjs

# Si necesitas animaciones de Angular
npm install @angular/animations
```

## Comandos de Git (Opcional)

```bash
# Inicializar repositorio git en el proyecto Angular
cd c:\Users\david\OneDrive\Documentos\ing_Software\Front\project-angular
git init

# Añadir todos los archivos
git add .

# Hacer primer commit
git commit -m "Initial commit - Migración de React a Angular"

# Añadir origen remoto (reemplazar con tu URL)
git remote add origin https://github.com/tu-usuario/tu-repo.git

# Push a GitHub
git push -u origin main
```

## Debugging

```bash
# Ejecutar con source maps detallados
ng serve --source-map

# Ejecutar en modo de producción local
ng serve --configuration production

# Ejecutar en un puerto específico
ng serve --port 4300

# Abrir automáticamente en navegador
ng serve --open
# o forma corta:
ng serve -o
```

## Actualización de Paquetes

```bash
# Actualizar Angular CLI globalmente
npm install -g @angular/cli@latest

# Actualizar Angular en el proyecto
ng update @angular/core @angular/cli

# Actualizar dependencias del proyecto
npm update

# Verificar vulnerabilidades
npm audit

# Arreglar vulnerabilidades automáticamente
npm audit fix
```

## Limpiar y Reinstalar

```bash
# Si hay problemas, limpiar node_modules y reinstalar
rmdir /s /q node_modules
del package-lock.json
npm install

# Limpiar caché de npm
npm cache clean --force

# Limpiar build de Angular
rmdir /s /q dist
rmdir /s /q .angular
```

## Análisis de Bundle

```bash
# Construir con stats para analizar
ng build --stats-json

# Luego usar webpack-bundle-analyzer
npm install -g webpack-bundle-analyzer
webpack-bundle-analyzer dist/project-angular/stats.json
```

## Variables de Entorno

```bash
# Ejecutar con configuración de desarrollo
ng serve --configuration development

# Ejecutar con configuración de producción
ng serve --configuration production

# Crear configuración personalizada en angular.json
# y usarla con:
ng serve --configuration custom
```

## Scripts NPM Útiles (Añadir a package.json)

Añade estos scripts en `package.json`:

```json
{
  "scripts": {
    "start": "ng serve",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "watch": "ng build --watch --configuration development",
    "serve:prod": "ng serve --configuration production",
    "lint": "ng lint",
    "format": "prettier --write \"src/**/*.{ts,html,css,scss}\"",
    "analyze": "ng build --stats-json && webpack-bundle-analyzer dist/project-angular/stats.json"
  }
}
```

Luego puedes usar:
```bash
npm run build:prod
npm run serve:prod
npm run format
```

## Solución de Problemas Comunes

### Error: Port 4200 is already in use
```bash
# Usar puerto diferente
ng serve --port 4300

# O matar proceso en puerto 4200
netstat -ano | findstr :4200
taskkill /PID [número_del_proceso] /F
```

### Error: Cannot find module
```bash
# Reinstalar dependencias
npm install
```

### Error: Tailwind styles not working
```bash
# Verificar configuración de Tailwind
# 1. Verificar tailwind.config.js
# 2. Verificar que styles.css tenga las directivas @tailwind
# 3. Reiniciar servidor
```

### Error: Lucide icons not showing
```bash
# Asegurarse de importar los iconos en el componente
# import { LucideAngularModule, Home, User } from 'lucide-angular';
```

## Información del Sistema

```bash
# Ver versiones de Node y npm
node --version
npm --version

# Ver versión de Angular CLI
ng version

# Ver información del sistema
systeminfo
```

---

## Resumen de Comandos Más Usados

```bash
# Ir al proyecto
cd c:\Users\david\OneDrive\Documentos\ing_Software\Front\project-angular

# Instalar dependencias
npm install

# Ejecutar desarrollo
ng serve

# Generar componente
ng g c components/nombre --standalone --skip-tests

# Build producción
ng build

# Abrir en VS Code
code .
```

¡Copia y ejecuta estos comandos según necesites! 🚀
