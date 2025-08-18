import axios from 'axios';
import type { User } from '@/lib/types';

export const UsersApi = {
  async get(userId: string): Promise<User> {
    const token = localStorage.getItem('auth_token');
    const { data } = await axios.get(`/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return data;
  },
  async update(userId: string, updates: Partial<User>): Promise<User> {
    const token = localStorage.getItem('auth_token');
    const { data } = await axios.patch(`/api/users/${userId}`, updates, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return data;
  }
};


