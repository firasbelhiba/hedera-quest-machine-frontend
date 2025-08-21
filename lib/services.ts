import { 
  User, Quest, Submission, Badge, Event, LeaderboardEntry, LeaderboardResponse,
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
  // Authentication methods

  static async logout(): Promise<void> {
    try {
      await ApiAuth.logout();
    } catch (error) {
      throw error;
    }
  }



  static async getCurrentUser(): Promise<User | null> {
    try {
      const profileData = await ApiAuth.me();
      if (!profileData) {
        return null;
      }

      // Handle both admin and regular user data structures
      const userData = profileData.admin || profileData.user || profileData;
      if (!userData) {
        return null;
      }
      
      // Clean username by removing any brackets like [Admin]
      const cleanUsername = userData.username ? userData.username.replace(/\[.*?\]/g, '').trim() : '';
      
      const user: User = {
        id: String(userData.id),
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        name: (() => {
          if (profileData.is_admin) {
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
        email: userData.email,
        bio: userData.bio || '',
        avatar: '/logo.png',
        hederaAccountId: null,
        // Admin users don't have points
        points: profileData.is_admin ? undefined : (userData.userLevel ? ((userData.userLevel.level - 1) * 1000 + userData.userLevel.progress) : 0),
        level: userData.userLevel?.level || 1,
        streak: 0,
        joinedAt: userData.created_at || new Date().toISOString(),
        role: profileData.is_admin ? 'admin' : 'user',
        badges: [],
        completedQuests: [],
        userLevel: userData.userLevel,
        facebookProfile: userData.facebookProfile,
        twitterProfile: userData.twitterProfile,
        discordProfile: userData.discordProfile
      };
      
      return user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    throw new Error('Not implemented');
  }

  // Quest methods
  static async getQuests(filters?: FilterOptions): Promise<Quest[]> {
    try {
      const response = await QuestsApi.getQuests(filters);
      return response.data.map((quest: any) => ({
        ...quest,
        id: String(quest.id),
        createdAt: quest.created_at,
        updatedAt: quest.updated_at
      }));
    } catch (error) {
      console.error('Error fetching quests:', error);
      throw error;
    }
  }

  static async getQuest(id: string): Promise<Quest | null> {
    throw new Error('Not implemented');
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
    try {
      const response = await QuestsApi.createQuest(quest);
      return {
        ...response.data,
        id: String(response.data.id),
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at
      };
    } catch (error) {
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
    throw new Error('Not implemented');
  }

  static async activateQuest(id: string): Promise<Quest> {
    throw new Error('Not implemented');
  }

  static async deleteQuest(id: string): Promise<{ success: boolean; message: string }> {
    throw new Error('Not implemented');
  }

  // Submission methods
  static async submitQuest(questId: string, userId: string, content: SubmissionContent): Promise<Submission> {
    throw new Error('Not implemented');
  }

  static async getSubmissions(questId?: string, userId?: string): Promise<Submission[]> {
    throw new Error('Not implemented');
  }

  static async getQuestCompletions(): Promise<any> {
    throw new Error('Not implemented');
  }

  static async reviewSubmission(
    submissionId: string, 
    status: 'approved' | 'rejected' | 'needs-revision', 
    feedback?: string,
    points?: number
  ): Promise<Submission> {
    throw new Error('Not implemented');
  }

  // Badge methods
  static async getUserBadges(userId: string): Promise<Badge[]> {
    throw new Error('Not implemented');
  }

  static async getAllBadges(): Promise<Badge[]> {
    try {
      const response = await BadgesApi.getAllBadges();
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async awardBadge(userId: string, badgeId: string): Promise<Badge> {
    throw new Error('Not implemented');
  }

  // Leaderboard methods
  static async getLeaderboard(): Promise<LeaderboardResponse> {
    try {
      const response = await LeaderboardApi.getLeaderboard();
      return response;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  // Event methods
  static async getEvents(): Promise<Event[]> {
    throw new Error('Not implemented');
  }

  static async getEvent(id: string): Promise<Event | null> {
    throw new Error('Not implemented');
  }

  // Dashboard methods
  static async getDashboardStats(): Promise<DashboardStats> {
    throw new Error('Dashboard stats endpoint not implemented');
  }

  // Utility methods
  static validateHederaAccountId(accountId: string): boolean {
    const hederaAccountRegex = /^\d+\.\d+\.\d+$/;
    return hederaAccountRegex.test(accountId);
  }

  static validateTransactionId(transactionId: string): boolean {
    const transactionIdRegex = /^\d+\.\d+\.\d+@\d+\.\d+$/;
    return transactionIdRegex.test(transactionId);
  }

  static generateHashScanUrl(accountId: string, network: 'testnet' | 'mainnet' = 'testnet'): string {
    const baseUrl = network === 'mainnet' 
      ? 'https://hashscan.io/mainnet/account' 
      : 'https://hashscan.io/testnet/account';
    return `${baseUrl}/${accountId}`;
  }

  static generateTransactionUrl(transactionId: string, network: 'testnet' | 'mainnet' = 'testnet'): string {
    const baseUrl = network === 'mainnet' 
      ? 'https://hashscan.io/mainnet/transaction' 
      : 'https://hashscan.io/testnet/transaction';
    return `${baseUrl}/${transactionId}`;
  }
}