import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { productService } from '@/services/product.service';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { Loader } from '@/components/ui/loader';
import { formatPrice } from '@/lib/utils';
import { Star, Heart, ShoppingBag, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { toast } from 'sonner';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();
  const isAr = i18n.language === 'ar';

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id || ''),
    enabled: !!id,
  });

  if (isLoading) return <Loader size={40} />;
  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Product not found.</p>
        <button onClick={() => navigate('/products')} className="mt-4 text-primary font-bold">
          Back to Products
        </button>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="space-y-8 pb-16">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div className="relative aspect-square rounded-3xl bg-muted overflow-hidden border border-border">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <span>{isAr && product.categoryAr ? product.categoryAr : product.category}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {isAr && product.nameAr ? product.nameAr : product.name}
            </h1>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating}</span>
              </div>
              <span className="text-muted-foreground">({product.reviewsCount} customer reviews)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isAr && product.descriptionAr ? product.descriptionAr : product.description}
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-border">
            <div className="flex gap-4">
              <button
                onClick={() => {
                  addItem(product, 1);
                  toast.success('Added to cart!');
                }}
                className="flex-1 py-3.5 bg-primary text-primary-foreground font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{t('products.add_to_cart')}</span>
              </button>

              <button
                onClick={() => {
                  toggleItem(product);
                  toast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
                }}
                className={`p-3.5 rounded-2xl border border-border flex items-center justify-center transition-colors ${
                  inWishlist
                    ? 'bg-destructive text-destructive-foreground border-destructive'
                    : 'bg-card text-foreground hover:bg-muted'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground pt-4">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <span>Fast express delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Authentic warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
