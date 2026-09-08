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

const toUser = (dto: LoginResponse): User => ({
  id: dto.id,
  name: dto.fullname,
  email: dto.email,
});

export const authService = {
  async login(req: LoginRequest): Promise<Session> {
    if (USE_MOCK) {
      await wait(300);
      return {
        token: `mock.${btoa(req.email)}.${Date.now()}`,
        user: { id: crypto.randomUUID(), name: req.email.split('@')[0], email: req.email },
      };
    }
    const { data } = await api.post<LoginResponse>('/auth/login', req);
    return { token: data.token, user: toUser(data) };
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
