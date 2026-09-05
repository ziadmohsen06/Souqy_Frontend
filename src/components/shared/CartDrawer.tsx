import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';

export const CartDrawer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const isAr = i18n.language === 'ar';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex ltr:pl-10 rtl:pr-10">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">{t('cart.title')}</h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-full text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <ShoppingBag className="w-16 h-16 stroke-1 opacity-40 mb-4" />
                <p className="text-base font-medium">{t('cart.empty')}</p>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-3 bg-muted/40 rounded-xl border border-border/50 items-center"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover bg-muted shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {isAr && product.nameAr ? product.nameAr : product.name}
                    </h4>
                    <p className="text-xs text-primary font-bold mt-1">
                      {formatPrice(product.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-6 h-6 rounded-md bg-background border border-border flex items-center justify-center text-foreground hover:bg-muted"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold w-4 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-6 h-6 rounded-md bg-background border border-border flex items-center justify-center text-foreground hover:bg-muted"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t border-border bg-muted/20 space-y-4">
              <div className="flex items-center justify-between text-base font-bold text-foreground">
                <span>{t('cart.subtotal')}</span>
                <span className="text-primary">{formatPrice(getTotalPrice())}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t('cart.tax')}</p>
              <button
                onClick={() => {
                  alert('Checkout integration ready!');
                }}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              >
                {t('cart.checkout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
