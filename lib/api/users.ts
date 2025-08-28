import { api } from './client';
import type { User } from '@/lib/types';

export interface Notification {
  id: number;
  notif_type: 'new_quest' | 'quest_validated' | 'quest_rejected';
  created_at: string;
  updated_at: string;
  seen: boolean;
  quest_id: number;
  to_user: number;
  admin_id: number | null;
}

export interface AdminNotification {
  id: number;
  type: 'pending_quest' | 'quest_validated' | 'quest_rejected';
  message: string;
  createdAt: string;
  seen: boolean;
  quest_id?: number;
}

export const UsersApi = {
  async get(userId: string): Promise<User> {
    const { data } = await api.get(`/api/users/${userId}`);
    return data;
  },
  async update(userId: string, updates: Partial<User>): Promise<User> {
    const { data } = await api.patch(`/api/users/${userId}`, updates);
    return data;
  },
  async getNotifications(): Promise<{ notifications: Notification[] }> {
    const { data } = await api.get('/user/notifications');
    return data;
  },
  async getUnreadNotificationCount(): Promise<{ status: string; unreadCount: number }> {
    const { data } = await api.get('/user/notification/number');
    return data;
  },
  // Admin notification functions
  async getAdminNotifications(): Promise<{ notifications: AdminNotification[] }> {
    const { data } = await api.get('/admin/notifications');
    return data;
  },
  async getAdminUnreadNotificationCount(): Promise<{ status: string; unreadCount: number }> {
    const { data } = await api.get('/admin/notification/number');
    return data;
  }
};


