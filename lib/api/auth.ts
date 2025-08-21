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
    console.log("3asba", data)

    // Handle both admin and regular user data structures (similar to QuestService.getCurrentUser)
    const userData = data.admin || data.user || data;
    const isAdmin = data.is_admin || false;
    
    // Clean username by removing any brackets like [Admin]
    const cleanUsername = userData.username ? userData.username.replace(/\[.*?\]/g, '').trim() : '';
    
    // Create comprehensive user object from response data
    const user: User = {
      id: String(userData.id || Date.now()),
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      name: (() => {
        if (isAdmin) {
          // For admins, show full name
          const firstName = userData.firstName || '';
          const lastName = userData.lastName || '';
          const fullName = `${firstName} ${lastName}`.trim();
          return fullName || cleanUsername || 'Admin';
        } else {
          // For regular users, show username or full name
          const firstName = userData.firstName || '';
          const lastName = userData.lastName || '';
          const fullName = `${firstName} ${lastName}`.trim();
          return fullName || cleanUsername || 'User';
        }
      })(),
      email: userData.email || payload.email,
      bio: userData.bio || '',
      avatar: '/logo.png',
      hederaAccountId: null,
      // Admin users don't have points
      points: isAdmin ? undefined : (userData.total_points || 0),
      level: userData.userLevel?.level || 1,
      streak: 0,
      joinedAt: userData.created_at || new Date().toISOString(),
      role: isAdmin ? 'admin' : 'user',
      badges: [],
      completedQuests: [],
      userLevel: userData.userLevel,
      facebookProfile: userData.facebookProfile,
      twitterProfile: userData.twitterProfile,
      discordProfile: userData.discordProfile
    };

    return { user, isAdmin };
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


