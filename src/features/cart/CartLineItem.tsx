import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore, type CartLine } from '@/store/useCartStore';
import { useCart } from '@/features/cart/useCart';
import { useWishlistStore } from '@/store/useWishlistStore';
import { cn, formatPrice } from '@/lib/utils';

interface Props {
  line: CartLine;
  /** Compact layout for the drawer */
  compact?: boolean;
}

export const CartLineItem: React.FC<Props> = ({ line, compact = false }) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { updateQuantity, removeItem } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlistStore();

  const { product, quantity, selectedSize, selectedColor, variantId } = line;
  const name = isAr && product.nameAr ? product.nameAr : product.name;
  const variantStock = product.variants.find((v) => v.id === variantId)?.stock ?? product.stock;
  const atMax = quantity >= variantStock;
  const lineTotal = product.price * quantity;

  const moveToWishlist = () => {
    if (!isInWishlist(product.id)) addToWishlist(product);
    removeItem(line.lineId);
    toast('Moved to wishlist');
  };

  const remove = () => {
    removeItem(line.lineId);
    toast(`${name} removed`, {
      action: {
        label: 'Undo',
        onClick: () => restoreLine(line),
      },
    });
  };

  return (
    <div className={cn('flex gap-4', compact ? 'p-3 rounded-xl bg-muted/40 border border-border/50' : 'py-6')}>
      <Link
        to={`/products/${product.id}`}
        className={cn('shrink-0 rounded-xl overflow-hidden bg-muted border border-border', compact ? 'w-20 h-24' : 'w-28 h-36 sm:w-32 sm:h-40')}
      >
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      </Link>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/products/${product.id}`} className="font-semibold text-foreground hover:text-primary line-clamp-2 text-sm sm:text-base">
              {name}
            </Link>
            <p className="text-xs text-muted-foreground mt-1">
              {isAr && product.categoryAr ? product.categoryAr : product.category}
              {selectedColor && <> · {selectedColor}</>}
              {selectedSize && <> · Size {selectedSize}</>}
            </p>
            {variantStock <= 5 && (
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">
                Only {variantStock} left in stock
              </p>
            )}
          </div>
          <div className="text-end shrink-0">
            <p className="font-bold text-foreground">{formatPrice(lineTotal)}</p>
            {quantity > 1 && (
              <p className="text-xs text-muted-foreground">{formatPrice(product.price)} each</p>
            )}
          </div>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="inline-flex items-center border border-border rounded-lg overflow-hidden bg-background">
            <button
              onClick={() => updateQuantity(line.lineId, quantity - 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-muted"
              aria-label="Decrease quantity"
            >
              {quantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            </button>
            <span className="w-9 text-center text-sm font-bold tabular-nums">{quantity}</span>
            <button
              onClick={() => updateQuantity(line.lineId, quantity + 1)}
              disabled={atMax}
              className="w-8 h-8 flex items-center justify-center hover:bg-muted disabled:opacity-40"
              aria-label="Increase quantity"
              title={atMax ? 'Max stock reached' : undefined}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {!compact && (
            <div className="flex items-center gap-1 text-xs">
              <button onClick={moveToWishlist} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
                <Heart className="w-3.5 h-3.5" /> Save for later
              </button>
              <span className="text-border">|</span>
              <button onClick={remove} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted">
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          )}
          {compact && (
            <button onClick={remove} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive" aria-label="Remove">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/** "Undo" support: restore a removed line with its exact options (without opening the drawer). */
function restoreLine(line: CartLine) {
  const store = useCartStore.getState();
  const variant =
    line.product.variants.find((v) => v.id === line.variantId) ?? {
      id: line.variantId,
      size: line.selectedSize ?? '',
      color: line.selectedColor ?? '',
      stock: line.quantity,
    };
  void store.addItem(line.product, variant, line.quantity);
  store.closeCart();
}
