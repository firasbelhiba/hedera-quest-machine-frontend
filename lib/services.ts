import {
  User,
  Quest,
  Submission,
  Badge,
  Event,
  LeaderboardEntry,
  LeaderboardResponse,
  FilterOptions,
  SubmissionContent,
  QuestCategory,
} from "./types";
import { AuthService as ApiAuth } from "./api/auth";
import { QuestsApi } from "./api/quests";
import { SubmissionsApi } from "./api/submissions";
import { BadgesApi } from "./api/badges";
import { LeaderboardApi } from "./api/leaderboard";
import { EventsApi } from "./api/events";
import { UsersApi } from "./api/users";

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
      const userData =
        (profileData as any).admin || (profileData as any).user || profileData;
      if (!userData) {
        return null;
      }

      // Clean username by removing any brackets like [Admin]
      const cleanUsername = userData.username
        ? userData.username.replace(/\[.*?\]/g, "").trim()
        : "";

      const user: User = {
        id: String(userData.id),
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        name: (() => {
          if (profileData.is_admin) {
            // For admins, show full name
            const firstName = userData.firstName || "";
            const lastName = userData.lastName || "";
            const fullName = `${firstName} ${lastName}`.trim();
            return fullName || cleanUsername || "Admin";
          } else {
            // For regular users, show username or full name
            const firstName = userData.firstName || "";
            const lastName = userData.lastName || "";
            const fullName = `${firstName} ${lastName}`.trim();
            return fullName || cleanUsername || "User";
          }
        })(),
        email: userData.email,
        bio: userData.bio || "",
        avatar: "/logo.png",
        hederaAccountId: null,
        // Admin users don't have points
        points: profileData.is_admin ? undefined : userData.total_points || 0,
        level: userData.userLevel?.level || 1,
        streak: 0,
        joinedAt: userData.created_at || new Date().toISOString(),
        role: profileData.is_admin ? "admin" : "user",
        badges: [],
        completedQuests: [],
        userLevel: userData.userLevel,
        facebookProfile: userData.facebookProfile,
        twitterProfile: userData.twitterProfile,
        discordProfile: userData.discordProfile,
      };

      return user;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  }

  static async updateUserProfile(
    userId: string,
    updates: Partial<User>
  ): Promise<User> {
    throw new Error("Not implemented");
  }

  // Quest methods
  static async getQuests(filters?: FilterOptions): Promise<Quest[]> {
    try {
      const response = await QuestsApi.list(filters);
      return Array.isArray(response)
        ? response.map((quest: any) => ({
            ...quest,
            id: String(quest.id),
            createdAt: quest.created_at || quest.createdAt,
            updatedAt: quest.updated_at || quest.updatedAt,
          }))
        : [];
    } catch (error) {
      console.error("Error fetching quests:", error);
      throw error;
    }
  }

  static async getQuest(id: string): Promise<Quest | null> {
    try {
      const response = await QuestsApi.get(id);
      return {
        ...response,
        id: String(response.id),
        createdAt: response.createdAt || (response as any).created_at,
        updatedAt: response.updatedAt || response.updated_at,
      };
    } catch (error) {
      console.error("Error fetching quest:", error);
      throw error;
    }
  }

  static async createQuest(quest: {
    title: string;
    description: string;
    reward: number;
    difficulty:
      | "easy"
      | "medium"
      | "hard"
      | "beginner"
      | "intermediate"
      | "advanced"
      | "expert";
    status?: "active" | "completed" | "expired" | "draft";
    startDate?: string;
    endDate?: string;
    maxParticipants?: number;
    currentParticipants?: number;
    badgeIds?: number[];
    platform_type?: string;
    interaction_type?: string;
    quest_link?: string;
    event_id?: number;
  }): Promise<Quest> {
    try {
      const response = await QuestsApi.create(quest);
      return {
        ...response,
        id: String(response.id),
        createdAt: response.createdAt || (response as any).created_at,
        updatedAt: response.updatedAt || response.updated_at,
      };
    } catch (error) {
      throw error;
    }
  }

  static async updateQuest(
    id: string,
    updates: {
      title?: string;
      description?: string;
      reward?: number;
      difficulty?: "beginner" | "intermediate" | "advanced" | "expert";
      status?: "active" | "completed" | "expired" | "draft";
      startDate?: string;
      endDate?: string;
      maxParticipants?: number;
      badgeIds?: number[];
    }
  ): Promise<Quest> {
    try {
      const response = await QuestsApi.update(id, updates);
      return {
        ...response,
        id: String(response.id),
        createdAt: response.createdAt || (response as any).created_at,
        updatedAt: response.updatedAt || (response as any).updated_at,
      };
    } catch (error) {
      throw error;
    }
  }

  static async activateQuest(id: string): Promise<Quest> {
    try {
      const response = await QuestsApi.activate(id);
      return {
        ...response,
        id: String(response.id),
        createdAt: response.createdAt || (response as any).created_at,
        updatedAt: response.updatedAt || (response as any).updated_at,
      };
    } catch (error) {
      throw error;
    }
  }

  static async deleteQuest(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await QuestsApi.deleteQuest(id);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Submission methods
  static async submitQuest(
    questId: string,
    userId: string,
    content: SubmissionContent
  ): Promise<Submission> {
    try {
      const response = await SubmissionsApi.submit(questId, content);
      return {
        ...response,
        id: String(response.id),
        submittedAt: response.submittedAt || (response as any).created_at,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getSubmissions(
    questId?: string,
    userId?: string
  ): Promise<Submission[]> {
    try {
      const response = await SubmissionsApi.list({ questId, userId });
      return Array.isArray(response)
        ? response.map((submission: any) => ({
            ...submission,
            id: String(submission.id),
            submittedAt: submission.submittedAt || submission.created_at,
          }))
        : [];
    } catch (error) {
      console.error("Error fetching submissions:", error);
      // Return empty array instead of mock data to prevent false completed quest counts
      return [];
    }
  }

  static async getQuestCompletions(): Promise<any> {
    try {
      const response = await SubmissionsApi.getQuestCompletions();
      return response;
    } catch (error) {
      console.error("Error fetching quest completions:", error);
      throw error;
    }
  }

  static async reviewSubmission(
    submissionId: string,
    status: "approved" | "rejected" | "needs-revision",
    feedback?: string,
    points?: number
  ): Promise<Submission> {
    try {
      const response = await SubmissionsApi.review(submissionId, {
        status,
        feedback,
        points,
      });
      return {
        ...response,
        id: String(response.id),
        submittedAt: response.submittedAt || (response as any).created_at,
      };
    } catch (error) {
      throw error;
    }
  }

  // Badge methods
  static async getUserBadges(userId: string): Promise<Badge[]> {
    try {
      const badges = await BadgesApi.listByUser(userId);
      return badges;
    } catch (error) {
      console.error("Error fetching user badges:", error);
      // Return empty array instead of mock data to prevent false badge counts
      return [];
    }
  }

  static async getAllBadges(): Promise<Badge[]> {
    try {
      const response = await BadgesApi.list();
      return response.data;
    } catch (error) {
      console.error("Error fetching all badges:", error);
      throw error;
    }
  }

  static async awardBadge(userId: string, badgeId: string): Promise<Badge> {
    try {
      const badge = await BadgesApi.award(userId, badgeId);
      return badge;
    } catch (error) {
      console.error("Error awarding badge:", error);
      throw error;
    }
  }

  // Leaderboard methods
  static async getLeaderboard(): Promise<LeaderboardResponse> {
    try {
      const response = await LeaderboardApi.getLeaderboard();
      return response;
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      throw error;
    }
  }

  // Event methods
  static async getEvents(): Promise<Event[]> {
    try {
      const events = await EventsApi.list();
      return events;
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }

  static async getEvent(id: string): Promise<Event | null> {
    try {
      const event = await EventsApi.get(id);
      return event;
    } catch (error) {
      console.error("Error fetching event:", error);
      return null;
    }
  }

  // Dashboard methods
  static async getDashboardStats(): Promise<any> {
    try {
      const { api } = await import("./api/client");
      const response = await api.get("/admin/dashboard");
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return default stats on error
      return {
        success: false,
        data: {
          userData: {
            count: 0,
            lastWeek: 0,
          },
          approvalRate: {
            count: 0,
            lastWeek: 0,
          },
          questSubmissionData: {
            count: 0,
            lastWeek: 0,
          },
        },
      };
    }
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

  static generateHashScanUrl(
    accountId: string,
    network: "testnet" | "mainnet" = "testnet"
  ): string {
    const baseUrl =
      network === "mainnet"
        ? "https://hashscan.io/mainnet/account"
        : "https://hashscan.io/testnet/account";
    return `${baseUrl}/${accountId}`;
  }

  static generateTransactionUrl(
    transactionId: string,
    network: "testnet" | "mainnet" = "testnet"
  ): string {
    const baseUrl =
      network === "mainnet"
        ? "https://hashscan.io/mainnet/transaction"
        : "https://hashscan.io/testnet/transaction";
    return `${baseUrl}/${transactionId}`;
  }
}
