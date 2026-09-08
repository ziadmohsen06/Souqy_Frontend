import React from 'react';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Product } from '@/types';
import { cn, formatPrice } from '@/lib/utils';
import { useCart } from '@/features/cart/useCart';
import { useWishlistStore } from '@/store/useWishlistStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlistStore();
  const isAr = i18n.language === 'ar';

  const inWishlist = isInWishlist(product.id);
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;
  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;
  const displayName = isAr && product.nameAr ? product.nameAr : product.name;
  const href = `/products/${product.id}`;

  const inStockVariants = product.variants.filter((v) => v.stock > 0);
  const quickAddVariant = inStockVariants.length === 1 ? inStockVariants[0] : undefined;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    // Only quick-add when the choice is unambiguous; otherwise send the user to
    // the detail page to pick a colour / size (→ a specific ProductVariantId).
    if (!quickAddVariant) {
      navigate(href);
      return;
    }
    void addItem(product, quickAddVariant, 1);
    toast.success(`${displayName} ${isAr ? 'أُضيف إلى الحقيبة' : 'added to bag'}`, {
      action: { label: isAr ? 'عرض الحقيبة' : 'View bag', onClick: () => navigate('/cart') },
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    toast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <Link
      to={href}
      className="group relative flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] w-full bg-muted overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={cn(
            'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105',
            outOfStock && 'grayscale opacity-70'
          )}
        />

        {/* Badges */}
        <div className="absolute top-3 start-3 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="px-2 py-1 bg-foreground text-background text-[10px] font-extrabold uppercase tracking-wider rounded-md">
              New
            </span>
          )}
          {hasDiscount && (
            <span className="px-2 py-1 bg-destructive text-destructive-foreground text-[10px] font-extrabold uppercase tracking-wider rounded-md">
              -{discountPct}%
            </span>
          )}
          {outOfStock && (
            <span className="px-2 py-1 bg-muted text-muted-foreground text-[10px] font-extrabold uppercase tracking-wider rounded-md">
              {t('products.out_of_stock')}
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={cn(
            'absolute top-3 end-3 p-2 rounded-full backdrop-blur-md transition-colors z-10',
            inWishlist
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-background/80 text-muted-foreground hover:text-destructive'
          )}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={inWishlist}
        >
          <Heart className={cn('w-4 h-4', inWishlist && 'fill-current')} />
        </button>

        {/* Quick add */}
        {!outOfStock && (
          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus-within:opacity-100 focus-within:translate-y-0 transition-all duration-300">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-2.5 bg-background/95 backdrop-blur-md text-foreground text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-border shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{quickAddVariant ? t('products.add_to_cart') : (isAr ? 'اختر الخيارات' : 'Select options')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3.5 flex-1 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="truncate">{isAr && product.categoryAr ? product.categoryAr : product.category}</span>
          <span className="flex items-center gap-1 text-amber-500 font-semibold shrink-0">
            <Star className="w-3 h-3 fill-current" />
            {product.rating.toFixed(1)}
            <span className="text-muted-foreground font-normal">({product.reviewsCount})</span>
          </span>
        </div>

        <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {displayName}
        </h3>

        <div className="mt-auto pt-1.5 flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-extrabold text-foreground">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>
          {lowStock && (
            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
              Only {product.stock} left
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
