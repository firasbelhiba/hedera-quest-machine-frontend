import { api } from './client';
import type { Quest, FilterOptions } from '@/lib/types';

export const QuestsApi = {
  async list(filters?: FilterOptions): Promise<Quest[]> {
    const { data } = await api.get<Quest[]>('/quests', { params: filters });
    return data;
  },
  async get(id: string): Promise<Quest> {
    const { data } = await api.get<Quest>(`/quests/${id}`);
    return data;
  },
  async create(payload: Omit<Quest, 'id' | 'createdAt' | 'updatedAt' | 'completions'>): Promise<Quest> {
    const { data } = await api.post<Quest>('/quests', payload);
    return data;
  },
  async update(id: string, updates: Partial<Quest>): Promise<Quest> {
    const { data } = await api.patch<Quest>(`/quests/${id}`, updates);
    return data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/quests/${id}`);
  }
};


