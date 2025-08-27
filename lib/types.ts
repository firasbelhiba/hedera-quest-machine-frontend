// Core types for the Hedera Quest Machine
export interface UserLevel {
  id: number;
  user_id: number;
  level: number;
  progress: number;
  max_progress: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string | number;
  firstName?: string;
  lastName?: string;
  username?: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  hederaAccountId: string | null;
  points: number;
  total_points?: number;
  level: number;
  streak: number;
  joinedAt: string;
  role: 'user' | 'admin' | 'moderator';
  badges: Badge[];
  completedQuests: string[];
  userLevel?: UserLevel;
  facebookProfile?: any;
  twitterProfile?: any;
  discordProfile?: any;
}

export interface Quest {
  id: string | number;
  title: string;
  description: string;
  category?: QuestCategory;
  difficulty: Difficulty;
  points?: number;
  reward?: string;
  estimatedTime?: string;
  requirements?: string[];
  submissionType?: SubmissionType;
  submissionInstructions?: string;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  completions?: number;
  maxCompletions?: number;
  maxParticipants?: number;
  currentParticipants?: number;
  prerequisites?: string[];
  thumbnail?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: number;
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
  badges?: any[];
  platform_type?: string;
  quest_link?: string;
  user_status?: string;
}

export interface Submission {
  id: string;
  questId: string;
  userId: string;
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  content: SubmissionContent;
  feedback?: string;
  points?: number;
}

export interface Badge {
  id: string | number;
  name: string;
  description: string;
  rarity: BadgeRarity;
  icon?: string;
  image?: string | null;
  earnedAt?: string;
  category?: string;
  maxToObtain?: number;
  points?: number;
  isActive?: boolean;
  createdBy?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  reward: string;
  reward_image: string;
  created_at: string;
  updated_at: string;
  startDate?: string;
  endDate?: string;
  type?: EventType;
  quests?: string[];
  participants?: number;
  maxParticipants?: number;
  isActive?: boolean;
}

export type QuestCategory = 
  | 'getting-started'
  | 'defi'
  | 'nfts' 
  | 'development'
  | 'consensus'
  | 'smart-contracts'
  | 'token-service'
  | 'file-service'
  | 'community';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

export type SubmissionType = 'url' | 'text' | 'file' | 'transaction-id' | 'account-id';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'needs-revision';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type EventType = 'hackathon' | 'cohort' | 'challenge' | 'community-event';

export interface SubmissionContent {
  type: SubmissionType;
  url?: string;
  text?: string;
  fileName?: string;
  transactionId?: string;
  accountId?: string;
}

export interface LeaderboardEntry {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  bio: string;
  email_verified: boolean;
  total_points: number;
}

export interface LeaderboardResponse {
  success: boolean;
  data: {
    rank: number;
    users: LeaderboardEntry[];
  };
}

export interface DashboardStats {
  totalUsers: number;
  activeQuests: number;
  totalSubmissions: number;
  approvalRate: number;
  avgCompletionTime: number;
  popularCategories: Array<{
    category: QuestCategory;
    count: number;
  }>;
}

export interface FilterOptions {
  categories: QuestCategory[];
  difficulties: Difficulty[];
  search: string;
  showCompleted: boolean;
}

// Badge creation types
export interface CreateBadgeRequest {
  name: string;
  description: string;
  maxToObtain: number;
  rarity: BadgeRarity;
  points: number;
  image?: string;
  isActive?: boolean;
}

export interface CreateBadgeResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    description: string;
    image: string | null;
    maxToObtain: number;
    rarity: BadgeRarity;
    points: number;
    isActive: boolean;
    createdBy: number;
    created_at: string;
    updated_at: string;
  };
  message: string;
}

export interface ListBadgesResponse {
  success: boolean;
  data: Badge[];
  count: number;
}

export interface GetBadgeResponse {
  success: boolean;
  data: Badge;
}

export interface BadgeFilters {
  rarity?: BadgeRarity;
  isActive?: boolean;
  createdBy?: number;
}

// Quest Update Types
export interface UpdateQuestRequest {
  title?: string;
  description?: string;
  reward?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  status?: 'active' | 'completed' | 'expired' | 'draft';
  startDate?: string;
  endDate?: string;
  maxParticipants?: number;
  badgeIds?: number[];
}

export interface UpdateQuestResponse {
  success: boolean;
  data: {
    id: number;
    title: string;
    description: string;
    reward: string;
    difficulty: string;
    status: string;
    startDate: string;
    endDate: string;
    maxParticipants: number;
    currentParticipants: number;
    createdBy: number;
    created_at: string;
    updated_at: string;
    badges: Array<{
      id: number;
      name: string;
    }>;
  };
  message: string;
}