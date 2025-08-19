import { api } from './client';
import type { Quest, FilterOptions } from '@/lib/types';

export const QuestsApi = {
  async list(filters?: FilterOptions): Promise<Quest[]> {
    const response = await api.get('/quests', { 
      params: filters,
    });
    
    console.log('Quests API response:', response.data);
    
    // Handle the new response format: { success: true, data: [...], count: number }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fallback to direct array if response format is different
    return response.data;
  },
  async get(id: string): Promise<Quest> {
    const response = await api.get(`/quests/${id}`);
    
    // Handle the response format: { success: true, data: {...} }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fallback to direct object if response format is different
    return response.data;
  },
  async create(payload: {
    title: string;
    description: string;
    reward: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    status?: 'active' | 'completed' | 'expired' | 'draft';
    startDate?: string;
    endDate?: string;
    maxParticipants?: number;
    badgeIds?: number[];
    platform_type?: string;
    interaction_type?: string;
  }): Promise<Quest> {
    console.log('Creating quest with payload:', payload);
    
    const response = await api.post('/quests', payload);
    
    console.log('Create quest response:', response.data);
    
    // Handle the response format: { success: true, data: {...}, message: string }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fallback to direct object if response format is different
    return response.data;
  },
  async update(id: string, updates: {
    title?: string;
    description?: string;
    reward?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    status?: 'active' | 'completed' | 'expired' | 'draft';
    startDate?: string;
    endDate?: string;
    maxParticipants?: number;
    badgeIds?: number[];
  }): Promise<Quest> {
    console.log('Updating quest with payload:', updates);
    
    const response = await api.put(`/quests/${id}`, updates);
    
    console.log('Update quest response:', response.data);
    
    // Handle the response format: { success: true, data: {...}, message: string }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fallback to direct object if response format is different
    return response.data;
  },
  async activate(id: string): Promise<Quest> {
    console.log('Activating quest with ID:', id);
    
    const response = await api.put(`/quests/${id}`, { status: 'active' });
    
    console.log('Activate quest response:', response.data);
    
    // Handle the response format: { success: true, data: {...}, message: string }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fallback to direct object if response format is different
    return response.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/quests/${id}`);
  },
  async deleteQuest(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/quests/${id}`);
    
    // Handle the response format: { success: true, message: string }
    if (response.data.success) {
      return response.data;
    }
    
    // Fallback response
    return { success: true, message: "Quest deleted successfully" };
  }
};


