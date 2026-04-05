/**
 * SweetAlert2 — Tema Lotus Body Car
 * Paleta: rojo-600 (#dc2626), gris-900 (#111827), bordes redondeados 12px
 */
import Swal from 'sweetalert2';

const LotusTheme = Swal.mixin({
  customClass: {
    popup:
      'rounded-xl border border-gray-100 shadow-2xl font-sans',
    confirmButton:
      'bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
    cancelButton:
      'bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-2.5 rounded-lg text-sm border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2',
    denyButton:
      'bg-gray-800 hover:bg-gray-900 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors',
    title: 'text-gray-900 text-lg font-bold',
    htmlContainer: 'text-gray-600 text-sm',
    icon: 'border-0',
    actions: 'gap-3',
  },
  buttonsStyling: false,
  reverseButtons: false,
  focusConfirm: false,
});

// ── Alertas simples ────────────────────────────────────────────────────────────

export const lotusSuccess = (title: string, text?: string) =>
  LotusTheme.fire({
    icon: 'success',
    title,
    text,
    iconColor: '#16a34a',
    timer: 2500,
    timerProgressBar: true,
    showConfirmButton: false,
  });

export const lotusError = (title: string, text?: string) =>
  LotusTheme.fire({
    icon: 'error',
    title,
    text,
    iconColor: '#dc2626',
    confirmButtonText: 'Entendido',
  });

export const lotusWarning = (title: string, text?: string) =>
  LotusTheme.fire({
    icon: 'warning',
    title,
    text,
    iconColor: '#d97706',
    confirmButtonText: 'Aceptar',
  });

export const lotusInfo = (title: string, text?: string) =>
  LotusTheme.fire({
    icon: 'info',
    title,
    text,
    iconColor: '#2563eb',
    confirmButtonText: 'Aceptar',
  });

// ── Confirmaciones ─────────────────────────────────────────────────────────────

export const lotusConfirm = (
  title: string,
  text: string,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
) =>
  LotusTheme.fire({
    icon: 'question',
    title,
    text,
    iconColor: '#dc2626',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });

export const lotusConfirmDanger = (
  title: string,
  text: string,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar'
) =>
  LotusTheme.fire({
    icon: 'warning',
    iconColor: '#dc2626',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    customClass: {
      popup: 'rounded-xl border border-gray-100 shadow-2xl font-sans',
      confirmButton:
        'bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
      cancelButton:
        'bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-2.5 rounded-lg text-sm border border-gray-300 transition-colors',
      title: 'text-gray-900 text-lg font-bold',
      htmlContainer: 'text-gray-600 text-sm',
      icon: 'border-0',
      actions: 'gap-3',
    },
  });

// ── Toast ligero (esquina superior derecha) ────────────────────────────────────

const LotusToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: {
    popup: 'rounded-xl shadow-lg text-sm font-sans pr-4',
  },
  buttonsStyling: false,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

export const toastSuccess = (title: string) =>
  LotusToast.fire({ icon: 'success', title, iconColor: '#16a34a' });

export const toastError = (title: string) =>
  LotusToast.fire({ icon: 'error', title, iconColor: '#dc2626' });

export const toastInfo = (title: string) =>
  LotusToast.fire({ icon: 'info', title, iconColor: '#2563eb' });

export const toastWarning = (title: string) =>
  LotusToast.fire({ icon: 'warning', title, iconColor: '#d97706' });
