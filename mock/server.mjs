/**
 * Zero-dependency mock of Souqy_Backend.
 *
 * Mirrors the real API contract (routes, query params, pagination envelope,
 * error body) so the frontend can be developed and demoed without .NET/SQL.
 *
 *   npm run mock        → http://localhost:5072/api/v1/...
 *
 * Routes:
 *   GET /api/v1/products?page=1&pageSize=20&categoryId={guid}
 *   GET /api/v1/products/{guid}
 *   GET /api/v1/categories
 *   GET /api/v1/categories/{guid}
 */
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = JSON.parse(readFileSync(path.join(__dirname, 'db.json'), 'utf8'));

const PORT = Number(process.env.MOCK_PORT || 5072);
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const send = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  });
  res.end(body === undefined ? '' : JSON.stringify(body));
};
const fail = (res, statusCode, message) => send(res, statusCode, { statusCode, message });

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.replace(/\/+$/, '').split('/').filter(Boolean);

  if (req.method === 'OPTIONS') return send(res, 204);
  if (req.method !== 'GET') return fail(res, 405, 'Method not allowed');
  if (parts[0] !== 'api' || parts[1] !== 'v1') return fail(res, 404, 'Not found');

  const [, , resource, id] = parts;

  // Small artificial latency so loading states are visible.
  setTimeout(() => {
    if (resource === 'categories') {
      if (!id) return send(res, 200, db.categories);
      if (!GUID.test(id)) return fail(res, 400, 'Invalid id');
      const cat = db.categories.find((c) => c.id.toLowerCase() === id.toLowerCase());
      return cat ? send(res, 200, cat) : fail(res, 404, 'Category not found');
    }

    if (resource === 'products') {
      if (id) {
        if (!GUID.test(id)) return fail(res, 400, 'Invalid id');
        const p = db.products.find((x) => x.id.toLowerCase() === id.toLowerCase());
        return p ? send(res, 200, p) : fail(res, 404, 'Product not found');
      }
      let page = parseInt(url.searchParams.get('page') ?? '1', 10);
      let pageSize = parseInt(url.searchParams.get('pageSize') ?? '20', 10);
      if (!page || page <= 0) page = 1;
      if (!pageSize || pageSize <= 0) pageSize = 20;
      const categoryId = url.searchParams.get('categoryId');

      let all = [...db.products].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      if (categoryId) all = all.filter((p) => p.categoryId.toLowerCase() === categoryId.toLowerCase());

      return send(res, 200, {
        page,
        pageSize,
        total: all.length,
        items: all.slice((page - 1) * pageSize, page * pageSize),
      });
    }

    return fail(res, 404, 'Not found');
  }, 250);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[mock-api] Souqy mock backend → http://localhost:${PORT}/api/v1`);
  console.log(`[mock-api] ${db.products.length} products, ${db.categories.length} categories`);
});
