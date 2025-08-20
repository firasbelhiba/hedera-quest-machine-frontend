import { 
  User, Quest, Submission, Badge, Event, LeaderboardEntry, 
  DashboardStats, FilterOptions, SubmissionContent 
} from './types';
import { 
  mockUsers, mockQuests, mockSubmissions, mockBadges, 
  mockEvents, mockLeaderboard, mockDashboardStats 
} from './mock-data';
import { AuthService as ApiAuth } from './api/auth';
import { QuestsApi } from './api/quests';
import { SubmissionsApi } from './api/submissions';
import { BadgesApi } from './api/badges';
import { LeaderboardApi } from './api/leaderboard';
import { EventsApi } from './api/events';
import { UsersApi } from './api/users';

// Mock service layer - replace with actual API calls
const useApi = () => process.env.NEXT_PUBLIC_USE_API === 'true';

export class QuestService {
  private static delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Auth Services
  static async login(email: string, password: string): Promise<{ user: User; isAdmin: boolean }> {
    console.log('QuestService.login called with:', { email, password });
    console.log('useApi():', useApi());
    
    if (useApi()) {
      console.log('Using API login');
      const result = await ApiAuth.login({ email, password });
      // Store user data in localStorage for fallback use
      if (result.user) {
        localStorage.setItem('user_data', JSON.stringify({
          name: result.user.name,
          email: result.user.email,
          id: result.user.id
        }));
      }
      return result;
    }
    
    console.log('Using mock login');
    await this.delay();
    const user = mockUsers.find(u => u.email === email);
    console.log('Found user:', user);
    if (!user) throw new Error('Invalid email or password');
    
    // For mock data, we'll accept any password for demo purposes
    // In a real app, you'd verify the password hash here
    console.log('Mock login successful for:', user.email);
    const isAdmin = user.role === 'admin';
    // Store user data in localStorage for fallback use
    localStorage.setItem('user_data', JSON.stringify({
      name: user.name,
      email: user.email,
      id: user.id
    }));
    return { user, isAdmin };
  }

  static async logout(): Promise<void> {
    if (useApi()) {
      await ApiAuth.logout();
      // Clear stored user data
      localStorage.removeItem('user_data');
      return;
    }
    // Clear stored user data for mock logout too
    localStorage.removeItem('user_data');
  }

  static async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    if (useApi()) {
      // Add confirmPassword to match RegisterRequest type
      const registerData = {
        ...userData,
        confirmPassword: userData.password // For API compatibility
      };
      return ApiAuth.register(registerData);
    }
    await this.delay();
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`,
      hederaAccountId: null,
      points: 0,
      level: 1,
      streak: 0,
      joinedAt: new Date().toISOString(),
      role: 'user',
      badges: [],
      completedQuests: []
    };
    mockUsers.push(newUser);
    return newUser;
  }

  static async getCurrentUser(): Promise<User | null> {
    console.log('getCurrentUser called');
    
    if (useApi()) {
      try {
        console.log('Using API getCurrentUser');
        const profileData = await ApiAuth.me();
        console.log('Profile data received:', profileData);
        
        // Convert API response to User object
        const user: User = {
          id: String(profileData.user.id),
          firstName: profileData.user.firstName,
          lastName: profileData.user.lastName,
          username: profileData.user.username,
          name: `${profileData.user.firstName} ${profileData.user.lastName}`.trim() || profileData.user.username,
          email: profileData.user.email,
          bio: profileData.user.bio || '',
          avatar: '/logo.png',
          hederaAccountId: null,
          points: profileData.user.userLevel ? ((profileData.user.userLevel.level - 1) * 1000 + profileData.user.userLevel.progress) : 0,
          level: profileData.user.userLevel?.level || 1,
          streak: 0,
          joinedAt: profileData.user.created_at || new Date().toISOString(),
          role: profileData.is_admin ? 'admin' : 'user',
          badges: [],
          completedQuests: [],
          userLevel: profileData.user.userLevel,
          facebookProfile: profileData.user.facebookProfile,
          twitterProfile: profileData.user.twitterProfile,
          discordProfile: profileData.user.discordProfile
        };
        
        return user;
      } catch (error) {
        console.error('Error fetching current user:', error);
        // If API fails, try to get user info from stored login data or token
        const token = localStorage.getItem('auth_token');
        if (token) {
          console.log('API failed, but token exists. Trying to extract user info from token or use stored data.');
          
          // Try to get user email from stored data or decode token
          let userEmail = 'user@example.com';
          let userName = 'User';
          
          // Check if we have stored user data from login
          const storedUserData = localStorage.getItem('user_data');
          if (storedUserData) {
            try {
              const userData = JSON.parse(storedUserData);
              userEmail = userData.email || userEmail;
              userName = userData.name || userName;
            } catch (e) {
              console.log('Could not parse stored user data');
            }
          }
          
          // If no stored data, try to extract from token (basic JWT decode)
          if (userName === 'User') {
            try {
              const tokenParts = token.split('.');
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                userEmail = payload.email || payload.sub || userEmail;
                userName = payload.name || userEmail.split('@')[0] || userName;
              }
            } catch (e) {
              console.log('Could not decode token, using fallback');
              // Use email prefix as name if we can't get it from token
              userName = userEmail.split('@')[0];
            }
          }
          
          return {
            id: '1',
            name: userName,
            email: userEmail,
            avatar: '/logo.png',
            hederaAccountId: '',
            points: 1250,
            level: 3,
            streak: 7,
            joinedAt: new Date().toISOString(),
            role: 'user',
            badges: [],
            completedQuests: ['quest-1', 'quest-2', 'quest-3']
          };
        }
        return null;
      }
    }
    
    // Mock data fallback
    console.log('Using mock getCurrentUser');
    const token = localStorage.getItem('auth_token');
    if (token) {
      return {
        id: '1',
        name: 'Demo User',
        email: 'demo@example.com',
        avatar: '/logo.png',
        hederaAccountId: '',
        points: 1250,
        level: 3,
        streak: 7,
        joinedAt: new Date().toISOString(),
        role: 'user',
        badges: [],
        completedQuests: ['quest-1', 'quest-2', 'quest-3']
      };
    }
    return null;
  }

  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    if (useApi()) {
      return UsersApi.update(userId, updates);
    }
    await this.delay();
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    return mockUsers[userIndex];
  }

  // Quest Services
  static async getQuests(filters?: FilterOptions): Promise<Quest[]> {
    console.log('QuestService.getQuests called with filters:', filters);
    console.log('useApi():', useApi());
    
    if (useApi()) {
      console.log('Using API getQuests');
      try {
        const quests = await QuestsApi.list(filters);
        console.log('API quests received:', quests);
        return quests;
      } catch (error) {
        console.error('Error fetching quests from API:', error);
        throw error;
      }
    }
    await this.delay();
    let filtered = [...mockQuests];
    if (filters) {
      if (filters.categories.length > 0) {
        filtered = filtered.filter(q => q.category && filters.categories.includes(q.category));
      }
      if (filters.difficulties.length > 0) {
        filtered = filtered.filter(q => filters.difficulties.includes(q.difficulty));
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(q => 
          q.title.toLowerCase().includes(search) ||
          q.description.toLowerCase().includes(search)
        );
      }
    }
    return filtered;
  }

  static async getQuest(id: string): Promise<Quest | null> {
    if (useApi()) {
      return QuestsApi.get(id);
    }
    await this.delay();
    return mockQuests.find(q => q.id === id) || null;
  }

  static async createQuest(quest: {
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
    console.log('QuestService.createQuest called with:', quest);
    console.log('useApi():', useApi());
    
    if (useApi()) {
      console.log('Using API createQuest');
      try {
        const newQuest = await QuestsApi.create(quest);
        console.log('API quest created:', newQuest);
        return newQuest;
      } catch (error) {
        console.error('Error creating quest via API:', error);
        throw error;
      }
    }
    
    console.log('Using mock createQuest');
    await this.delay();
    const newQuest: Quest = {
      ...quest,
      reward: quest.reward.toString(),
      difficulty: quest.difficulty as any, // Cast to avoid type issues
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completions: 0,
      currentParticipants: 0
    };
    mockQuests.push(newQuest);
    return newQuest;
  }

  static async updateQuest(id: string, updates: {
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
    if (useApi()) {
      return QuestsApi.update(id, updates);
    }
    await this.delay();
    const questIndex = mockQuests.findIndex(q => q.id === id);
    if (questIndex === -1) throw new Error('Quest not found');
    const { reward, ...otherUpdates } = updates;
    const updatedQuest = {
      ...mockQuests[questIndex], 
      ...otherUpdates,
      ...(reward !== undefined && { reward: reward.toString() }),
      updatedAt: new Date().toISOString() 
    };
    mockQuests[questIndex] = updatedQuest;
    return mockQuests[questIndex];
  }

  static async activateQuest(id: string): Promise<Quest> {
    if (useApi()) {
      return QuestsApi.activate(id);
    }
    await this.delay();
    const questIndex = mockQuests.findIndex(q => q.id === id);
    if (questIndex === -1) throw new Error('Quest not found');
    mockQuests[questIndex] = { 
      ...mockQuests[questIndex], 
      status: 'active',
      isActive: true,
      updatedAt: new Date().toISOString() 
    };
    return mockQuests[questIndex];
  }

  static async deleteQuest(id: string): Promise<{ success: boolean; message: string }> {
    if (useApi()) {
      return QuestsApi.deleteQuest(id);
    }
    await this.delay();
    const questIndex = mockQuests.findIndex(q => q.id === id);
    if (questIndex === -1) throw new Error('Quest not found');
    mockQuests.splice(questIndex, 1);
    return { success: true, message: "Quest deleted successfully" };
  }

  // Submission Services
  static async submitQuest(questId: string, userId: string, content: SubmissionContent): Promise<Submission> {
    if (useApi()) {
      return SubmissionsApi.submit(questId, content);
    }
    await this.delay();
    const newSubmission: Submission = {
      id: Date.now().toString(),
      questId,
      userId,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      content
    };
    mockSubmissions.push(newSubmission);
    return newSubmission;
  }

  static async getSubmissions(questId?: string, userId?: string): Promise<Submission[]> {
    if (useApi()) {
      return SubmissionsApi.list({ questId, userId });
    }
    await this.delay();
    let filtered = [...mockSubmissions];
    if (questId) filtered = filtered.filter(s => s.questId === questId);
    if (userId) filtered = filtered.filter(s => s.userId === userId);
    return filtered;
  }

  static async getQuestCompletions(): Promise<any> {
    if (useApi()) {
      return SubmissionsApi.getQuestCompletions();
    }
    await this.delay();
    // Mock data structure matching the API response
    return {
      success: true,
      quests: mockQuests.map(quest => ({
        ...quest,
        completions: mockSubmissions
          .filter(s => s.questId === quest.id)
          .map(submission => ({
            ...submission,
            user: mockUsers.find(u => u.id === submission.userId)
          }))
      }))
    };
  }

  static async reviewSubmission(
    submissionId: string, 
    status: 'approved' | 'rejected' | 'needs-revision', 
    feedback?: string,
    points?: number
  ): Promise<Submission> {
    if (useApi()) {
      return SubmissionsApi.review(submissionId, { status, feedback, points });
    }
    await this.delay();
    const submissionIndex = mockSubmissions.findIndex(s => s.id === submissionId);
    if (submissionIndex === -1) throw new Error('Submission not found');
    mockSubmissions[submissionIndex] = {
      ...mockSubmissions[submissionIndex],
      status,
      feedback,
      points,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin'
    };
    return mockSubmissions[submissionIndex];
  }

  // Badge Services
  static async getUserBadges(userId: string): Promise<Badge[]> {
    if (useApi()) {
      return BadgesApi.listByUser(userId);
    }
    await this.delay();
    return mockBadges;
  }

  static async getAllBadges(): Promise<Badge[]> {
    if (useApi()) {
      const response = await BadgesApi.list();
      return response.data;
    }
    await this.delay();
    return mockBadges;
  }

  static async awardBadge(userId: string, badgeId: string): Promise<Badge> {
    if (useApi()) {
      return BadgesApi.award(userId, badgeId);
    }
    await this.delay();
    const badge = mockBadges.find(b => b.id === badgeId);
    if (!badge) throw new Error('Badge not found');
    return badge;
  }

  // Leaderboard Services
  static async getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    if (useApi()) {
      return LeaderboardApi.list(limit);
    }
    await this.delay();
    return mockLeaderboard.slice(0, limit);
  }

  // Event Services
  static async getEvents(): Promise<Event[]> {
    if (useApi()) {
      return EventsApi.list();
    }
    await this.delay();
    return mockEvents;
  }

  static async getEvent(id: string): Promise<Event | null> {
    if (useApi()) {
      return EventsApi.get(id);
    }
    await this.delay();
    return mockEvents.find(e => e.id === id) || null;
  }

  // Analytics Services
  static async getDashboardStats(): Promise<DashboardStats> {
    if (useApi()) {
      // For now, return mock data since there's no API endpoint for dashboard stats
      await this.delay();
      return mockDashboardStats;
    }
    await this.delay();
    return mockDashboardStats;
  }

  // Hedera Services
  static validateHederaAccountId(accountId: string): boolean {
    const regex = /^0\.0\.\d+$/;
    return regex.test(accountId);
  }

  static validateTransactionId(transactionId: string): boolean {
    const regex = /^0\.0\.\d+@\d+\.\d+$/;
    return regex.test(transactionId);
  }

  static generateHashScanUrl(accountId: string, network: 'testnet' | 'mainnet' = 'testnet'): string {
    const baseUrl = network === 'testnet' 
      ? 'https://hashscan.io/testnet' 
      : 'https://hashscan.io/mainnet';
    return `${baseUrl}/account/${accountId}`;
  }

  static generateTransactionUrl(transactionId: string, network: 'testnet' | 'mainnet' = 'testnet'): string {
    const baseUrl = network === 'testnet' 
      ? 'https://hashscan.io/testnet' 
      : 'https://hashscan.io/mainnet';
    return `${baseUrl}/transaction/${transactionId}`;
  }
}