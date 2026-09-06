import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Truck } from 'lucide-react';
import { useCart, FREE_SHIPPING_THRESHOLD, TAX_RATE } from '@/features/cart/useCart';
import { formatPrice } from '@/lib/utils';

interface Props {
  onCheckout: () => void;
  checkoutLabel?: string;
}

export const OrderSummary: React.FC<Props> = ({ onCheckout, checkoutLabel }) => {
  const { t } = useTranslation();
  const { itemCount, subtotal, savings, shipping, tax, total, amountToFreeShipping, isEmpty } = useCart();
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <aside className="rounded-2xl border border-border bg-card p-6 space-y-5 lg:sticky lg:top-24">
      <h2 className="text-lg font-bold">Order summary</h2>

      {/* Free-shipping nudge */}
      <div className="rounded-xl bg-muted/60 p-3 space-y-2">
        <p className="text-xs font-medium flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          {amountToFreeShipping > 0 ? (
            <>Add <span className="font-bold">{formatPrice(amountToFreeShipping)}</span> more for free shipping</>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">You've unlocked free shipping 🎉</span>
          )}
        </p>
        <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <dl className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">{t('cart.subtotal')} ({itemCount} {itemCount === 1 ? 'item' : 'items'})</dt>
          <dd className="font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        {savings > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <dt>Savings</dt>
            <dd className="font-semibold tabular-nums">−{formatPrice(savings)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="font-semibold tabular-nums">{shipping === 0 ? <span className="text-emerald-600 dark:text-emerald-400">Free</span> : formatPrice(shipping)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Estimated VAT ({Math.round(TAX_RATE * 100)}%)</dt>
          <dd className="font-semibold tabular-nums">{formatPrice(tax)}</dd>
        </div>
        <div className="flex justify-between pt-3 border-t border-border text-base">
          <dt className="font-bold">Total</dt>
          <dd className="font-black tabular-nums">{formatPrice(total)}</dd>
        </div>
      </dl>

      <button
        onClick={onCheckout}
        disabled={isEmpty}
        className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Lock className="w-4 h-4" />
        {checkoutLabel ?? t('cart.checkout')}
      </button>

      <p className="text-[11px] text-muted-foreground text-center">
        Secure checkout · Taxes & duties are estimates until checkout
      </p>
    </aside>
  );
};
