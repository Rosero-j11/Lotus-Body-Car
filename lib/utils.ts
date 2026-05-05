// ─── Debounce ─────────────────────────────────────────────────────────────────
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ─── Reset token ──────────────────────────────────────────────────────────────
export function generateResetToken(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function saveResetToken(email: string, token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    'lotus_reset_token',
    JSON.stringify({ token, email, createdAt: Date.now() })
  );
}

export function validateResetToken(token: string): { valid: boolean; email?: string; reason?: string } {
  if (typeof window === 'undefined') return { valid: false, reason: 'server' };
  const raw = localStorage.getItem('lotus_reset_token');
  if (!raw) return { valid: false, reason: 'not_found' };
  try {
    const data = JSON.parse(raw) as { token: string; email: string; createdAt: number };
    if (data.token !== token) return { valid: false, reason: 'invalid' };
    const FIFTEEN_MINUTES = 15 * 60 * 1000;
    if (Date.now() - data.createdAt > FIFTEEN_MINUTES) return { valid: false, reason: 'expired' };
    return { valid: true, email: data.email };
  } catch {
    return { valid: false, reason: 'invalid' };
  }
}

export function consumeResetToken(): void {
  if (typeof window !== 'undefined') localStorage.removeItem('lotus_reset_token');
}

// ─── Stored passwords (demo) ────────────────────────────────────────────────────
const PW_PREFIX = 'lotus_pw_';

export function saveUserPassword(email: string, password: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PW_PREFIX + email, password);
}

export function getUserPassword(email: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PW_PREFIX + email);
}

// ─── Login attempts ───────────────────────────────────────────────────────────
const ATTEMPTS_KEY = 'lotus_login_attempts';
const BLOCK_DURATION = 15 * 60 * 1000; // 15 min

export interface LoginAttempts {
  count: number;
  lastAttempt: number;
  blockedUntil?: number;
}

export function getLoginAttempts(): LoginAttempts {
  if (typeof window === 'undefined') return { count: 0, lastAttempt: 0 };
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return { count: 0, lastAttempt: 0 };
    
    const parsed = JSON.parse(raw) as LoginAttempts;
    
    // Si ya pasó el tiempo de bloqueo, o pasó mucho tiempo desde el último intento (15 min), se resetea
    if (
      (parsed.blockedUntil && Date.now() > parsed.blockedUntil) ||
      (Date.now() - parsed.lastAttempt > BLOCK_DURATION)
    ) {
      localStorage.removeItem(ATTEMPTS_KEY);
      return { count: 0, lastAttempt: 0 };
    }
    
    return parsed;
  } catch {
    return { count: 0, lastAttempt: 0 };
  }
}

export function recordFailedAttempt(): LoginAttempts {
  const current = getLoginAttempts();
  const count = current.count + 1;
  const blockedUntil = count >= 3 ? Date.now() + BLOCK_DURATION : current.blockedUntil;
  const updated: LoginAttempts = { count, lastAttempt: Date.now(), blockedUntil };
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(updated));
  return updated;
}

export function clearLoginAttempts(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(ATTEMPTS_KEY);
}

export function isLoginBlocked(): { blocked: boolean; remainingMs?: number } {
  const attempts = getLoginAttempts();
  if (attempts.blockedUntil && Date.now() < attempts.blockedUntil) {
    return { blocked: true, remainingMs: attempts.blockedUntil - Date.now() };
  }
  return { blocked: false };
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-CO');
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function validatePassword(password: string): string[] {
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
