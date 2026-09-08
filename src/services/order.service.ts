import api from './api';
import { mapOrder } from '@/lib/mappers';
import type { CreateOrderRequest, Order, OrderDto } from '@/types';

/**
 * Order service — Souqy backend OrdersController (all endpoints require auth):
 *   POST /api/v1/orders   { shippingAddress, idempotencyKey?, items? }
 *   GET  /api/v1/orders
 *   GET  /api/v1/orders/{id}
 *
 * Omitting `items` checks out from the server-side cart. Each checkout attempt
 * should carry a fresh `idempotencyKey` (GUID) so a double-submit is collapsed
 * to one order by the backend.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

export const orderService = {
  async createOrder(req: CreateOrderRequest): Promise<Order> {
    if (USE_MOCK) {
      await wait(500);
      const now = new Date().toISOString();
      const dto: OrderDto = {
        id: crypto.randomUUID(),
        userId: 'mock-user',
        idempotencyKey: req.idempotencyKey ?? crypto.randomUUID(),
        status: 'Pending',
        totalAmount: 0,
        shippingAddress: req.shippingAddress,
        createdAt: now,
        items: [],
      };
      return mapOrder(dto);
    }
    const { data } = await api.post<OrderDto>('/orders', req);
    return mapOrder(data);
  },

  async getMyOrders(): Promise<Order[]> {
    if (USE_MOCK) return [];
    const { data } = await api.get<OrderDto[]>('/orders');
    return data.map(mapOrder);
  },
};
