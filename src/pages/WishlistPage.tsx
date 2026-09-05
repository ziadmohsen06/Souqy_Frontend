import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWishlistStore } from '@/store/useWishlistStore';
import { ProductCard } from '@/features/products/ProductCard';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WishlistPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, clearWishlist } = useWishlistStore();

  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            {t('nav.wishlist')}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Your saved items ({items.length})
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs font-semibold text-destructive hover:underline"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 space-y-4">
          <Heart className="w-16 h-16 stroke-1 text-muted-foreground/40 mx-auto" />
          <h3 className="text-lg font-bold text-foreground">Your wishlist is empty</h3>
          <p className="text-xs text-muted-foreground">
            Explore our products and tap the heart icon to save your favorites!
          </p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-md"
          >
            Explore Products
          </button>
        </div>
      )}
    </div>
  );
};
