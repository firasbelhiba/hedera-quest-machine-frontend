import axios from 'axios';
import type { Event } from '@/lib/types';

export const EventsApi = {
  async list(): Promise<Event[]> {
    const token = localStorage.getItem('auth_token');
    const { data } = await axios.get('/api/events', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return data;
  },
  async get(id: string): Promise<Event> {
    const token = localStorage.getItem('auth_token');
    const { data } = await axios.get(`/api/events/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return data;
  }
};


