import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { ProductDetail } from './components/product-detail/product-detail';
import { ShoppingCart } from './components/shopping-cart/shopping-cart';
import { PaymentConfirmation } from './components/payment-confirmation/payment-confirmation';
import { PublishProduct } from './components/publish-product/publish-product';
import { SellerDashboard } from './components/seller-dashboard/seller-dashboard';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'product/:id', component: ProductDetail },
  { path: 'cart', component: ShoppingCart },
  { path: 'payment', component: PaymentConfirmation },
  { path: 'publish', component: PublishProduct },
  { path: 'seller-dashboard', component: SellerDashboard },
  { path: 'admin-dashboard', component: AdminDashboard },
  { path: '**', redirectTo: '' }
];
