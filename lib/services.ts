import { 
  User, Quest, Submission, Badge, Event, LeaderboardEntry, 
  DashboardStats, FilterOptions, SubmissionContent 
} from './types';
import { AuthService as ApiAuth } from './api/auth';
import { QuestsApi } from './api/quests';
import { SubmissionsApi } from './api/submissions';
import { BadgesApi } from './api/badges';
import { LeaderboardApi } from './api/leaderboard';
import { EventsApi } from './api/events';
import { UsersApi } from './api/users';

export class QuestService {

  // Auth Services
  static async login(email: string, password: string): Promise<{ user: User; isAdmin: boolean }> {
    console.log('QuestService.login called with:', { email, password });
    
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

  static async logout(): Promise<void> {
    await ApiAuth.logout();
    // Clear stored user data
    localStorage.removeItem('user_data');
  }

  static async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    // Add confirmPassword to match RegisterRequest type
    const registerData = {
      ...userData,
      confirmPassword: userData.password // For API compatibility
    };
    return ApiAuth.register(registerData);
  }

  static async getCurrentUser(): Promise<User | null> {
    console.log('getCurrentUser called');
    
    try {
      console.log('Using API getCurrentUser');
      const profileData = await ApiAuth.me();
      console.log('Profile data received:', profileData);
      console.log('Admin object:', profileData.admin);
      console.log('firstName:', profileData.admin?.firstName);
      console.log('lastName:', profileData.admin?.lastName);
      console.log('username:', profileData.admin?.username);
      
      // Convert API response to User object
      const user: User = {
        id: String(profileData.admin.id),
        firstName: profileData.admin.firstName,
        lastName: profileData.admin.lastName,
        username: profileData.admin.username,
        name: (() => {
          if (profileData.is_admin) {
            // For admins, show full name
            const firstName = profileData.admin.firstName || '';
            const lastName = profileData.admin.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim();
            return fullName || profileData.admin.username || 'Admin User';
          } else {
            // For regular users, show username
            return profileData.admin.username || 'User';
          }
        })(),
        email: profileData.admin.email,
        bio: profileData.admin.bio || '',
        avatar: '/logo.png',
        hederaAccountId: null,
        points: profileData.admin.userLevel ? ((profileData.admin.userLevel.level - 1) * 1000 + profileData.admin.userLevel.progress) : 0,
        level: profileData.admin.userLevel?.level || 1,
        streak: 0,
        joinedAt: profileData.admin.created_at || new Date().toISOString(),
        role: profileData.is_admin ? 'admin' : 'user',
        badges: [],
        completedQuests: [],
        userLevel: profileData.admin.userLevel,
        facebookProfile: profileData.admin.facebookProfile,
        twitterProfile: profileData.admin.twitterProfile,
        discordProfile: profileData.admin.discordProfile
      };
      
      return user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    return UsersApi.update(userId, updates);
  }

  // Quest Services
  static async getQuests(filters?: FilterOptions): Promise<Quest[]> {
    console.log('QuestService.getQuests called with filters:', filters);
    
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

  static async getQuest(id: string): Promise<Quest | null> {
    return QuestsApi.get(id);
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
    return QuestsApi.update(id, updates);
  }

  static async activateQuest(id: string): Promise<Quest> {
    return QuestsApi.activate(id);
  }

  static async deleteQuest(id: string): Promise<{ success: boolean; message: string }> {
    return QuestsApi.deleteQuest(id);
  }

  // Submission Services
  static async submitQuest(questId: string, userId: string, content: SubmissionContent): Promise<Submission> {
    return SubmissionsApi.submit(questId, content);
  }

  static async getSubmissions(questId?: string, userId?: string): Promise<Submission[]> {
    return SubmissionsApi.list({ questId, userId });
  }

  static async getQuestCompletions(): Promise<any> {
    return SubmissionsApi.getQuestCompletions();
  }

  static async reviewSubmission(
    submissionId: string, 
    status: 'approved' | 'rejected' | 'needs-revision', 
    feedback?: string,
    points?: number
  ): Promise<Submission> {
    return SubmissionsApi.review(submissionId, { status, feedback, points });
  }

  // Badge Services
  static async getUserBadges(userId: string): Promise<Badge[]> {
    return BadgesApi.listByUser(userId);
  }

  static async getAllBadges(): Promise<Badge[]> {
    const response = await BadgesApi.list();
    return response.data;
  }

  static async awardBadge(userId: string, badgeId: string): Promise<Badge> {
    return BadgesApi.award(userId, badgeId);
  }

  // Leaderboard Services
  static async getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    return LeaderboardApi.list(limit);
  }

  // Event Services
  static async getEvents(): Promise<Event[]> {
    return EventsApi.list();
  }

  static async getEvent(id: string): Promise<Event | null> {
    return EventsApi.get(id);
  }

  // Analytics Services
  static async getDashboardStats(): Promise<DashboardStats> {
    // Note: This might need to be implemented when dashboard stats API is available
    // For now, this will likely throw an error if no API endpoint exists
    throw new Error('Dashboard stats API endpoint not implemented');
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