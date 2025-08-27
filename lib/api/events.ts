import { api } from './client';
import type { Event } from '@/lib/types';

interface CreateEventData {
  title: string;
  description: string;
  reward: string | number;
  reward_image: File;
}

interface UpdateEventData {
  title?: string;
  description?: string;
  reward?: string | number;
  reward_image?: File;
}

interface EventResponse {
  success: boolean;
  event?: Event;
  message?: string;
}

interface EventsListResponse {
  success: boolean;
  events: Event[];
  message?: string;
}

export const EventsApi = {
  async list(): Promise<Event[]> {
    const { data } = await api.get('/events/all');
    
    if (data.success) {
      return data.events;
    }
    throw new Error(data.message || 'Failed to fetch events');
  },

  async create(eventData: CreateEventData): Promise<Event> {
    const formData = new FormData();
    
    formData.append('title', eventData.title);
    formData.append('description', eventData.description);
    formData.append('reward', eventData.reward.toString());
    formData.append('reward_image', eventData.reward_image);

    const { data } = await api.post('/events/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    if (data.success) {
      return data.event;
    }
    throw new Error(data.message || 'Failed to create event');
  },

  async update(id: number, eventData: UpdateEventData): Promise<void> {
    const formData = new FormData();
    
    if (eventData.title) formData.append('title', eventData.title);
    if (eventData.description) formData.append('description', eventData.description);
    if (eventData.reward) formData.append('reward', eventData.reward.toString());
    if (eventData.reward_image) formData.append('reward_image', eventData.reward_image);

    const { data } = await api.post(`/events/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to update event');
    }
  },

  async delete(id: number): Promise<void> {
    const { data } = await api.delete(`/events/delete/${id}`);
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete event');
    }
  },

  async get(id: string): Promise<Event> {
    const { data } = await api.get(`/events/${id}`);
    
    if (data.success) {
      return data.event;
    }
    throw new Error(data.message || 'Failed to fetch event');
  }
};


