import { api } from './client';
import type { Badge } from '@/lib/types';

export const BadgesApi = {
  async listByUser(userId: string): Promise<Badge[]> {
    const { data } = await api.get<Badge[]>(`/users/${userId}/badges`);
    return data;
  },
  async award(userId: string, badgeId: string): Promise<Badge> {
    const { data } = await api.post<Badge>(`/users/${userId}/badges`, { badgeId });
    return data;
  }
};


