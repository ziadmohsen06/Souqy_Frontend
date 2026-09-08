# Write-up — Frontend: Product & Cart (3-day slice)

Branch: `feature/product-cart` (from `ziad-mohsen-frontend-scaffold`)

## Scope

| Day | Planned | Delivered |
| --- | --- | --- |
| 1 | Vite/React/Tailwind setup, folder structure, API service layer, listing page (mock data), cart state | Service layer (`api.ts` + `product.service.ts` + mappers + typed DTOs), Vite proxy to the .NET API, mock API server with the exact backend contract, cart store rewrite + `useCart()` facade, feature-folder structure |
| 2 | Wire listing to the real API, Product Detail page, Add to Cart | `/products` driven by `GET /products?page&pageSize&categoryId` + `GET /categories` (URL-synced filters, pagination, sort, search), full `/products/:id` (gallery, color, size, quantity with stock clamp, Buy now, related products, proper 404), variant-aware Add to Cart everywhere |
| 3 | Cart page, Noon/Amazon-style polish, integration bug fixes, write-up | `/cart` with line items, quantity stepper, save-for-later, undo remove, order summary (subtotal / free-shipping progress / VAT / total), empty state + recommendations; drawer refactored to share components; Tailwind v4 theme fix; README + this document |

## Key decisions

**Kept Zustand instead of switching to Context.** The plan said "cart state (Context)", but the
team scaffold already used Zustand for cart/wishlist/auth/theme. Replacing it would have broken
teammates' components for no functional gain — both are "one global store any component can
read". I wrapped it in a `useCart()` hook so consumers don't know (or care) what's underneath,
and `persist` gives us localStorage for free.

**Contract-first service layer.** `types/api.ts` mirrors the backend DTOs exactly; `lib/mappers.ts`
is the only place that knows how to turn a DTO into what the UI renders. The backend currently
returns a slim `ProductDto` (no image / stock / size / color) — those fields are optional in the
type with sensible fallbacks, so nothing in the UI breaks today and nothing needs to change when
the DTO grows.

**Vite proxy instead of CORS hacks.** The API has no CORS configured. Rather than editing the
backend from the frontend branch, `/api/*` is proxied by Vite in dev. Production just sets
`VITE_API_URL` to the real origin once CORS is enabled server-side.

**A mock that speaks the real API.** `mock/server.mjs` (zero dependencies) serves the same
routes, pagination envelope (`{page,pageSize,total,items}`) and error body
(`{statusCode,message}`) as the .NET app, seeded with the same GUIDs as its EF migration. Anyone
can run the frontend without .NET/SQL, and switching to the real backend is just starting it on
the same port.

**URL as the source of truth for the listing.** `?category=&page=&sort=&price=&q=` — shareable,
back-button friendly, and refresh-safe. Server handles pagination + category; sort/price/search
run on the loaded page because the API doesn't support them yet (noted for the backend team).

## Integration issues found & fixed

1. `useCartStore.addItem` mutated state in place (`items[i].quantity += n`) → broke persistence
   and skipped re-renders. Rewritten immutably; also introduced `lineId = product::size::color`
   so variants are separate rows, and quantities are clamped to stock.
2. Tailwind v4: semantic tokens (`bg-primary`, `border-border`, …) were **not generating CSS**
   because the HSL variables were never registered in `@theme`. Every "primary" button rendered
   transparent. Added the `@theme inline` bridge + `@custom-variant dark`.
3. `result.items.map(mapProduct)` passed the array index as the second argument (categories) →
   `categories.find is not a function`. Classic `.map` callback-arity bug; fixed with an explicit
   lambda.
4. Product IDs moved from `prod-1` strings to GUIDs — types/routes/mocks now all use the real IDs.
5. Detail page reset selections with `setState` inside `useEffect` (lint error, cascading
   renders). Replaced with a `key={product.id}` remount, which is the idiomatic React fix.
6. Navbar brand wrapped to two lines on small screens; fixed with `whitespace-nowrap`.

## Hand-offs / open items

- Backend: enable CORS; extend `ProductDto` with `imageUrl`, `stockQuantity`, `size`, `color`,
  `categoryId`; optional `search`/`sort` query params.
- Checkout / Auth stream: `/cart` → "Proceed to Checkout" navigates to `/checkout` (currently a
  friendly placeholder page). `useCart()` exposes `items`, `subtotal`, `shipping`, `tax`, `total`.
- Cart sync: the backend has `Cart`/`CartItem` entities but no controller yet; when it exists,
  `useCart` is the single integration point.

## How to demo (2 minutes)

1. `npm run mock` + `npm run dev` → open `/products`.
2. Click **Accessories** → URL updates, grid refetches with `?categoryId=`. Page 2 → pagination.
3. Open a product → pick size/color, bump quantity, **Add to Bag** → drawer + toast.
4. Navbar badge updates → **View bag & checkout** → `/cart`: change quantity, remove (Undo),
   watch free-shipping bar and totals recalculate. Refresh → cart persists.
5. Stop the mock server, refresh → friendly "Can't reach the server" state with retry.
6. Visit a bad GUID → proper 404 view (backend 404 contract handled).
