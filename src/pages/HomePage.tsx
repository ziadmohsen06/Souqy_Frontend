import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategories, useProducts } from '@/features/products/hooks/useProducts';
import { ProductCard } from '@/features/products/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // undefined = "All"; otherwise a category GUID sent to the API as ?categoryId=
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const { data: categoriesData } = useCategories();
  const { data, isLoading } = useProducts({ page: 1, pageSize: 6, categoryId: selectedCategory });

  const categories = [
    { id: undefined, name: t('products.all_categories') },
    ...(categoriesData ?? []).map((c) => ({ id: c.id, name: c.name })),
  ];

  const filteredProducts = data?.items ?? [];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-card to-blue-500/10 border border-border/80 p-8 sm:p-12 lg:p-16">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-bold tracking-wide">
            <span>{t('hero.badge')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/25"
            >
              <span>{t('hero.cta_shop')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </section>

      {/* Value Proposition Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Express Worldwide Delivery</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Complimentary shipping on orders over $100</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">100% Premium Organic Fabrics</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Ethically crafted & sustainable materials</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Hassle-Free Fit Guarantee</h4>
            <p className="text-xs text-muted-foreground mt-0.5">30-day easy size exchange policy</p>
          </div>
        </div>
      </section>

      {/* Featured Products Grid Section */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {t('products.title')}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t('products.subtitle')}
            </p>
          </div>

          {/* Category Pill Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id ?? 'all'}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Loading or Product Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3 p-4 border border-border rounded-2xl bg-card">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
