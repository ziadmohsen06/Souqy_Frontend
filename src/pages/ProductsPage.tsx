import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, LayoutGrid, Search, SlidersHorizontal, X } from 'lucide-react';
import { useCategories, useProducts } from '@/features/products/hooks/useProducts';
import { ProductCard } from '@/features/products/ProductCard';
import { ProductGridSkeleton } from '@/features/products/components/ProductGridSkeleton';
import { ErrorState } from '@/components/ui/error-state';
import { DEFAULT_PAGE_SIZE } from '@/services/product.service';
import { cn } from '@/lib/utils';

type SortKey = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const PRICE_BUCKETS = [
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25 – $50', min: 25, max: 50 },
  { label: '$50 – $100', min: 50, max: 100 },
  { label: '$100+', min: 100, max: Infinity },
];

/**
 * Product listing.
 *
 * Server side (through the API): pagination + category filter.
 * Client side (on the current page): search text, price bucket, sort.
 * Everything lives in the URL so pages are shareable / back-button friendly.
 */
export const ProductsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [searchParams, setSearchParams] = useSearchParams();

  // --- URL-backed state ----------------------------------------------------
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const categoryId = searchParams.get('category') || undefined;
  const sort = (searchParams.get('sort') as SortKey) || 'featured';
  const priceIdx = searchParams.get('price') ? Number(searchParams.get('price')) : -1;
  const q = searchParams.get('q') ?? '';

  const setParam = (key: string, value?: string | number | null, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === null || value === '' ) next.delete(key);
    else next.set(key, String(value));
    if (resetPage && key !== 'page') next.delete('page');
    setSearchParams(next, { replace: key === 'q' });
  };

  const [searchInput, setSearchInput] = useState(q);
  useEffect(() => {
    const id = setTimeout(() => { if (searchInput !== q) setParam('q', searchInput || null); }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // --- Data ---------------------------------------------------------------
  const { data: categories } = useCategories();
  const { data, isLoading, isError, error, refetch, isFetching } = useProducts({
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    categoryId,
  });

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

  // --- Client-side refinement ---------------------------------------------
  const products = useMemo(() => {
    let list = data?.items ?? [];
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.category.toLowerCase().includes(needle) ||
          p.description.toLowerCase().includes(needle)
      );
    }
    if (priceIdx >= 0 && PRICE_BUCKETS[priceIdx]) {
      const { min, max } = PRICE_BUCKETS[priceIdx];
      list = list.filter((p) => p.price >= min && p.price < max);
    }
    const sorted = [...list];
    switch (sort) {
      case 'price-asc': sorted.sort((a, b) => a.price - b.price); break;
      case 'price-desc': sorted.sort((a, b) => b.price - a.price); break;
      case 'rating': sorted.sort((a, b) => b.rating - a.rating); break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
        break;
      default:
        sorted.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    }
    return sorted;
  }, [data, q, priceIdx, sort]);

  const activeCategory = categories?.find((c) => c.id === categoryId);
  const activeFilterCount = [categoryId, priceIdx >= 0 ? 'p' : null, q].filter(Boolean).length;

  const clearAll = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // --- Sidebar -------------------------------------------------------------
  const Filters = (
    <div className="space-y-8">
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          {t('nav.categories')}
        </h3>
        <ul className="space-y-1">
          <li>
            <FilterButton active={!categoryId} onClick={() => setParam('category', null)}>
              {t('products.all_categories')}
            </FilterButton>
          </li>
          {(categories ?? []).map((c) => (
            <li key={c.id}>
              <FilterButton active={categoryId === c.id} onClick={() => setParam('category', c.id)}>
                {c.name}
              </FilterButton>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          {t('products.price')}
        </h3>
        <ul className="space-y-1">
          {PRICE_BUCKETS.map((b, i) => (
            <li key={b.label}>
              <FilterButton active={priceIdx === i} onClick={() => setParam('price', priceIdx === i ? null : i)}>
                {b.label}
              </FilterButton>
            </li>
          ))}
        </ul>
      </section>

      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full text-xs font-semibold text-primary hover:underline text-start"
        >
          Clear all filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 mb-6">
        <nav className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span>{t('nav.home')}</span>
          <span>/</span>
          <span className="text-foreground font-medium">
            {activeCategory ? activeCategory.name : t('nav.products')}
          </span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {activeCategory ? activeCategory.name : t('nav.products')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {data ? (
                <>
                  Showing <span className="font-semibold text-foreground">{products.length}</span> of{' '}
                  <span className="font-semibold text-foreground">{data.total}</span> items
                </>
              ) : (
                t('products.subtitle')
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('products.search')}
                className="ps-9 pe-3 py-2.5 w-52 sm:w-64 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>

            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value, false)}
              className="px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
              aria-label={t('products.sort_by')}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3 py-2.5 bg-card border border-border rounded-xl text-sm font-semibold"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ms-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">{Filters}</div>
        </aside>

        {/* Mobile filters drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
            <div className="absolute inset-y-0 start-0 w-80 max-w-[85vw] bg-card border-e border-border p-6 overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-2 rounded-full hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {Filters}
            </div>
          </div>
        )}

        {/* Results */}
        <section className={cn('min-w-0 transition-opacity', isFetching && !isLoading && 'opacity-60')}>
          {isLoading ? (
            <ProductGridSkeleton count={DEFAULT_PAGE_SIZE} />
          ) : isError ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-dashed border-border">
              <LayoutGrid className="w-10 h-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">{t('products.no_products')}</p>
              {activeFilterCount > 0 && (
                <button onClick={clearAll} className="mt-4 text-sm font-semibold text-primary hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Pagination">
              <PageButton disabled={page <= 1} onClick={() => setParam('page', page - 1, false)} aria-label="Previous page">
                <ChevronLeft className={cn('w-4 h-4', isAr && 'rotate-180')} />
              </PageButton>
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((n) => (
                <PageButton key={n} active={n === page} onClick={() => setParam('page', n, false)}>
                  {n}
                </PageButton>
              ))}
              <PageButton disabled={page >= data.totalPages} onClick={() => setParam('page', page + 1, false)} aria-label="Next page">
                <ChevronRight className={cn('w-4 h-4', isAr && 'rotate-180')} />
              </PageButton>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
const FilterButton: React.FC<React.PropsWithChildren<{ active?: boolean; onClick: () => void }>> = ({
  active,
  onClick,
  children,
}) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full text-start px-3 py-2 rounded-lg text-sm transition-colors',
      active
        ? 'bg-primary/10 text-primary font-semibold'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    )}
  >
    {children}
  </button>
);

const PageButton: React.FC<
  React.PropsWithChildren<{ active?: boolean; disabled?: boolean; onClick: () => void; 'aria-label'?: string }>
> = ({ active, disabled, onClick, children, ...rest }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-current={active ? 'page' : undefined}
    className={cn(
      'min-w-9 h-9 px-3 rounded-lg text-sm font-semibold border transition-colors inline-flex items-center justify-center',
      active
        ? 'bg-primary text-primary-foreground border-primary'
        : 'bg-card border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-card'
    )}
    {...rest}
  >
    {children}
  </button>
);
