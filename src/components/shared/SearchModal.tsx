import React, { useState, useEffect } from 'react';
import { Search, X, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { productService } from '@/services/product.service';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Loader } from '@/components/ui/loader';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isAr = i18n.language === 'ar';

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await productService.searchProducts(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-border gap-3">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('nav.search_placeholder')}
            autoFocus
            className="flex-1 bg-transparent border-none text-foreground outline-none text-base placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-muted text-muted-foreground hover:text-foreground"
          >
            Esc
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {isLoading ? (
            <Loader />
          ) : results.length > 0 ? (
            <div className="grid gap-2">
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onClose();
                    navigate(`/products/${product.id}`);
                  }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/60 cursor-pointer transition-colors"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm truncate">
                      {isAr && product.nameAr ? product.nameAr : product.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {isAr && product.categoryAr ? product.categoryAr : product.category}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-primary">
                    {formatPrice(product.price)}
                  </div>
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {t('products.no_products')}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground text-xs gap-2">
              <ShoppingBag className="w-8 h-8 opacity-40" />
              <span>Type to search for headphones, watches, skincare, and more...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
