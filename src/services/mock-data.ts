import type { CategoryDto, ProductDto } from '@/types';

/**
 * In-memory copy of the backend seed data
 * (Souqy_Backend/Infrastructure/Migrations/*_SeedInitialData.cs).
 *
 * Same GUIDs, same names, same prices — so switching between
 * VITE_USE_MOCK=true and the real API is seamless (cart items persist, links
 * keep working, etc.). Kept in DTO shape on purpose: it goes through the same
 * mappers as real responses.
 */

export const MOCK_CATEGORIES: CategoryDto[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Men', description: "Men's clothing and accessories" },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Women', description: "Women's clothing and accessories" },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Accessories', description: 'Hats, belts, and more' },
];

const MEN = MOCK_CATEGORIES[0].id;
const WOMEN = MOCK_CATEGORIES[1].id;
const ACC = MOCK_CATEGORIES[2].id;

export const MOCK_PRODUCTS: ProductDto[] = [
  // --- Exact backend seed rows -------------------------------------------
  { id: '10000000-0000-0000-0000-000000000001', categoryId: MEN, color: 'White', createdAt: '2024-01-01T00:00:00Z', description: 'A comfortable classic tee.', imageUrl: '', name: 'Classic T-Shirt', price: 12.99, size: 'M', stockQuantity: 100 },
  { id: '10000000-0000-0000-0000-000000000002', categoryId: MEN, color: 'Blue', createdAt: '2024-01-01T00:00:00Z', description: 'Classic denim jeans.', imageUrl: '', name: 'Denim Jeans', price: 49.5, size: '32', stockQuantity: 50 },
  { id: '10000000-0000-0000-0000-000000000003', categoryId: WOMEN, color: 'Red', createdAt: '2024-01-01T00:00:00Z', description: 'Light summer dress.', imageUrl: '', name: 'Summer Dress', price: 39.99, size: 'S', stockQuantity: 40 },
  { id: '10000000-0000-0000-0000-000000000004', categoryId: WOMEN, color: 'Black', createdAt: '2024-01-01T00:00:00Z', description: 'Comfortable heels.', imageUrl: '', name: 'Heels', price: 59.99, size: '38', stockQuantity: 25 },
  { id: '10000000-0000-0000-0000-000000000005', categoryId: ACC, color: 'Navy', createdAt: '2024-01-01T00:00:00Z', description: 'Stylish cap.', imageUrl: '', name: 'Baseball Cap', price: 14.0, size: 'One Size', stockQuantity: 200 },
  { id: '10000000-0000-0000-0000-000000000006', categoryId: ACC, color: 'Brown', createdAt: '2024-01-01T00:00:00Z', description: 'Genuine leather belt.', imageUrl: '', name: 'Leather Belt', price: 25.0, size: 'L', stockQuantity: 80 },

  // --- Extra rows so pagination/filtering is visible in the UI -------------
  { id: '10000000-0000-0000-0000-000000000007', categoryId: MEN, color: 'Charcoal', createdAt: new Date().toISOString(), description: 'Heavyweight 450gsm French terry hoodie with dropped shoulders and a double-layered hood.', imageUrl: '', name: 'Oversized Heavyweight Hoodie', price: 89.0, size: 'L', stockQuantity: 35 },
  { id: '10000000-0000-0000-0000-000000000008', categoryId: WOMEN, color: 'Camel', createdAt: new Date().toISOString(), description: 'Tailored double-breasted blazer woven from Italian virgin wool with peak lapels.', imageUrl: '', name: 'Tailored Wool Blazer', price: 195.0, size: 'M', stockQuantity: 18 },
  { id: '10000000-0000-0000-0000-000000000009', categoryId: MEN, color: 'Indigo', createdAt: '2025-11-10T00:00:00Z', description: 'Vintage-wash relaxed denim jacket in 100% rigid cotton with custom metal hardware.', imageUrl: '', name: 'Vintage Denim Jacket', price: 120.0, size: 'XL', stockQuantity: 22 },
  { id: '10000000-0000-0000-0000-000000000010', categoryId: WOMEN, color: 'Emerald', createdAt: '2025-12-02T00:00:00Z', description: 'Pure mulberry silk midi dress with accordion pleats and a cinched waist.', imageUrl: '', name: 'Silk Pleated Midi Dress', price: 165.0, size: 'S', stockQuantity: 12 },
  { id: '10000000-0000-0000-0000-000000000011', categoryId: MEN, color: 'Khaki', createdAt: '2025-10-20T00:00:00Z', description: 'Versatile stretch-cotton chinos with reinforced stitching and deep pockets.', imageUrl: '', name: 'Slim-Fit Chino Trousers', price: 68.0, size: '34', stockQuantity: 45 },
  { id: '10000000-0000-0000-0000-000000000012', categoryId: WOMEN, color: 'Oatmeal', createdAt: '2025-09-15T00:00:00Z', description: 'Extra-fine Merino wool turtleneck for breathable warmth and clean layering.', imageUrl: '', name: 'Merino Turtleneck Sweater', price: 98.0, size: 'M', stockQuantity: 28 },
  { id: '10000000-0000-0000-0000-000000000013', categoryId: MEN, color: 'White', createdAt: '2025-08-01T00:00:00Z', description: 'Crisp Oxford cotton button-down shirt, garment-washed for softness.', imageUrl: '', name: 'Oxford Button-Down Shirt', price: 54.0, size: 'L', stockQuantity: 60 },
  { id: '10000000-0000-0000-0000-000000000014', categoryId: ACC, color: 'Black', createdAt: '2025-07-12T00:00:00Z', description: 'Minimal full-grain leather belt with a matte brushed buckle.', imageUrl: '', name: 'Minimal Leather Belt', price: 32.0, size: 'M', stockQuantity: 90 },
  { id: '10000000-0000-0000-0000-000000000015', categoryId: WOMEN, color: 'Ivory', createdAt: '2025-06-30T00:00:00Z', description: 'Relaxed linen shirt dress with a self-tie belt, perfect for warm evenings.', imageUrl: '', name: 'Linen Shirt Dress', price: 74.0, size: 'M', stockQuantity: 30 },
  { id: '10000000-0000-0000-0000-000000000016', categoryId: ACC, color: 'Olive', createdAt: '2025-05-05T00:00:00Z', description: 'Washed cotton six-panel cap with an adjustable strap.', imageUrl: '', name: 'Washed Cotton Cap', price: 19.0, size: 'One Size', stockQuantity: 150 },
];
