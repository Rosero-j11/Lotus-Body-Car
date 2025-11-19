export type View = 'home' | 'login' | 'register' | 'product-detail' | 'cart' | 'seller-dashboard' | 'publish' | 'admin' | 'payment-confirmation';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  avatar?: string;
}
