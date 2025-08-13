import { api } from './client';
import type { User } from '@/lib/types';

export const UsersApi = {
  async get(userId: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${userId}`);
    return data;
  },
  async update(userId: string, updates: Partial<User>): Promise<User> {
    const { data } = await api.patch<User>(`/users/${userId}`, updates);
    return data;
  }
};


