/**
 * Raw shapes returned by the Souqy backend (ASP.NET Core, /api/v1).
 * Mirrors Application/Features/{Products,Categories}/DTOs in Souqy_Backend.
 *
 * Keep these 1:1 with the API. UI-facing shapes live in ./index.ts and are
 * produced by the mappers in @/lib/mappers so that backend changes only
 * touch one place.
 */

export interface ProductDto {
  id: string; // Guid
  name: string;
  description?: string | null;
  price: number;
  createdAt: string; // ISO date
  // The following exist on the Domain entity but are NOT yet on ProductDto.
  // Typed as optional so the UI works today and lights up automatically once
  // the backend adds them to the DTO.
  imageUrl?: string | null;
  stockQuantity?: number;
  size?: string | null;
  color?: string | null;
  categoryId?: string;
  categoryName?: string | null;
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

/** Error contract documented in Souqy_Backend/README.md */
export interface ApiErrorBody {
  statusCode: number;
  message: string;
  /** [ApiController] validation failures add an `errors` dictionary */
  errors?: Record<string, string[]>;
}

export interface ProductQuery {
  page?: number;
  pageSize?: number;
  categoryId?: string;
}
