import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import type { Product, ProductQuery } from '@/types';

/** Centralised query keys so invalidation/prefetching stays consistent. */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (q: ProductQuery) => [...productKeys.lists(), q] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  related: (id: string) => [...productKeys.all, 'related', id] as const,
  categories: ['categories'] as const,
};

export function useProducts(query: ProductQuery = {}) {
  return useQuery({
    queryKey: productKeys.list(query),
    queryFn: () => productService.getProducts(query),
    // Keep the previous page on screen while the next one loads (no flicker).
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(id ?? ''),
    queryFn: () => productService.getProductById(id!),
    enabled: Boolean(id),
    retry: (failureCount, error) => {
      // Don't hammer the API for a 404.
      if ((error as { status?: number })?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: productService.getCategories,
    staleTime: 1000 * 60 * 30,
  });
}

export function useRelatedProducts(product: Product | undefined, limit = 4) {
  return useQuery({
    queryKey: productKeys.related(product?.id ?? ''),
    queryFn: () => productService.getRelatedProducts(product!, limit),
    enabled: Boolean(product),
  });
}
