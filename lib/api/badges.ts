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
    // Check if image is a File object (for file uploads) or string (for URL)
    if (badgeData.image && typeof badgeData.image !== 'string') {
      // Handle file upload with FormData
      const formData = new FormData();
      formData.append('name', badgeData.name);
      formData.append('description', badgeData.description);
      formData.append('maxToObtain', badgeData.maxToObtain.toString());
      formData.append('rarity', badgeData.rarity);
      formData.append('points', badgeData.points.toString());
      formData.append('image', badgeData.image as File);
      if (badgeData.isActive !== undefined) {
        formData.append('isActive', badgeData.isActive.toString());
      }
      
      const { data } = await api.post('/badges', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return data;
    } else {
      // Handle regular JSON payload
      const { data } = await api.post('/badges', badgeData);
      return data;
    }
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
    // Check if image is a File object (for file uploads) or string (for URL)
    if (badgeData.image && typeof badgeData.image !== 'string') {
      // Handle file upload with FormData
      const formData = new FormData();
      if (badgeData.name) formData.append('name', badgeData.name);
      if (badgeData.description) formData.append('description', badgeData.description);
      if (badgeData.maxToObtain) formData.append('maxToObtain', badgeData.maxToObtain.toString());
      if (badgeData.rarity) formData.append('rarity', badgeData.rarity);
      if (badgeData.points !== undefined) formData.append('points', badgeData.points.toString());
      formData.append('image', badgeData.image as File);
      if (badgeData.isActive !== undefined) {
        formData.append('isActive', badgeData.isActive.toString());
      }
      
      const { data } = await api.put(`/badges/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return data;
    } else {
      // Handle regular JSON payload
      const { data } = await api.put(`/badges/${id}`, badgeData);
      return data;
    }
  },

  async delete(id: string | number): Promise<void> {
    await api.delete(`/badges/${id}`);
  }
};


