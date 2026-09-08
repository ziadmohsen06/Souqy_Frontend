import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCartStore } from '@/store/useCartStore';

/** Pricing rules – kept in one place so Cart page, drawer and checkout agree. */
export const FREE_SHIPPING_THRESHOLD = 100;
export const SHIPPING_FEE = 7.99;
export const TAX_RATE = 0.14; // 14% VAT (Egypt)

/**
 * Cart facade hook.
 *
 * Components use this instead of reaching into the store directly, so the
 * underlying state solution (Zustand today, could be Context / server cart
 * tomorrow) is an implementation detail.
 */
export function useCart() {
  const { items, isOpen, addItem, removeItem, updateQuantity, clearCart, openCart, closeCart, toggleCart } =
    useCartStore(
      useShallow((s) => ({
        items: s.items,
        isOpen: s.isOpen,
        addItem: s.addItem,
        removeItem: s.removeItem,
        updateQuantity: s.updateQuantity,
        clearCart: s.clearCart,
        openCart: s.openCart,
        closeCart: s.closeCart,
        toggleCart: s.toggleCart,
      }))
    );

  const summary = useMemo(() => {
    const itemCount = items.reduce((n, i) => n + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const savings = items.reduce(
      (sum, i) => sum + (i.product.originalPrice ? (i.product.originalPrice - i.product.price) * i.quantity : 0),
      0
    );
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + shipping + tax;
    const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

    return { itemCount, subtotal, savings, shipping, tax, total, amountToFreeShipping };
  }, [items]);

  return {
    items,
    isOpen,
    isEmpty: items.length === 0,
    ...summary,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
  };
}
