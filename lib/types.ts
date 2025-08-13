// Core types for the Hedera Quest Machine
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  hederaAccountId: string;
  points: number;
  level: number;
  streak: number;
  joinedAt: string;
  role: 'user' | 'admin' | 'moderator';
  badges: Badge[];
  completedQuests: string[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: Difficulty;
  points: number;
  estimatedTime: string;
  requirements: string[];
  submissionType: SubmissionType;
  submissionInstructions: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  completions: number;
  maxCompletions?: number;
  prerequisites: string[];
  thumbnail: string;
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
  id: string;
  name: string;
  description: string;
  rarity: BadgeRarity;
  icon: string;
  earnedAt: string;
  category: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: EventType;
  quests: string[];
  participants: number;
  maxParticipants?: number;
  isActive: boolean;
}

export type QuestCategory = 
  | 'getting-started'
  | 'defi'
  | 'nfts' 
  | 'development'
  | 'consensus'
  | 'smart-contracts'
  | 'token-service'
  | 'file-service';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type SubmissionType = 'url' | 'text' | 'file' | 'transaction-id' | 'account-id';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'needs-revision';

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

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
  user: User;
  rank: number;
  previousRank?: number;
  recentPoints: number;
  totalPoints: number;
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