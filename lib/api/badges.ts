import { api } from './client';
import type { 
  Badge, 
  CreateBadgeRequest, 
  CreateBadgeResponse, 
  ListBadgesResponse, 
  GetBadgeResponse,
  BadgeFilters 
} from '@/lib/types';

export const BadgesApi = {
  async listByUser(userId: string): Promise<Badge[]> {
    const { data } = await api.get(`/users/${userId}/badges`);
    return data;
  },
  
  async award(userId: string, badgeId: string): Promise<Badge> {
    const { data } = await api.post(`/users/${userId}/badges`, { badgeId });
    return data;
  },

  async create(badgeData: CreateBadgeRequest): Promise<CreateBadgeResponse> {
    const { data } = await api.post('/badges', badgeData);
    return data;
  },

  async list(filters?: BadgeFilters): Promise<ListBadgesResponse> {
    const params = new URLSearchParams();
    
    if (filters?.rarity) {
      params.append('rarity', filters.rarity);
    }
    if (filters?.isActive !== undefined) {
      params.append('isActive', filters.isActive.toString());
    }
    if (filters?.createdBy) {
      params.append('createdBy', filters.createdBy.toString());
    }
    
    const queryString = params.toString();
    const url = queryString ? `/badges?${queryString}` : '/badges';
    
    const { data } = await api.get(url);
    return data;
  },

  async getById(id: string | number): Promise<GetBadgeResponse> {
    const { data } = await api.get(`/badges/${id}`);
    return data;
  },

  async update(id: string | number, badgeData: Partial<CreateBadgeRequest>): Promise<Badge> {
    const { data } = await api.put(`/badges/${id}`, badgeData);
    return data;
  },

  async delete(id: string | number): Promise<void> {
    await api.delete(`/badges/${id}`);
  }
};


