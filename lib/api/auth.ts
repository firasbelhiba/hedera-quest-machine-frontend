import { api, tokenStorage } from './client';
import type { User } from '@/lib/types';

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = { name: string; email: string; password: string; hederaAccountId: string };
export type AuthResponse = { user: User; accessToken: string; refreshToken?: string };

export const AuthService = {
  async login(payload: LoginRequest): Promise<User> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    if (data.accessToken) tokenStorage.setAccessToken(data.accessToken);
    if (data.refreshToken) tokenStorage.setRefreshToken(data.refreshToken);
    return data.user;
  },

  async register(payload: RegisterRequest): Promise<User> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    if (data.accessToken) tokenStorage.setAccessToken(data.accessToken);
    if (data.refreshToken) tokenStorage.setRefreshToken(data.refreshToken);
    return data.user;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      tokenStorage.clearAll();
    }
  }
};


