import api, { ApiError } from './api';
import { mapCategory, mapPaged, mapProduct } from '@/lib/mappers';
import type {
  Category,
  CategoryDto,
  CreateProductRequest,
  PagedResult,
  Paginated,
  Product,
  ProductDto,
  ProductQuery,
} from '@/types';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from './mock-data';

/**
 * Product / Category service.
 *
 * Talks to Souqy_Backend:
 *   GET /api/v1/products?page=&pageSize=&categoryId=
 *   GET /api/v1/products/{id}
 *   GET /api/v1/categories
 *
 * When VITE_USE_MOCK=true every call is served from ./mock-data (same shape,
 * same GUIDs) so the UI can be developed without any server running.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const DEFAULT_PAGE_SIZE = 12;


// Type definition for the AI response from Python/.NET
interface AiRecommendationDto {
  Id: string;
  Name: string;
  Description: string | null;
  Price: number;
  ImageUrl: string | null;
  SimilarityScore: number;
}


// ---------------------------------------------------------------------------
// Mock transport – mimics the backend behaviour (pagination, category filter)
// ---------------------------------------------------------------------------
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const mockTransport = {
  async getProducts(q: ProductQuery): Promise<PagedResult<ProductDto>> {
    await wait(350);
    const page = q.page && q.page > 0 ? q.page : 1;
    const pageSize = q.pageSize && q.pageSize > 0 ? q.pageSize : 20;
    let all = [...MOCK_PRODUCTS].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    if (q.categoryId) all = all.filter((p) => p.categoryId === q.categoryId);
    return {
      page,
      pageSize,
      total: all.length,
      items: all.slice((page - 1) * pageSize, page * pageSize),
    };
  },
  async getProduct(id: string): Promise<ProductDto> {
    await wait(250);
    const found = MOCK_PRODUCTS.find((p) => p.id === id);
    if (!found) throw new ApiError('Product not found', 404);
    return found;
  },
  async getCategories(): Promise<CategoryDto[]> {
    await wait(150);
    return MOCK_CATEGORIES;
  },
  async createProduct(input: CreateProductRequest): Promise<ProductDto> {
    await wait(250);
    const dto: ProductDto = {
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      defaultColor: null,
      defaultImageUrl: null,
      createdAt: new Date().toISOString(),
      colorVariants: [],
      categoryId: input.categoryId,
    };
    MOCK_PRODUCTS.push(dto);
    return dto;
  },
  // Mock returns empty so it falls back to category logic
  async getRelatedProducts(id: string, limit: number): Promise<AiRecommendationDto[]> {
    await wait(250);
    return []; 
  },
};

// ---------------------------------------------------------------------------
// Real transport
// ---------------------------------------------------------------------------
const httpTransport = {
  async getProducts(q: ProductQuery): Promise<PagedResult<ProductDto>> {
    const { data } = await api.get<PagedResult<ProductDto>>('/products', {
      params: {
        page: q.page ?? 1,
        pageSize: q.pageSize ?? DEFAULT_PAGE_SIZE,
        ...(q.categoryId ? { categoryId: q.categoryId } : {}),
      },
    });
    return data;
  },
  async getProduct(id: string): Promise<ProductDto> {
    const { data } = await api.get<ProductDto>(`/products/${id}`);
    return data;
  },
  async getCategories(): Promise<CategoryDto[]> {
    const { data } = await api.get<CategoryDto[]>('/categories');
    return data;
  },
  async createProduct(input: CreateProductRequest): Promise<ProductDto> {
    const { data } = await api.post<ProductDto>('/products', input);
    return data;
  },
  // Calls AI endpoint (the backend .NET controller url)
  async getRelatedProducts(id: string, limit: number): Promise<AiRecommendationDto[]> {
    const { data } = await api.get<AiRecommendationDto[]>(`/products/${id}/recommendations`, {
      params: { count: limit },
    });
    return data;
  },
};

const transport = USE_MOCK ? mockTransport : httpTransport;

// ---------------------------------------------------------------------------
// Public service (what hooks/pages use)
// ---------------------------------------------------------------------------
export const productService = {
  /** Paginated listing, optionally filtered by category GUID. */
  async getProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
    const result = await transport.getProducts({
      page: query.page ?? 1,
      pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE,
      categoryId: query.categoryId,
    });
    return mapPaged(result, mapProduct);
  },

  /** Single product; rejects with ApiError(404) when missing. */
  async getProductById(id: string): Promise<Product> {
    const dto = await transport.getProduct(id);
    return mapProduct(dto);
  },

  async getCategories(): Promise<Category[]> {
    const dtos = await transport.getCategories();
    return dtos.map(mapCategory);
  },

  /** Admin-only. Creates a product; the JWT is attached by the axios instance. */
  async createProduct(input: CreateProductRequest): Promise<Product> {
    const dto = await transport.createProduct({ stockQuantity: 0, ...input });
    return mapProduct(dto);
  },

  /**
   * Client-side search. The backend has no /search endpoint yet, so we pull a
   * large page and filter locally. Swap the body for `GET /products?search=`
   * once it exists.
   */
  async searchProducts(query: string): Promise<Product[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const { items } = await productService.getProducts({ page: 1, pageSize: 100 });
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  },

  // Now uses AI to get related products recommended by the AI, with a smart fallback
    async getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
    const aiRecs = await transport.getRelatedProducts(product.id, limit);
    
    if (!aiRecs || aiRecs.length === 0) {
      const { items } = await productService.getProducts({
        page: 1,
        pageSize: limit + 1,
        categoryId: product.categoryId,
      });
      return items.filter((p) => p.id !== product.id).slice(0, limit);
    }

    // Map PascalCase AI response to camelCase Product type with NULL handling
    return aiRecs.map((item: any) => {
      const price = item.Price ?? item.price ?? 0;
      const imageUrl = item.ImageUrl ?? item.imageUrl ?? item.ImageURL ?? null;
      
      return {
        id: item.Id || item.id,
        name: item.Name || item.name || 'Unknown Product',
        description: item.Description || item.description || '',
        price: typeof price === 'number' ? price : parseFloat(String(price)) || 0,
        image: imageUrl || 'https://placehold.co/400x500/e2e8f0/475569?text=No+Image',
        images: imageUrl ? [imageUrl] : [],
        rating: 4.5,
        reviewsCount: 0,
        stock: 10,
        // Recommendation cards don't carry variant detail; keep these present so
        // components that read product.variants/sizes/colors don't blow up.
        variants: [],
        sizes: [],
        colors: [],
        categoryId: product.categoryId,
        category: product.category || 'Uncategorized',
        createdAt: new Date().toISOString(),
      } satisfies Product;
    });
  },
};

export { DEFAULT_PAGE_SIZE };
