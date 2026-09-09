import api from './api';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types';

/**
 * Auth service — Souqy backend AuthController:
 *   POST /api/v1/auth/login     { email, password }        → { id, token, fullname, email }
 *   POST /api/v1/auth/register  { fullname, email, password } → { message }
 *
 * register() does not return a token, so callers log in afterwards.
 *
 * With VITE_USE_MOCK=true a fake session is issued locally.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface Session {
  user: User;
  token: string;
}

/**
 * Read the role claim out of a JWT without verifying it (the server is the only
 * thing that trusts it — this is purely for showing/hiding admin-only UI).
 * The backend issues `ClaimTypes.Role`, which serialises to the long URI; some
 * setups shorten it to `role`, so check both plus an array form.
 */
export function roleFromToken(token: string | null | undefined): string | undefined {
  if (!token) return undefined;
  try {
    const payload = token.split('.')[1];
    if (!payload) return undefined;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const claims = JSON.parse(json) as Record<string, unknown>;
    const raw =
      claims['role'] ??
      claims['roles'] ??
      claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    const value = Array.isArray(raw) ? raw[0] : raw;
    return typeof value === 'string' ? value : undefined;
  } catch {
    return undefined;
  }
}

/** Map the backend role string ("Admin" / "Customer") to the UI role. */
export const isAdminToken = (token: string | null | undefined): boolean =>
  roleFromToken(token)?.toLowerCase() === 'admin';

const toUser = (dto: LoginResponse, token: string): User => ({
  id: dto.id,
  name: dto.fullname,
  email: dto.email,
  role: isAdminToken(token) ? 'admin' : 'user',
});

export const authService = {
  async login(req: LoginRequest): Promise<Session> {
    if (USE_MOCK) {
      await wait(300);
      const mockRole: User['role'] = req.email.toLowerCase().startsWith('admin') ? 'admin' : 'user';
      return {
        token: `mock.${btoa(req.email)}.${Date.now()}`,
        user: { id: crypto.randomUUID(), name: req.email.split('@')[0], email: req.email, role: mockRole },
      };
    }
    const { data } = await api.post<LoginResponse>('/auth/login', req);
    return { token: data.token, user: toUser(data, data.token) };
  },

  async register(req: RegisterRequest): Promise<void> {
    if (USE_MOCK) {
      await wait(300);
      return;
    }
    await api.post('/auth/register', req);
  },

  /** Register then immediately log in so the user lands authenticated. */
  async registerAndLogin(req: RegisterRequest): Promise<Session> {
    await this.register(req);
    return this.login({ email: req.email, password: req.password });
  },
};
