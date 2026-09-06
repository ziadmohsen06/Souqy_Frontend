import type {
  Category,
  CategoryDto,
  Paginated,
  PagedResult,
  Product,
  ProductDto,
} from '@/types';

/**
 * The backend currently returns a slim ProductDto (id, name, description,
 * price, createdAt). Everything the storefront needs beyond that is derived
 * here with sensible fallbacks so the UI is complete today and gets richer
 * automatically when the API exposes more fields.
 */

const PLACEHOLDER_IMAGES: Record<string, string> = {
  't-shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=80',
  tee: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=80',
  jeans: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80',
  denim: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80',
  dress: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80',
  heels: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80',
  shoe: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80',
  cap: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
  hat: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
  belt: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&auto=format&fit=crop&q=80',
  hoodie: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
  jacket: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
  blazer: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
  sweater: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&auto=format&fit=crop&q=80',
  shirt: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
};

const GENERIC_PLACEHOLDER =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80';

const CATEGORY_NAMES: Record<string, { en: string; ar: string }> = {
  '11111111-1111-1111-1111-111111111111': { en: 'Men', ar: 'رجالي' },
  '22222222-2222-2222-2222-222222222222': { en: 'Women', ar: 'نسائي' },
  '33333333-3333-3333-3333-333333333333': { en: 'Accessories', ar: 'إكسسوارات' },
};

const CATEGORY_AR: Record<string, string> = {
  men: 'رجالي',
  women: 'نسائي',
  accessories: 'إكسسوارات',
  kids: 'أطفال',
};

export function pickPlaceholderImage(name: string): string {
  const lower = name.toLowerCase();
  const hit = Object.keys(PLACEHOLDER_IMAGES).find((k) => lower.includes(k));
  return hit ? PLACEHOLDER_IMAGES[hit] : GENERIC_PLACEHOLDER;
}

/** Deterministic pseudo-random in [0,1) from a string – keeps ratings stable between renders */
function seeded(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function isRecent(iso?: string, days = 30): boolean {
  if (!iso) return false;
  const created = new Date(iso).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < days * 24 * 60 * 60 * 1000;
}

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export function mapProduct(dto: ProductDto, categories?: Category[]): Product {
  const r = seeded(dto.id);
  const categoryFromList = categories?.find((c) => c.id === dto.categoryId);
  const known = dto.categoryId ? CATEGORY_NAMES[dto.categoryId] : undefined;
  const categoryName =
    dto.categoryName || categoryFromList?.name || known?.en || 'Apparel';

  const image = dto.imageUrl && dto.imageUrl.trim() !== '' ? dto.imageUrl : pickPlaceholderImage(dto.name);

  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    price: Number(dto.price),
    category: categoryName,
    categoryAr: known?.ar ?? CATEGORY_AR[categoryName.toLowerCase()],
    categoryId: dto.categoryId,
    image,
    images: [image],
    stock: dto.stockQuantity ?? 25,
    sizes: dto.size ? [dto.size] : DEFAULT_SIZES,
    colors: dto.color ? [dto.color] : undefined,
    // Presentation-only fields the API doesn't have yet.
    rating: Math.round((4.2 + r * 0.7) * 10) / 10,
    reviewsCount: Math.floor(20 + r * 200),
    isNew: isRecent(dto.createdAt),
    isFeatured: r > 0.5,
    createdAt: dto.createdAt,
  };
}

export function mapCategory(dto: CategoryDto): Category {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? undefined,
  };
}

export function mapPaged<TDto, T>(
  result: PagedResult<TDto>,
  mapItem: (dto: TDto) => T
): Paginated<T> {
  const pageSize = result.pageSize || 1;
  return {
    // Explicit lambda: `.map(mapItem)` would also pass (index, array) as extra args.
    items: result.items.map((dto) => mapItem(dto)),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    totalPages: Math.max(1, Math.ceil(result.total / pageSize)),
  };
}
