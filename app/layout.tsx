import type { Metadata } from 'next';
import './globals.css';
import { UserProvider } from '@/contexts/UserContext';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Lotus Body Car - Piezas Automotrices Premium',
  description:
    'Marketplace especializado en piezas de alta gama para vehículos de lujo. Compra y vende piezas automotrices premium.',
  keywords: 'piezas automotrices, BMW, Mercedes-Benz, Audi, Porsche, Ferrari, Lamborghini',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <UserProvider>
          <CartProvider>
            <Header />
            <main>{children}</main>
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
