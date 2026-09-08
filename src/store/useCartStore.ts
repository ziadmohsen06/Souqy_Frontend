import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

/**
 * Cart store (client-side, persisted to localStorage).
 *
 * A "line" is identified by product id + selected size + selected color, so the
 * same product in two sizes shows up as two rows – the way Noon/Amazon do it.
 *
 * The backend has a Cart entity but no endpoint yet; when it lands, the only
 * thing that changes is that these actions also fire a request.
 */

export interface CartLine extends CartItem {
  /** Stable key: `${productId}::${size}::${color}` */
  lineId: string;
}

export const makeLineId = (productId: string, size?: string, color?: string) =>
  `${productId}::${size ?? ''}::${color ?? ''}`;

interface CartState {
  items: CartLine[];
  isOpen: boolean;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  addItem: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;

  getTotalItems: () => number;
  getTotalPrice: () => number;
  getLine: (lineId: string) => CartLine | undefined;
}

const clampToStock = (qty: number, stock: number) => Math.max(0, Math.min(qty, stock || Infinity));

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product, quantity = 1, selectedColor, selectedSize) => {
        const lineId = makeLineId(product.id, selectedSize, selectedColor);
        set((state) => {
          const existing = state.items.find((i) => i.lineId === lineId);
          if (existing) {
            // Immutable update (the previous version mutated state in place,
            // which broke persistence + re-renders in some cases).
            return {
              items: state.items.map((i) =>
                i.lineId === lineId
                  ? { ...i, quantity: clampToStock(i.quantity + quantity, product.stock) }
                  : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [
              ...state.items,
              {
                lineId,
                product,
                quantity: clampToStock(quantity, product.stock),
                selectedColor,
                selectedSize,
              },
            ],
            isOpen: true,
          };
        });
      },

      removeItem: (lineId) =>
        set((state) => ({ items: state.items.filter((i) => i.lineId !== lineId) })),

      updateQuantity: (lineId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.lineId !== lineId) };
          }
          return {
            items: state.items.map((i) =>
              i.lineId === lineId ? { ...i, quantity: clampToStock(quantity, i.product.stock) } : i
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((n, i) => n + i.quantity, 0),
      getTotalPrice: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      getLine: (lineId) => get().items.find((i) => i.lineId === lineId),
    }),
    {
      name: 'cart-storage',
      version: 2,
      // Migrate carts saved by the previous store shape (no lineId).
      migrate: (persisted) => {
        const state = persisted as Partial<CartState> & { items?: Partial<CartLine>[] };
        return {
          ...state,
          items: (state.items ?? [])
            .filter((i): i is CartLine => Boolean(i && i.product))
            .map((i) => ({
              ...i,
              lineId: i.lineId ?? makeLineId(i.product.id, i.selectedSize, i.selectedColor),
            })),
        } as CartState;
      },
      partialize: (state) => ({ items: state.items }) as CartState,
    }
  )
);
