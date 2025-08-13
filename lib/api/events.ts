import { api } from './client';
import type { Event } from '@/lib/types';

export const EventsApi = {
  async list(): Promise<Event[]> {
    const { data } = await api.get<Event[]>('/events');
    return data;
  },
  async get(id: string): Promise<Event> {
    const { data } = await api.get<Event>(`/events/${id}`);
    return data;
  }
};


