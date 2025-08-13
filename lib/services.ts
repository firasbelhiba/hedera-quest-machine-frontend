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
  static async login(email: string, password: string): Promise<User> {
    if (useApi()) {
      return ApiAuth.login({ email, password });
    }
    await this.delay();
    const user = mockUsers.find(u => u.email === email);
    if (!user) throw new Error('Invalid email or password');
    return user;
  }

  static async register(userData: {
    name: string;
    email: string;
    password: string;
    hederaAccountId: string;
  }): Promise<User> {
    if (useApi()) {
      return ApiAuth.register(userData);
    }
    await this.delay();
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }
    const existingHederaAccount = mockUsers.find(u => u.hederaAccountId === userData.hederaAccountId);
    if (existingHederaAccount) {
      throw new Error('This Hedera account is already linked to another user');
    }
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`,
      hederaAccountId: userData.hederaAccountId,
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
    if (useApi()) {
      try {
        const me = await ApiAuth.me();
        return me;
      } catch {
        return null;
      }
    }
    await this.delay();
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
    if (useApi()) {
      return QuestsApi.list(filters);
    }
    await this.delay();
    let filtered = [...mockQuests];
    if (filters) {
      if (filters.categories.length > 0) {
        filtered = filtered.filter(q => filters.categories.includes(q.category));
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

  static async createQuest(quest: Omit<Quest, 'id' | 'createdAt' | 'updatedAt' | 'completions'>): Promise<Quest> {
    if (useApi()) {
      return QuestsApi.create(quest);
    }
    await this.delay();
    const newQuest: Quest = {
      ...quest,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completions: 0
    };
    mockQuests.push(newQuest);
    return newQuest;
  }

  static async updateQuest(id: string, updates: Partial<Quest>): Promise<Quest> {
    if (useApi()) {
      return QuestsApi.update(id, updates);
    }
    await this.delay();
    const questIndex = mockQuests.findIndex(q => q.id === id);
    if (questIndex === -1) throw new Error('Quest not found');
    mockQuests[questIndex] = { 
      ...mockQuests[questIndex], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    return mockQuests[questIndex];
  }

  static async deleteQuest(id: string): Promise<void> {
    if (useApi()) {
      return QuestsApi.remove(id);
    }
    await this.delay();
    const questIndex = mockQuests.findIndex(q => q.id === id);
    if (questIndex === -1) throw new Error('Quest not found');
    mockQuests.splice(questIndex, 1);
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