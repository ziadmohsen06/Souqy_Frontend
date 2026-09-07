import React from 'react';
import { Star, Heart, ShoppingBag, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();
  const isAr = i18n.language === 'ar';

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`${isAr && product.nameAr ? product.nameAr : product.name} added to cart!`);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleItem(product);
    toast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="group relative bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-muted overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-md">
              New
            </span>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="px-2.5 py-1 bg-destructive  text-destructive-foreground text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-md">
              Sale
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-colors z-10 ${
            inWishlist
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-background/80 text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add Overlay Button */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-background/90 backdrop-blur-md text-foreground text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-border shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('products.add_to_cart')}</span>
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-1">
            <span>{isAr && product.categoryAr ? product.categoryAr : product.category}</span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating}</span>
            </div>
          </div>
          <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {isAr && product.nameAr ? product.nameAr : product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Check className="w-3 h-3" /> {t('products.in_stock')}
          </span>
        </div>
      </div>
    </div>
  );
};
