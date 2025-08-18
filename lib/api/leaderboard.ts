import axios from 'axios';
import type { LeaderboardEntry } from '@/lib/types';

export const LeaderboardApi = {
  async list(limit: number = 50): Promise<LeaderboardEntry[]> {
    const token = localStorage.getItem('auth_token');
    const { data } = await axios.get('/api/leaderboard', { 
      params: { limit },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return data;
  }
};


