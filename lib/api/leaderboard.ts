import { api } from './client';
import type { LeaderboardEntry } from '@/lib/types';

export const LeaderboardApi = {
  async list(limit: number = 50): Promise<LeaderboardEntry[]> {
    const { data } = await api.get<LeaderboardEntry[]>('/leaderboard', { params: { limit } });
    return data;
  }
};


