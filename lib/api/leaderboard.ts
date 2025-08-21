import { api } from './client';
import type { LeaderboardResponse } from '@/lib/types';

export const LeaderboardApi = {
  async getLeaderboard(): Promise<LeaderboardResponse> {
    const response = await api.get('/user/leaderboard');
    return response.data;
  }
};


