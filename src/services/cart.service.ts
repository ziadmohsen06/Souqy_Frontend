import api, { ApiError } from './api';
import type { AddToCartRequest, CartItemDto } from '@/types';
import { MOCK_PRODUCTS } from './mock-data';

/**
 * Cart service — talks to Souqy backend CartController:
 *   GET    /api/v1/cart
 *   POST   /api/v1/cart/items      { productId, productVariantId, quantity }
 *   DELETE /api/v1/cart/items/{id}
 *
 * All endpoints require a Bearer token (attached by services/api.ts).
 *
 * With VITE_USE_MOCK=true the cart lives in memory here so the storefront can be
 * demoed without the backend. (The standalone `npm run mock` server is GET-only
 * and does not implement cart/auth/orders.)
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let mockCart: CartItemDto[] = [];
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const mockTransport = {
  async getCart(): Promise<CartItemDto[]> {
    await wait(150);
    return mockCart.map((i) => ({ ...i }));
  },
  async addItem(req: AddToCartRequest): Promise<CartItemDto> {
    await wait(150);
    const product = MOCK_PRODUCTS.find((p) => p.id === req.productId);
    const variant = product?.colorVariants.find((v) => v.id === req.productVariantId);
    if (!product || !variant) {
      throw new ApiError('Product color variant not found.', 404);
    }
    if (variant.stockQuantity <= 0) {
      throw new ApiError(`'${product.name}' in ${variant.color} is out of stock.`, 400);
    }
    const existing = mockCart.find((i) => i.productVariantId === req.productVariantId);
    if (existing) {
      existing.quantity += req.quantity;
      existing.subTotal = existing.unitPrice * existing.quantity;
      return { ...existing };
    }
    const line: CartItemDto = {
      id: crypto.randomUUID(),
      productId: product.id,
      productVariantId: variant.id,
      productName: product.name,
      color: variant.color,
      colorImageUrl: variant.colorImageUrl ?? null,
      unitPrice: product.price,
      quantity: req.quantity,
      subTotal: product.price * req.quantity,
    };
    mockCart.push(line);
    return { ...line };
  },
  async removeItem(id: string): Promise<void> {
    await wait(120);
    mockCart = mockCart.filter((i) => i.id !== id);
  },
};

const httpTransport = {
  async getCart(): Promise<CartItemDto[]> {
    const { data } = await api.get<CartItemDto[]>('/cart');
    return data;
  },
  async addItem(req: AddToCartRequest): Promise<CartItemDto> {
    const { data } = await api.post<CartItemDto>('/cart/items', req);
    return data;
  },
  async removeItem(id: string): Promise<void> {
    await api.delete(`/cart/items/${id}`);
  },
};

export const cartService = USE_MOCK ? mockTransport : httpTransport;
