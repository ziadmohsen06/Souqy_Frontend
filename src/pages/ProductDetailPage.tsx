import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import { useProduct, useRelatedProducts } from '@/features/products/hooks/useProducts';
import { ProductCard } from '@/features/products/ProductCard';
import { ProductGridSkeleton } from '@/features/products/components/ProductGridSkeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart, FREE_SHIPPING_THRESHOLD } from '@/features/cart/useCart';
import { useWishlistStore } from '@/store/useWishlistStore';
import { ApiError } from '@/services/api';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError, error, refetch } = useProduct(id);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !product) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="py-10">
        {notFound ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-5xl">🧵</p>
            <h1 className="text-2xl font-bold">Product not found</h1>
            <p className="text-sm text-muted-foreground">This item may have been removed or the link is wrong.</p>
            <Link to="/products" className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
              Back to catalog
            </Link>
          </div>
        ) : (
          <ErrorState error={error} onRetry={() => refetch()} />
        )}
      </div>
    );
  }

  // Keyed by id so every piece of selection state resets when the route changes.
  return <ProductDetailView key={product.id} product={product} />;
};

const ProductDetailView: React.FC<{ product: Product }> = ({ product }) => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const isAr = i18n.language === 'ar';

  const { data: related, isLoading: relatedLoading } = useRelatedProducts(product);
  const { addItem, items } = useCart();
  const { isInWishlist, toggleItem } = useWishlistStore();

  // Selection state – single options are pre-selected.
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes?.length === 1 ? product.sizes[0] : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors?.length === 1 ? product.colors[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const inCartQty = useMemo(
    () => items.filter((i) => i.product.id === product.id).reduce((n, i) => n + i.quantity, 0),
    [items, product.id]
  );

  const images = product.images?.length ? product.images : [product.image];
  const displayName = isAr && product.nameAr ? product.nameAr : product.name;
  const inWishlist = isInWishlist(product.id);
  const outOfStock = product.stock <= 0;
  const needsSize = (product.sizes?.length ?? 0) > 1 && !selectedSize;
  const needsColor = (product.colors?.length ?? 0) > 1 && !selectedColor;
  const maxQty = Math.max(1, product.stock - inCartQty);
  const canAdd = !outOfStock && !needsSize && !needsColor && maxQty > 0;
  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;

  const handleAdd = () => {
    if (needsSize) { toast.error('Please select a size'); return; }
    if (needsColor) { toast.error('Please select a color'); return; }
    if (!canAdd) return;
    addItem(product, quantity, selectedColor, selectedSize);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
    toast.success(`${displayName} × ${quantity} ${isAr ? 'أُضيف إلى الحقيبة' : 'added to bag'}`, {
      action: { label: isAr ? 'عرض الحقيبة' : 'View bag', onClick: () => navigate('/cart') },
    });
  };

  const handleBuyNow = () => {
    if (!canAdd) { handleAdd(); return; }
    addItem(product, quantity, selectedColor, selectedSize);
    navigate('/cart');
  };

  return (
    <div className="pb-20 space-y-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
        <Link to="/" className="hover:text-foreground">{t('nav.home')}</Link>
        <ChevronRight className={cn('w-3 h-3', isAr && 'rotate-180')} />
        <Link to="/products" className="hover:text-foreground">{t('nav.products')}</Link>
        {product.categoryId && (
          <>
            <ChevronRight className={cn('w-3 h-3', isAr && 'rotate-180')} />
            <Link to={`/products?category=${product.categoryId}`} className="hover:text-foreground">
              {isAr && product.categoryAr ? product.categoryAr : product.category}
            </Link>
          </>
        )}
        <ChevronRight className={cn('w-3 h-3', isAr && 'rotate-180')} />
        <span className="text-foreground font-medium truncate max-w-[200px]">{displayName}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-14">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-[4/5] rounded-3xl bg-muted overflow-hidden border border-border">
            <img
              src={images[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 start-4 flex flex-col gap-1.5">
              {product.isNew && (
                <span className="px-2.5 py-1 bg-foreground text-background text-[10px] font-extrabold uppercase tracking-wider rounded-md">New</span>
              )}
              {hasDiscount && (
                <span className="px-2.5 py-1 bg-destructive text-destructive-foreground text-[10px] font-extrabold uppercase tracking-wider rounded-md">
                  Sale
                </span>
              )}
            </div>
            <button
              onClick={() => { toggleItem(product); toast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist'); }}
              className={cn(
                'absolute top-4 end-4 p-2.5 rounded-full backdrop-blur-md transition-colors',
                inWishlist ? 'bg-destructive text-destructive-foreground' : 'bg-background/80 text-muted-foreground hover:text-destructive'
              )}
              aria-label="Toggle wishlist"
            >
              <Heart className={cn('w-5 h-5', inWishlist && 'fill-current')} />
            </button>
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'w-20 aspect-square rounded-xl overflow-hidden border-2 transition-colors',
                    i === activeImage ? 'border-primary' : 'border-transparent hover:border-border'
                  )}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <Link
              to={product.categoryId ? `/products?category=${product.categoryId}` : '/products'}
              className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
            >
              {isAr && product.categoryAr ? product.categoryAr : product.category}
            </Link>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              {displayName}
            </h1>
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn('w-4 h-4', i < Math.round(product.rating) ? 'fill-current' : 'opacity-30')} />
                ))}
              </span>
              <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({product.reviewsCount} reviews)</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl font-black text-foreground">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice!)}</span>
                <span className="px-2 py-0.5 rounded-md bg-destructive/10 text-destructive text-xs font-bold">
                  Save {formatPrice(product.originalPrice! - product.price)}
                </span>
              </>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {isAr && product.descriptionAr ? product.descriptionAr : product.description || 'No description available yet.'}
          </p>

          {/* Color */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">Color</span>
                <span className="text-muted-foreground">{selectedColor ?? 'Select'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={cn(
                      'px-3.5 py-2 rounded-xl border text-sm font-medium transition-colors',
                      selectedColor === c ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">Size</span>
                <button className="text-xs text-primary hover:underline">Size guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={cn(
                      'min-w-12 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-colors',
                      selectedSize === s ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {needsSize && <p className="text-xs text-muted-foreground">Please select a size to continue.</p>}
            </div>
          )}

          {/* Quantity + stock */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <span className="text-sm font-semibold">Quantity</span>
              <div className="inline-flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center hover:bg-muted disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty}
                  className="w-10 h-10 flex items-center justify-center hover:bg-muted disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-sm">
              {outOfStock ? (
                <span className="font-semibold text-destructive">{t('products.out_of_stock')}</span>
              ) : product.stock <= 5 ? (
                <span className="font-semibold text-amber-600 dark:text-amber-400">Only {product.stock} left – order soon</span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check className="w-4 h-4" /> {t('products.in_stock')}
                </span>
              )}
              {inCartQty > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">{inCartQty} already in your bag</p>
              )}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className={cn(
                'flex-1 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg',
                justAdded
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-primary text-primary-foreground shadow-primary/20 hover:opacity-90',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
              )}
            >
              {justAdded ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
              <span>{justAdded ? 'Added!' : t('products.add_to_cart')}</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="flex-1 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-5 h-5" />
              <span>Buy now</span>
            </button>
          </div>

          {/* Trust */}
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border text-xs text-muted-foreground">
            <li className="flex items-center gap-2"><Truck className="w-4 h-4 text-primary shrink-0" /> Free shipping over {formatPrice(FREE_SHIPPING_THRESHOLD)}</li>
            <li className="flex items-center gap-2"><RotateCcw className="w-4 h-4 text-primary shrink-0" /> 30-day easy returns</li>
            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary shrink-0" /> Secure checkout</li>
          </ul>
        </div>
      </div>

      {/* Related */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">You may also like</h2>
          <Link to={product.categoryId ? `/products?category=${product.categoryId}` : '/products'} className="text-sm font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        {relatedLoading ? (
          <ProductGridSkeleton count={4} />
        ) : related && related.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No related items yet.</p>
        )}
      </section>

      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className={cn('w-4 h-4', isAr && 'rotate-180')} />
        <span>Back</span>
      </button>
    </div>
  );
};

const DetailSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-14 pb-20">
    <Skeleton className="aspect-[4/5] w-full rounded-3xl" />
    <div className="space-y-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-4/5" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-10 w-36" />
      <Skeleton className="h-16 w-full" />
      <div className="flex gap-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-14 rounded-xl" />)}</div>
      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
  </div>
);
