import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/features/cart/useCart';
import { CartLineItem } from '@/features/cart/CartLineItem';
import { OrderSummary } from '@/features/cart/OrderSummary';
import { useProducts } from '@/features/products/hooks/useProducts';
import { ProductCard } from '@/features/products/ProductCard';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

/**
 * Full-page cart (/cart). The header drawer is the quick view; this page is
 * where users review quantities, options and totals before checkout.
 */
export const CartPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const { items, itemCount, isEmpty, clearCart } = useCart();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // "You may also like" – a handful of products not already in the bag.
  const { data: suggestions } = useProducts({ page: 1, pageSize: 8 });
  const inCartIds = new Set(items.map((i) => i.product.id));
  const recommended = (suggestions?.items ?? []).filter((p) => !inCartIds.has(p.id)).slice(0, 4);

  const handleCheckout = () => {
    // Checkout flow belongs to the checkout/auth work stream. We hand off here.
    if (!isAuthenticated) {
      toast.info('Sign in to continue to checkout', { description: 'Your bag is saved on this device.' });
    }
    navigate('/checkout');
  };

  const handleClear = () => {
    if (!window.confirm('Remove all items from your bag?')) return;
    clearCart();
    toast('Bag cleared');
  };

  if (isEmpty) {
    return (
      <div className="pb-20">
        <div className="flex flex-col items-center justify-center text-center py-20 space-y-4">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/60" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-extrabold">{t('cart.empty')}</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            Looks like you haven't added anything yet. Explore the catalog and find something you love.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 mt-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90"
          >
            {t('cart.continue_shopping')}
            <ArrowRight className={cn('w-4 h-4', isAr && 'rotate-180')} />
          </Link>
        </div>

        {recommended.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xl font-extrabold tracking-tight">Popular right now</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {recommended.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-14">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t('cart.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your bag
          </p>
        </div>
        <button
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">
        {/* Lines */}
        <section className="rounded-2xl border border-border bg-card px-6 divide-y divide-border">
          {items.map((line) => (
            <CartLineItem key={line.lineId} line={line} />
          ))}
          <div className="py-4 flex items-center justify-between">
            <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              <ArrowRight className={cn('w-4 h-4', !isAr && 'rotate-180')} />
              {t('cart.continue_shopping')}
            </Link>
          </div>
        </section>

        <OrderSummary onCheckout={handleCheckout} />
      </div>

      {recommended.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recommended.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
};
