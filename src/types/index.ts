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
  image: string;
  images?: string[];
  rating: number;
  reviewsCount: number;
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
  tags?: string[];
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
