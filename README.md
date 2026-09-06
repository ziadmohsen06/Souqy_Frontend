# Souqy — Frontend

React 19 + TypeScript + Vite 8 + Tailwind v4 storefront for the Souqy e-commerce project.
Backend: [Souqy_Backend](https://github.com/ziadmohsen06/Souqy_Backend) (ASP.NET Core, `/api/v1`).

## Quick start

```bash
npm install
cp .env.example .env      # defaults are fine for local dev

# Option A – real backend (in Souqy_Backend): dotnet run  → http://localhost:5072
# Option B – no .NET? run the bundled mock API (same routes, same contract):
npm run mock              # http://localhost:5072/api/v1

npm run dev               # http://localhost:5173
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run dev:mock` | Dev server with **in-memory** data (no server at all, `VITE_USE_MOCK=true`) |
| `npm run mock` | Standalone mock of the .NET API on port 5072 (`mock/server.mjs`, zero deps) |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint |
| `npm run build` | Type-check + production bundle |

## How the frontend talks to the API

```
Browser ──► Vite dev server (:5173) ──proxy /api──► .NET API or mock (:5072)
```

- The backend does **not** send CORS headers yet, so in development every `/api/*`
  request is proxied by Vite (`vite.config.ts`). Same-origin → no CORS issues.
- `VITE_API_URL` (default `/api/v1`) is the axios `baseURL`. In production point it at
  the deployed API, e.g. `https://api.souqy.com/api/v1`, and enable CORS on the backend.
- `src/services/api.ts` — single axios instance, bearer-token interceptor, and every
  failure is normalised to an `ApiError { status, message, isNetworkError }`
  matching the backend's `{ statusCode, message }` contract.

### Endpoints used

| Method | Path | Used by |
| --- | --- | --- |
| GET | `/api/v1/products?page=&pageSize=&categoryId=` | Listing (pagination + category filter), Home, related items, search |
| GET | `/api/v1/products/{guid}` | Product detail |
| GET | `/api/v1/categories` | Sidebar filters, Home pills |

### DTO → UI mapping

`src/types/api.ts` mirrors the backend DTOs 1:1. `src/lib/mappers.ts` turns them into
the richer `Product` shape the UI needs. Fields the API doesn't expose yet
(`imageUrl`, `stockQuantity`, `size`, `color`, `categoryId`) are typed optional and
have fallbacks (placeholder image by product name, default sizes, etc.), so the UI
is complete today and gets richer automatically once `ProductDto` grows.

## Project structure (product & cart slice)

```
src/
├─ services/
│  ├─ api.ts                 axios instance + ApiError
│  ├─ product.service.ts     getProducts / getProductById / getCategories / search / related
│  └─ mock-data.ts           backend seed rows (same GUIDs) + extras
├─ lib/mappers.ts            DTO → UI mapping
├─ types/                    api.ts (DTOs) · index.ts (UI types)
├─ features/
│  ├─ products/
│  │  ├─ hooks/useProducts.ts  react-query hooks + query keys
│  │  ├─ ProductCard.tsx
│  │  └─ components/ProductGridSkeleton.tsx
│  └─ cart/
│     ├─ useCart.ts          cart facade + pricing rules (shipping / VAT)
│     ├─ CartLineItem.tsx    shared by drawer + cart page
│     └─ OrderSummary.tsx
├─ store/useCartStore.ts     zustand + persist (variant-aware lines, stock clamping)
└─ pages/
   ├─ ProductsPage.tsx       /products   – URL-driven filters, pagination
   ├─ ProductDetailPage.tsx  /products/:id – gallery, size/color, qty, related
   ├─ CartPage.tsx           /cart
   └─ NotFoundPage.tsx       404 + /checkout placeholder
mock/
├─ server.mjs                mock of the .NET API
└─ db.json                   data served by it
```

## Cart state

Cart lives client-side in a persisted Zustand store (`cart-storage` in localStorage).
Line items are keyed by `productId::size::color`, so the same product in two sizes is
two rows. Quantities are clamped to `stock`. Components consume it through
`useCart()` which also derives subtotal / shipping / VAT / total — the store is an
implementation detail behind that hook. The backend already has `Cart` / `CartItem`
entities; when the endpoints land, `useCart` is the single place to sync from.

## Notes for the backend team

1. **CORS** — add `AddCors` + `UseCors` in `Program.cs` before we deploy separately.
2. **`ProductDto`** — please expose `ImageUrl`, `StockQuantity`, `Size`, `Color`,
   `CategoryId` (all already on the `Product` entity). The mappers pick them up with
   no frontend changes.
3. Nice-to-have: `GET /products?search=` and `GET /products?sort=` so search/sort can
   move server-side; today they run on the loaded page.
