/**
 * Raw shapes returned by the Souqy backend (ASP.NET Core, /api/v1).
 * Mirrors Application/Features/{Products,Categories,Cart,Orders,Auth}/DTOs.
 *
 * Keep these 1:1 with the API. UI-facing shapes live in ./index.ts and are
 * produced by the mappers in @/lib/mappers so that backend changes only
 * touch one place.
 */

/** Application/Features/Products/DTOs/ColorVariantDto.cs */
export interface ColorVariantDto {
  id: string; // ProductVariant Guid
  productId: string;
  size: string;
  color: string;
  colorImageUrl?: string | null;
  stockQuantity: number;
  inStock: boolean;
}

/** Application/Features/Products/DTOs/ProductDto.cs */
export interface ProductDto {
  id: string; // Guid
  name: string;
  description?: string | null;
  price: number;
  defaultColor?: string | null;
  defaultImageUrl?: string | null;
  createdAt: string; // ISO date
  colorVariants: ColorVariantDto[];
  // Not on the backend ProductDto (no category info there yet). Kept optional so
  // the mock data — which does carry them — and any future API field just work.
  categoryId?: string;
  categoryName?: string | null;
}

/** POST/GET body for Application/Features/Products/DTOs/ProductVariantDto.cs */
export interface CreateProductVariantDto {
  size: string;
  color: string;
  colorImageUrl?: string | null;
  stockQuantity: number;
}

export interface CategoryDto {
  id: string; // Guid
  name: string;
  description?: string | null;
}

export interface PagedResult<T> {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
}

// --- Cart -----------------------------------------------------------------

/** Application/Features/Cart/DTOs/CartItemDto.cs */
export interface CartItemDto {
  id: string;
  productId: string;
  productVariantId: string;
  productName: string;
  color: string;
  colorImageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  subTotal: number;
}

/** Application/Features/Cart/DTOs/AddToCartDto.cs */
export interface AddToCartRequest {
  productId: string;
  productVariantId: string;
  quantity: number;
}

// --- Orders -------------------------------------------------------------

/** Application/Features/Orders/DTOs/OrderItemDto.cs */
export interface OrderItemDto {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  color?: string | null;
  unitPrice: number;
  quantity: number;
}

/** Application/Features/Orders/DTOs/OrderDto.cs */
export interface OrderDto {
  id: string;
  userId: string;
  idempotencyKey: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
  items: OrderItemDto[];
}

/** Application/Features/Orders/DTOs/CreateOrderDto.cs */
export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
}
export interface CreateOrderRequest {
  shippingAddress: string;
  idempotencyKey?: string;
  /** Omit to check out from the server-side cart. */
  items?: CreateOrderItemRequest[];
}

// --- Auth --------------------------------------------------------------

/** Application/Features/Auth/DTOs/LoginDto.cs */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Application/Features/Auth/DTOs/RegisterDto.cs */
export interface RegisterRequest {
  fullname: string;
  email: string;
  password: string;
}

/** Application/Features/Auth/DTOs/LoginResponseDto.cs */
export interface LoginResponse {
  id: string;
  token: string;
  fullname: string;
  email: string;
}

/** Souqy-Backend/Controllers/UserController.cs → GET /api/v1/user/me */
export interface CurrentUserDto {
  userId: string;
  username: string;
  email: string;
}

/** Error contract from Souqy-Backend middleware / [ApiController]. */
export interface ApiErrorBody {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

export interface ProductQuery {
  page?: number;
  pageSize?: number;
  categoryId?: string;
}
