import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/features/cart/useCart';
import { CartLineItem } from '@/features/cart/CartLineItem';
import { cn, formatPrice } from '@/lib/utils';

/**
 * Quick-view cart drawer opened from the navbar / after "Add to bag".
 * Full review + totals happen on /cart.
 */
export const CartDrawer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const { items, isOpen, closeCart, subtotal, itemCount, amountToFreeShipping } = useCart();

  // Esc closes, and lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const goToCart = () => {
    closeCart();
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label={t('cart.title')}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={closeCart} />
      <div className={cn('fixed inset-y-0 flex max-w-full', isAr ? 'left-0' : 'right-0')}>
        <div className="w-screen max-w-md bg-card border-s border-border shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">
                {t('cart.title')} {itemCount > 0 && <span className="text-muted-foreground font-medium">({itemCount})</span>}
              </h2>
            </div>
            <button onClick={closeCart} className="p-1.5 rounded-full text-muted-foreground hover:bg-muted" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-4">
                <ShoppingBag className="w-16 h-16 stroke-1 opacity-40" />
                <p className="text-base font-medium">{t('cart.empty')}</p>
                <Link to="/products" onClick={closeCart} className="text-sm font-semibold text-primary hover:underline">
                  {t('cart.continue_shopping')}
                </Link>
              </div>
            ) : (
              items.map((line) => <CartLineItem key={line.lineId} line={line} compact />)
            )}
          </div>

          {items.length > 0 && (
            <div className="p-5 border-t border-border bg-muted/20 space-y-3">
              {amountToFreeShipping > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Add <span className="font-semibold text-foreground">{formatPrice(amountToFreeShipping)}</span> more for free shipping
                </p>
              ) : (
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Free shipping unlocked</p>
              )}
              <div className="flex items-center justify-between text-base font-bold text-foreground">
                <span>{t('cart.subtotal')}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{t('cart.tax')}</p>
              <button
                onClick={goToCart}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                View bag & checkout
                <ArrowRight className={cn('w-4 h-4', isAr && 'rotate-180')} />
              </button>
              <button onClick={closeCart} className="w-full py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                {t('cart.continue_shopping')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
