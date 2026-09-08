import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import '@/i18n/config';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { Toaster } from '@/components/ui/sonner';
import { MainLayout } from '@/layouts/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { WishlistPage } from '@/pages/WishlistPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { CheckoutPage } from '@/pages/CheckoutPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  const { theme } = useThemeStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const prevAuth = useRef<boolean | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Keep the cart in step with auth: load the server cart on login / first mount,
  // drop local state on logout.
  useEffect(() => {
    if (isAuthenticated) {
      void useCartStore.getState().syncOnAuth();
    } else if (prevAuth.current) {
      useCartStore.getState().resetLocal();
    }
    prevAuth.current = isAuthenticated;
  }, [isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="checkout" element={<CheckoutPage />} />

          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
