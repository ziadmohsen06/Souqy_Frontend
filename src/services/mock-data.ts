import type { CategoryDto, ColorVariantDto, ProductDto } from '@/types';

/**
 * In-memory mirror of the backend seed data
 * (Souqy_Backend/Infrastructure/ApplicationDbContext.cs +
 *  Migrations/*_SeedAdminUserAndProductVariants.cs + *_DemoSeedDataAndImages.cs).
 *
 * Exact same GUIDs / names / prices / colours / stock / image URLs as the real
 * database, so flipping VITE_USE_MOCK on/off is seamless (cart lines, deep links,
 * the variant selector all keep working).
 *
 * The backend index UQ_ProductVariants_Product_Color means each colour of a
 * product is ONE variant row (its own size + stock).
 */

export const MOCK_CATEGORIES: CategoryDto[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Men', description: "Men's clothing and accessories" },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Women', description: "Women's clothing and accessories" },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Accessories', description: 'Hats, belts, and more' },
];

const MEN = MOCK_CATEGORIES[0].id;
const WOMEN = MOCK_CATEGORIES[1].id;
const ACC = MOCK_CATEGORIES[2].id;

const img = (id: string) => `https://images.unsplash.com/${id}?w=900&auto=format&fit=crop&q=80`;
const TEE = 'photo-1521572163474-6864f9cf17ab';
const SHIRT = 'photo-1602810318383-e386cc2a3ccf';
const SWEATER = 'photo-1576871337622-98d48d1cf531';
const HOODIE = 'photo-1556905055-8f358a7a47b2';
const JEANS = 'photo-1542272604-787c3835535d';
const CHINO = 'photo-1624378439575-d8705ad7ae80';
const JACKET = 'photo-1576995853123-5a10305d93c0';
const BLAZER = 'photo-1591047139829-d91aecb6caea';
const DRESS = 'photo-1539109136881-3be0616acf4b';
const HEELS = 'photo-1543163521-1bf539c55dd2';
const CAP = 'photo-1588850561407-ed78c282e89b';
const BELT = 'photo-1624222247344-550fb60583dc';

const mkVariant = (
  id: string,
  productId: string,
  color: string,
  size: string,
  stockQuantity: number,
  colorImageUrl: string
): ColorVariantDto => ({
  id,
  productId,
  color,
  size,
  colorImageUrl,
  stockQuantity,
  inStock: stockQuantity > 0,
});

interface Seed {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  defaultColor: string;
  defaultImageUrl: string;
  /** [variantId, color, size, stock, image] */
  variants: [string, string, string, number, string][];
}

const SEEDS: Seed[] = [
  {
    id: '10000000-0000-0000-0000-000000000001', categoryId: MEN, name: 'Classic T-Shirt',
    description: 'A comfortable classic tee.', price: 12.99, createdAt: '2024-01-01T00:00:00Z',
    defaultColor: 'White', defaultImageUrl: img(TEE),
    variants: [
      ['b0000000-0000-0000-0000-000000000101', 'White', 'M', 60, img(TEE)],
      ['b0000000-0000-0000-0000-000000000102', 'Black', 'L', 40, img(SHIRT)],
      ['b0000000-0000-0000-0000-000000000103', 'Navy', 'S', 25, img(SWEATER)],
    ],
  },
  {
    id: '10000000-0000-0000-0000-000000000002', categoryId: MEN, name: 'Denim Jeans',
    description: 'Classic denim jeans.', price: 49.5, createdAt: '2024-01-01T00:00:00Z',
    defaultColor: 'Blue', defaultImageUrl: img(JEANS),
    variants: [
      ['b0000000-0000-0000-0000-000000000201', 'Blue', '32', 50, img(JEANS)],
      ['b0000000-0000-0000-0000-000000000202', 'Black', '34', 20, img(JEANS)],
    ],
  },
  {
    id: '10000000-0000-0000-0000-000000000003', categoryId: WOMEN, name: 'Summer Dress',
    description: 'Light summer dress.', price: 39.99, createdAt: '2024-01-01T00:00:00Z',
    defaultColor: 'Red', defaultImageUrl: img(DRESS),
    variants: [
      ['b0000000-0000-0000-0000-000000000301', 'Red', 'S', 25, img(DRESS)],
      ['b0000000-0000-0000-0000-000000000302', 'Blue', 'M', 12, img(DRESS)],
      ['b0000000-0000-0000-0000-000000000303', 'Yellow', 'S', 8, img(DRESS)],
    ],
  },
  {
    id: '10000000-0000-0000-0000-000000000004', categoryId: WOMEN, name: 'Heels',
    description: 'Comfortable heels.', price: 59.99, createdAt: '2024-01-01T00:00:00Z',
    defaultColor: 'Black', defaultImageUrl: img(HEELS),
    variants: [
      ['b0000000-0000-0000-0000-000000000401', 'Black', '38', 20, img(HEELS)],
      ['b0000000-0000-0000-0000-000000000402', 'Nude', '37', 10, img(HEELS)],
    ],
  },
  {
    id: '10000000-0000-0000-0000-000000000005', categoryId: ACC, name: 'Baseball Cap',
    description: 'Stylish cap.', price: 14.0, createdAt: '2024-01-01T00:00:00Z',
    defaultColor: 'Navy', defaultImageUrl: img(CAP),
    variants: [
      ['b0000000-0000-0000-0000-000000000501', 'Navy', 'One Size', 120, img(CAP)],
      ['b0000000-0000-0000-0000-000000000502', 'Black', 'One Size', 80, img(CAP)],
      ['b0000000-0000-0000-0000-000000000503', 'Olive', 'One Size', 40, img(CAP)],
    ],
  },
  {
    id: '10000000-0000-0000-0000-000000000006', categoryId: ACC, name: 'Leather Belt',
    description: 'Genuine leather belt.', price: 25.0, createdAt: '2024-01-01T00:00:00Z',
    defaultColor: 'Brown', defaultImageUrl: img(BELT),
    variants: [
      ['b0000000-0000-0000-0000-000000000601', 'Brown', 'M', 50, img(BELT)],
      ['b0000000-0000-0000-0000-000000000602', 'Black', 'L', 40, img(BELT)],
    ],
  },

  // --- Demo products (DemoSeedDataAndImages migration) --------------------
  {
    id: '20000000-0000-0000-0000-000000000021', categoryId: MEN, name: 'Merino Wool Sweater',
    description: 'Mid-weight extra-fine Merino knit with ribbed trims — warm, breathable and not itchy.',
    price: 79.0, createdAt: '2025-09-05T00:00:00Z', defaultColor: 'Oatmeal', defaultImageUrl: img(SWEATER),
    variants: [
      ['b0000000-0000-0000-0000-000000002101', 'Oatmeal', 'M', 30, img(SWEATER)],
      ['b0000000-0000-0000-0000-000000002102', 'Charcoal', 'L', 18, img(HOODIE)],
    ],
  },
  {
    id: '20000000-0000-0000-0000-000000000022', categoryId: MEN, name: 'Oxford Button-Down Shirt',
    description: 'Garment-washed Oxford cotton with a soft roll collar. Wears equally well tucked or open over a tee.',
    price: 45.0, createdAt: '2025-10-02T00:00:00Z', defaultColor: 'White', defaultImageUrl: img(SHIRT),
    variants: [
      ['b0000000-0000-0000-0000-000000002201', 'White', 'M', 40, img(SHIRT)],
      ['b0000000-0000-0000-0000-000000002202', 'Sky Blue', 'L', 25, img(TEE)],
      ['b0000000-0000-0000-0000-000000002203', 'Pink', 'S', 12, img(SWEATER)],
    ],
  },
  {
    id: '20000000-0000-0000-0000-000000000023', categoryId: MEN, name: 'Slim Chino Trousers',
    description: 'Stretch-cotton twill chinos with a clean tapered leg, reinforced seams and deep front pockets.',
    price: 58.0, createdAt: '2025-07-18T00:00:00Z', defaultColor: 'Khaki', defaultImageUrl: img(CHINO),
    variants: [
      ['b0000000-0000-0000-0000-000000002301', 'Khaki', '32', 22, img(CHINO)],
      ['b0000000-0000-0000-0000-000000002302', 'Navy', '34', 18, img(JEANS)],
      ['b0000000-0000-0000-0000-000000002303', 'Olive', '30', 10, img(CHINO)],
    ],
  },
  {
    id: '20000000-0000-0000-0000-000000000024', categoryId: MEN, name: 'Bomber Jacket',
    description: 'Lightweight water-repellent bomber with ribbed cuffs and a matte zip. Layers over knitwear all season.',
    price: 135.0, createdAt: '2026-01-12T00:00:00Z', defaultColor: 'Black', defaultImageUrl: img(JACKET),
    variants: [
      ['b0000000-0000-0000-0000-000000002401', 'Black', 'M', 12, img(JACKET)],
      ['b0000000-0000-0000-0000-000000002402', 'Olive', 'L', 9, img(HOODIE)],
    ],
  },
  {
    id: '20000000-0000-0000-0000-000000000025', categoryId: WOMEN, name: 'Pleated Midi Skirt',
    description: 'Fluid accordion-pleated midi with an elastic-back waistband for all-day comfort.',
    price: 62.0, createdAt: '2025-08-22T00:00:00Z', defaultColor: 'Blush', defaultImageUrl: img(DRESS),
    variants: [
      ['b0000000-0000-0000-0000-000000002501', 'Blush', 'S', 15, img(DRESS)],
      ['b0000000-0000-0000-0000-000000002502', 'Black', 'M', 15, img(BLAZER)],
    ],
  },
  {
    id: '20000000-0000-0000-0000-000000000026', categoryId: WOMEN, name: 'Tailored Wool Blazer',
    description: 'Half-canvassed single-breasted blazer in Italian wool with natural shoulders and working cuffs.',
    price: 168.0, createdAt: '2025-11-03T00:00:00Z', defaultColor: 'Camel', defaultImageUrl: img(BLAZER),
    variants: [
      ['b0000000-0000-0000-0000-000000002601', 'Camel', 'M', 8, img(BLAZER)],
      ['b0000000-0000-0000-0000-000000002602', 'Charcoal', 'S', 6, img(JACKET)],
    ],
  },
  {
    id: '20000000-0000-0000-0000-000000000027', categoryId: WOMEN, name: 'Silk Slip Dress',
    description: 'Bias-cut sandwashed silk slip with adjustable straps and a subtle cowl neck.',
    price: 115.0, createdAt: '2026-02-01T00:00:00Z', defaultColor: 'Champagne', defaultImageUrl: img(DRESS),
    variants: [
      ['b0000000-0000-0000-0000-000000002701', 'Champagne', 'S', 10, img(DRESS)],
      ['b0000000-0000-0000-0000-000000002702', 'Emerald', 'M', 8, img(DRESS)],
      ['b0000000-0000-0000-0000-000000002703', 'Black', 'L', 6, img(HEELS)],
    ],
  },
  {
    id: '20000000-0000-0000-0000-000000000028', categoryId: ACC, name: 'Ribbed Wool Beanie',
    description: 'Chunky rib-knit lambswool beanie with a fold-over cuff. One size, generous fit.',
    price: 22.0, createdAt: '2025-10-20T00:00:00Z', defaultColor: 'Grey', defaultImageUrl: img(CAP),
    variants: [
      ['b0000000-0000-0000-0000-000000002801', 'Grey', 'One Size', 60, img(CAP)],
      ['b0000000-0000-0000-0000-000000002802', 'Black', 'One Size', 45, img(CAP)],
      ['b0000000-0000-0000-0000-000000002803', 'Mustard', 'One Size', 20, img(CAP)],
    ],
  },
  {
    id: '20000000-0000-0000-0000-000000000029', categoryId: ACC, name: 'Canvas Web Belt',
    description: 'Cotton-webbing belt with a brushed-metal box buckle and leather keeper. Trim to fit.',
    price: 18.0, createdAt: '2025-06-14T00:00:00Z', defaultColor: 'Khaki', defaultImageUrl: img(BELT),
    variants: [
      ['b0000000-0000-0000-0000-000000002901', 'Khaki', 'M', 40, img(BELT)],
      ['b0000000-0000-0000-0000-000000002902', 'Navy', 'L', 30, img(BELT)],
    ],
  },
];

export const MOCK_PRODUCTS: ProductDto[] = SEEDS.map((s) => ({
  id: s.id,
  name: s.name,
  description: s.description,
  price: s.price,
  createdAt: s.createdAt,
  defaultColor: s.defaultColor,
  defaultImageUrl: s.defaultImageUrl,
  categoryId: s.categoryId,
  colorVariants: s.variants.map(([id, color, size, stock, image]) => mkVariant(id, s.id, color, size, stock, image)),
}));
