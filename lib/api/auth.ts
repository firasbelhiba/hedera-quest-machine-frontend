import { api, tokenStorage } from './client';
import axios from 'axios';
import type { User } from '@/lib/types';

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = { name: string; email: string; password: string; confirmPassword: string };
export type AuthResponse = { user: User; accessToken: string; refreshToken?: string };

export const AuthService = {
  async login(payload: LoginRequest): Promise<{ user: User; isAdmin: boolean }> {
    // Use Next.js API proxy to avoid CORS issues
    console.log('Logging in with proxy URL: /auth/login');
    console.log('Request body:', payload);
    
    const { data } = await api.post('/auth/login', payload);

    console.log('Login response:', data);

    // Store token using the proper token storage mechanism
    if (data.token) {
      tokenStorage.setAccessToken(data.token);
    }

    // Create user object from response
    const user: User = {
      id: '1', // You might want to decode the JWT to get the actual user ID
      name: payload.email.split('@')[0], // Use email prefix as name for now
      email: payload.email,
      avatar: '/logo.png',
      hederaAccountId: '',
      points: 0,
      level: 1,
      streak: 0,
      joinedAt: new Date().toISOString(),
      role: data.is_admin ? 'admin' : 'user',
      badges: [],
      completedQuests: []
    };

    return { user, isAdmin: data.is_admin };
  },

  async register(payload: RegisterRequest): Promise<User> {
    // Map current UI fields to backend contract at /user/register
    const [firstName, ...rest] = payload.name.trim().split(' ');
    const lastName = rest.join(' ') || firstName;
    const username = payload.email.split('@')[0];
    const body = {
      firstName,
      lastName,
      username,
      email: payload.email,
      password: payload.password,
      bio: ''
    };

    // Use Next.js API proxy to avoid CORS issues
    console.log('Registering with proxy URL: /user/register');
    console.log('Request body:', body);
    
    const { data } = await api.post('/user/register', body);

    // Best-effort user construction until backend spec is finalized
    const returnedUser: any = data?.user || data;
    const user: User = {
      id: String(returnedUser?.id ?? Date.now()),
      name: `${firstName} ${lastName}`.trim(),
      email: payload.email,
      avatar: returnedUser?.avatar || '/logo.png',
      hederaAccountId: '',
      points: 0,
      level: 1,
      streak: 0,
      joinedAt: new Date().toISOString(),
      role: 'user',
      badges: [],
      completedQuests: []
    };

    // Store tokens if present
    if (data?.accessToken) tokenStorage.setAccessToken(data.accessToken);
    if (data?.refreshToken) tokenStorage.setRefreshToken(data.refreshToken);
    return user;
  },



  async me(): Promise<{ admin: any; is_admin: boolean }> {
    console.log('Fetching user profile with token');
    
    const { data } = await api.get('/profile/me');

    console.log('Profile response:', data);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      tokenStorage.clearAll();
    }
  },

  async verifyToken(token: string): Promise<{ success: boolean; message: string }> {
    console.log('Verifying token:', token);
    
    const { data } = await api.get('/profile/verify-token', {
      params: { token }
    });

    console.log('Token verification response:', data);
    return data;
  }
};


