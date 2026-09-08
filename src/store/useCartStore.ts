import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import type { CartItem, Product, ProductVariant } from '../types';
import { cartService } from '@/services/cart.service';
import { toApiError } from '@/services/api';
import { useAuthStore } from './useAuthStore';

/**
 * Cart store.
 *
 * Local Zustand state is the optimistic UI layer. When the user is authenticated
 * every mutation is mirrored to the backend CartController and the server cart is
 * the source of truth:
 *   - addItem     → POST   /api/v1/cart/items
 *   - removeItem  → DELETE /api/v1/cart/items/{serverId}
 *   - syncOnAuth  → GET    /api/v1/cart   (on login / app mount)
 *
 * A guest builds a local bag (persisted to localStorage); on first login it is
 * pushed up to the server and then replaced by the authoritative server cart.
 */

export interface CartLine extends CartItem {
  /** Stable local key — the product variant GUID. */
  lineId: string;
  /** Backend CartItem id once this line is synced; undefined while guest/pending. */
  serverId?: string;
}

interface CartState {
  items: CartLine[];
  isOpen: boolean;
  isSyncing: boolean;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  addItem: (product: Product, variant: ProductVariant, quantity?: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;

  /** Pull the server cart (merging any guest lines first). Call on login / mount. */
  syncOnAuth: () => Promise<void>;
  /** Drop local state — used on logout. */
  resetLocal: () => void;

  getTotalItems: () => number;
  getTotalPrice: () => number;
  getLine: (lineId: string) => CartLine | undefined;
}

const isAuthed = () => useAuthStore.getState().isAuthenticated;

const clampToStock = (qty: number, stock: number) => Math.max(0, Math.min(qty, stock || Infinity));

const lineFromProduct = (product: Product, variant: ProductVariant, quantity: number): CartLine => ({
  lineId: variant.id,
  product,
  variantId: variant.id,
  quantity: clampToStock(quantity, variant.stock),
  selectedColor: variant.color || undefined,
  selectedSize: variant.size || undefined,
});

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isSyncing: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: async (product, variant, quantity = 1) => {
        // Optimistic local update.
        const prev = get().items;
        const existing = prev.find((i) => i.lineId === variant.id);
        set({
          items: existing
            ? prev.map((i) =>
                i.lineId === variant.id
                  ? { ...i, quantity: clampToStock(i.quantity + quantity, variant.stock) }
                  : i
              )
            : [...prev, lineFromProduct(product, variant, quantity)],
          isOpen: true,
        });

        if (!isAuthed()) return;

        try {
          const dto = await cartService.addItem({
            productId: product.id,
            productVariantId: variant.id,
            quantity,
          });
          // Reconcile with the authoritative server row.
          set({
            items: get().items.map((i) =>
              i.lineId === variant.id
                ? { ...i, serverId: dto.id, quantity: dto.quantity }
                : i
            ),
          });
        } catch (err) {
          set({ items: prev }); // roll back
          toast.error(toApiError(err).message);
        }
      },

      removeItem: async (lineId) => {
        const prev = get().items;
        const line = prev.find((i) => i.lineId === lineId);
        if (!line) return;

        set({ items: prev.filter((i) => i.lineId !== lineId) });

        if (!isAuthed() || !line.serverId) return;

        try {
          await cartService.removeItem(line.serverId);
        } catch (err) {
          set({ items: prev }); // restore
          toast.error(toApiError(err).message);
        }
      },

      updateQuantity: (lineId, quantity) => {
        if (quantity <= 0) {
          void get().removeItem(lineId);
          return;
        }
        // Quantity edits stay local — the backend cart API has add/remove only.
        set((state) => ({
          items: state.items.map((i) =>
            i.lineId === lineId
              ? { ...i, quantity: clampToStock(quantity, i.product.variants.find((v) => v.id === i.variantId)?.stock ?? quantity) }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      syncOnAuth: async () => {
        if (!isAuthed() || get().isSyncing) return;
        set({ isSyncing: true });
        try {
          // Push guest lines that were never synced.
          const guestLines = get().items.filter((i) => !i.serverId && i.variantId);
          for (const l of guestLines) {
            try {
              await cartService.addItem({
                productId: l.product.id,
                productVariantId: l.variantId,
                quantity: l.quantity,
              });
            } catch {
              /* skip lines the server rejects (e.g. out of stock) */
            }
          }

          const server = await cartService.getCart();
          set({
            items: server.map((dto) => {
              const local = get().items.find((i) => i.variantId === dto.productVariantId);
              const product: Product =
                local?.product ?? {
                  id: dto.productId,
                  name: dto.productName,
                  description: '',
                  price: dto.unitPrice,
                  category: '',
                  image: dto.colorImageUrl || '',
                  images: [],
                  rating: 0,
                  reviewsCount: 0,
                  stock: dto.quantity,
                  variants: [
                    { id: dto.productVariantId, size: '', color: dto.color, image: dto.colorImageUrl ?? undefined, stock: dto.quantity },
                  ],
                  sizes: [],
                  colors: dto.color ? [dto.color] : [],
                };
              return {
                lineId: dto.productVariantId,
                serverId: dto.id,
                product,
                variantId: dto.productVariantId,
                quantity: dto.quantity,
                selectedColor: dto.color || local?.selectedColor,
                selectedSize: local?.selectedSize,
              };
            }),
          });
        } catch (err) {
          toast.error(toApiError(err).message);
        } finally {
          set({ isSyncing: false });
        }
      },

      resetLocal: () => set({ items: [], isOpen: false }),

      getTotalItems: () => get().items.reduce((n, i) => n + i.quantity, 0),
      getTotalPrice: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      getLine: (lineId) => get().items.find((i) => i.lineId === lineId),
    }),
    {
      name: 'cart-storage',
      version: 3,
      migrate: (persisted) => {
        const state = persisted as Partial<CartState> & { items?: Partial<CartLine>[] };
        return {
          ...state,
          items: (state.items ?? [])
            .map((i) => {
              if (!i || !i.product) return null;
              const variantId = i.variantId ?? i.product.variants?.[0]?.id;
              if (!variantId) return null;
              return {
                product: i.product,
                variantId,
                lineId: variantId,
                quantity: i.quantity ?? 1,
                selectedColor: i.selectedColor,
                selectedSize: i.selectedSize,
              } as CartLine;
            })
            .filter((i): i is CartLine => i !== null),
        } as CartState;
      },
      partialize: (state) => ({ items: state.items }) as CartState,
    }
  )
);
