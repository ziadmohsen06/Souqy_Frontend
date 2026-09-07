import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const isAr = i18n.language === 'ar';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />
      <div className={`fixed inset-y-0 ${isAr ? 'left-0' : 'right-0'} max-w-full flex`}>
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-colors duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('cart.title')}</h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                  <ShoppingBag className="w-10 h-10 opacity-50" />
                </div>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mb-1">{t('cart.empty')}</p>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 items-center"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-200 dark:bg-slate-700 shrink-0 shadow-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {isAr && product.nameAr ? product.nameAr : product.name}
                    </h4>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-200 mt-0.5">
                      {formatPrice(product.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-5 text-center text-slate-900 dark:text-slate-100">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between text-base font-bold text-slate-900 dark:text-slate-100">
                <span>{t('cart.subtotal')}</span>
                <span className="text-slate-900 dark:text-white text-lg">{formatPrice(getTotalPrice())}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('cart.tax')}</p>
              <button
                onClick={() => {
                  closeCart();
                  navigate('/checkout');
                }}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold rounded-xl transition-all shadow-md cursor-pointer text-sm text-center"
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
