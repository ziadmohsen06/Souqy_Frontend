import type { Product } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Oversized Heavyweight Cotton Hoodie',
    nameAr: 'هودي قطني عريض ثقيل',
    description: 'Crafted from premium 450gsm organic French terry cotton, featuring dropped shoulders and a double-layered hood for ultimate warmth and modern streetwear silhouette.',
    descriptionAr: 'مصنوع من قطن فرنسي عضوي فاخر بوزن 450 جرام، يتميز بأكتاف مائلة وغطاء رأس مضاعف لراحة متميزة ومظهر عصري.',
    price: 89,
    originalPrice: 110,
    category: "Men's Apparel",
    categoryAr: 'ملابس رجالية',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 184,
    stock: 35,
    isFeatured: true,
    isNew: true,
    tags: ['Hoodie', 'Streetwear', 'Men'],
  },
  {
    id: 'prod-2',
    name: 'Tailored Double-Breasted Wool Blazer',
    nameAr: 'بليزر صوف أنيق بأزرار مزدوجة',
    description: 'A timeless structured blazer woven from Italian virgin wool with sharp peak lapels and customized horn buttons.',
    descriptionAr: 'سترة صوفية رسمية مصممة بإتقان من الصوف الإيطالي الناعم بطيات صدر عريضة وأزرار عاجية.',
    price: 195,
    originalPrice: 240,
    category: "Women's Fashion",
    categoryAr: 'ملابس نسائية',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 92,
    stock: 18,
    isFeatured: true,
    tags: ['Blazer', 'Formal', 'Women'],
  },
  {
    id: 'prod-3',
    name: 'Vintage Wash Relaxed Denim Jacket',
    nameAr: 'جاكيت جينز غسيل كلاسيكي',
    description: 'Iconic vintage-inspired denim jacket made from 100% sustainable rigid cotton with durable custom metal hardware.',
    descriptionAr: 'جاكيت جينز كلاسيكي بتصميم أنيق من القطن المستدام 100% وأزرار معدنية متينة.',
    price: 120,
    originalPrice: 145,
    category: "Outerwear",
    categoryAr: 'ملابس خارجية',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 156,
    stock: 22,
    isFeatured: true,
    isNew: true,
    tags: ['Denim', 'Jacket', 'Casual'],
  },
  {
    id: 'prod-4',
    name: 'Pure Mulberry Silk Pleated Midi Dress',
    nameAr: 'فستان ميدي بليسيه من الحرير الطبيعي',
    description: 'Elegantly draped mulberry silk midi dress with delicate accordion pleats, cinched waistline, and fluid movement.',
    descriptionAr: 'فستان حريري ميدي ناعم بطيات خفيفة وحزام محدد للخصر لإطلالة راقية في المناسبات.',
    price: 165,
    originalPrice: 210,
    category: "Women's Fashion",
    categoryAr: 'ملابس نسائية',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 215,
    stock: 12,
    isFeatured: true,
    tags: ['Dress', 'Silk', 'Luxury'],
  },
  {
    id: 'prod-5',
    name: 'Classic Slim-Fit Chino Trousers',
    nameAr: 'بنطال تشينو كلاسيكي بقصة مريحة',
    description: 'Versatile stretch-cotton chino pants engineered for everyday flexibility, featuring reinforced stitching and deep pockets.',
    descriptionAr: 'بنطال تشينو مرن ومريح مصمم للاستخدام اليومي من قطن مطاطي متين مع خياطة مدعمة.',
    price: 68,
    originalPrice: 85,
    category: "Men's Apparel",
    categoryAr: 'ملابس رجالية',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviewsCount: 118,
    stock: 45,
    isFeatured: false,
    tags: ['Pants', 'Chinos', 'Casual'],
  },
  {
    id: 'prod-6',
    name: 'Minimalist Merino Wool Turtleneck Sweater',
    nameAr: 'كنزة صوفية ميرينو بياقة عالية',
    description: 'Ultra-soft extrafine Merino wool knit sweater providing breathable warmth and timeless luxury layering.',
    descriptionAr: 'كنزة صوف ميرينو فائقة النعومة تجمع بين الدفء الخفيف والأناقة الكلاسيكية.',
    price: 98,
    originalPrice: 130,
    category: "Knitwear",
    categoryAr: 'ملابس صوفية',
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 140,
    stock: 28,
    isFeatured: true,
    tags: ['Sweater', 'Winter', 'Knitwear'],
  },
];

export const productService = {
  getProducts: async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return MOCK_PRODUCTS;
  },
  getProductById: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return MOCK_PRODUCTS.find((p) => p.id === id) || null;
  },
  searchProducts: async (query: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const lower = query.toLowerCase();
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        (p.nameAr && p.nameAr.includes(lower)) ||
        p.category.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower)
    );
  },
};
