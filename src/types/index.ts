/**
 * UI-facing domain types. These are what pages/components consume.
 * They are produced from the raw API DTOs (see ./api.ts) by @/lib/mappers.
 */

export * from './api';

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryAr?: string;
  categoryId?: string;
  image: string;
  images?: string[];
  rating: number;
  reviewsCount: number;
  stock: number;
  sizes?: string[];
  colors?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  avatar?: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: CartItem[];
  shippingAddress: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
