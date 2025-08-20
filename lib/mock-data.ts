import { User, Quest, Submission, Badge, Event, LeaderboardEntry, DashboardStats } from './types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Chen',
    email: 'alice@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b17c?w=100&h=100&fit=crop&crop=face',
    hederaAccountId: '0.0.123456',
    points: 2850,
    level: 15,
    streak: 7,
    joinedAt: '2024-01-15',
    role: 'user',
    badges: [],
    completedQuests: ['1', '2', '3', '4']
  },
  {
    id: '2', 
    name: 'Bob Johnson',
    email: 'bob@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    hederaAccountId: '0.0.789012',
    points: 1920,
    level: 12,
    streak: 3,
    joinedAt: '2024-02-01',
    role: 'user',
    badges: [],
    completedQuests: ['1', '2', '5']
  },
  {
    id: 'admin',
    name: 'Admin User',
    email: 'admin@hederaquest.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    hederaAccountId: '0.0.000001',
    points: 5000,
    level: 25,
    streak: 0,
    joinedAt: '2024-01-01',
    role: 'admin',
    badges: [],
    completedQuests: []
  }
];

// Mock Badges
export const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Completed your first quest',
    rarity: 'common',
    icon: 'Trophy',
    earnedAt: '2024-01-16',
    category: 'achievement'
  },
  {
    id: '2',
    name: 'Token Master',
    description: 'Completed 5 token-related quests',
    rarity: 'rare',
    icon: 'Coins',
    earnedAt: '2024-02-05',
    category: 'specialty'
  },
  {
    id: '3',
    name: 'NFT Explorer',
    description: 'Minted your first NFT on Hedera',
    rarity: 'epic',
    icon: 'Image',
    earnedAt: '2024-02-10',
    category: 'specialty'
  }
];

// Mock Quests
export const mockQuests: Quest[] = [
  {
    id: '1',
    title: 'Create Your First Hedera Account',
    description: 'Set up your Hedera testnet account and explore the basics of the Hedera network.',
    category: 'getting-started',
    difficulty: 'beginner',
    points: 100,
    estimatedTime: '15 minutes',
    requirements: [
      'Visit the Hedera portal',
      'Create a testnet account',
      'Fund your account with test HBAR'
    ],
    submissionType: 'account-id',
    submissionInstructions: 'Submit your Hedera testnet account ID (format: 0.0.XXXXXX)',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    completions: 156,
    prerequisites: [],
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop',
    platform_type: 'twitter'
  },
  {
    id: '2',
    title: 'Your First HBAR Transfer',
    description: 'Learn how to send and receive HBAR on the Hedera network.',
    category: 'getting-started',
    difficulty: 'beginner',
    points: 150,
    estimatedTime: '20 minutes',
    requirements: [
      'Send HBAR to another account',
      'View the transaction on HashScan',
      'Understand transaction fees'
    ],
    submissionType: 'transaction-id',
    submissionInstructions: 'Submit the transaction ID of your HBAR transfer',
    isActive: true,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
    completions: 134,
    prerequisites: ['1'],
    thumbnail: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=250&fit=crop',
    platform_type: 'facebook'
  },
  {
    id: '3',
    title: 'Deploy Your First Smart Contract',
    description: 'Create and deploy a simple smart contract on Hedera using Solidity.',
    category: 'development',
    difficulty: 'intermediate',
    points: 500,
    estimatedTime: '2 hours',
    requirements: [
      'Write a simple smart contract in Solidity',
      'Deploy to Hedera testnet',
      'Interact with your contract'
    ],
    submissionType: 'url',
    submissionInstructions: 'Submit a GitHub repository link containing your smart contract code',
    isActive: true,
    createdAt: '2024-01-03',
    updatedAt: '2024-01-03',
    completions: 67,
    prerequisites: ['1', '2'],
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop',
    platform_type: 'discord'
  },
  {
    id: '4',
    title: 'Create Your First NFT Collection',
    description: 'Learn to create and mint NFTs using the Hedera Token Service.',
    category: 'nfts',
    difficulty: 'intermediate',
    points: 400,
    estimatedTime: '1.5 hours',
    requirements: [
      'Create an NFT collection',
      'Mint at least 3 unique NFTs',
      'Transfer an NFT to another account'
    ],
    submissionType: 'transaction-id',
    submissionInstructions: 'Submit the transaction ID of your NFT collection creation',
    isActive: true,
    createdAt: '2024-01-04',
    updatedAt: '2024-01-04',
    completions: 89,
    prerequisites: ['1'],
    thumbnail: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=250&fit=crop',
    platform_type: 'twitter'
  },
  {
    id: '5',
    title: 'DeFi Yield Farming Basics',
    description: 'Explore decentralized finance opportunities on Hedera.',
    category: 'defi',
    difficulty: 'advanced',
    points: 600,
    estimatedTime: '3 hours',
    requirements: [
      'Connect to a Hedera DeFi protocol',
      'Provide liquidity to a pool',
      'Understand impermanent loss'
    ],
    submissionType: 'text',
    submissionInstructions: 'Write a 300-word summary of your DeFi experience and lessons learned',
    isActive: true,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
    completions: 34,
    prerequisites: ['1', '2'],
    thumbnail: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400&h=250&fit=crop',
    platform_type: 'youtube'
  },
  {
    id: '6',
    title: 'Build a Hedera dApp Tutorial',
    description: 'Create a comprehensive tutorial on building decentralized applications on Hedera.',
    category: 'development',
    difficulty: 'advanced',
    points: 800,
    estimatedTime: '4 hours',
    requirements: [
      'Create a step-by-step tutorial',
      'Include code examples',
      'Deploy a working demo'
    ],
    submissionType: 'url',
    submissionInstructions: 'Submit a link to your published tutorial (Medium, Dev.to, or personal blog)',
    isActive: true,
    createdAt: '2024-01-06',
    updatedAt: '2024-01-06',
    completions: 12,
    prerequisites: ['1', '3'],
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
    platform_type: 'medium'
  },
  {
    id: '7',
    title: 'Join Hedera Community Chat',
    description: 'Connect with other Hedera developers and enthusiasts in our community chat.',
    category: 'community',
    difficulty: 'beginner',
    points: 50,
    estimatedTime: '5 minutes',
    requirements: [
      'Join the Hedera Telegram group',
      'Introduce yourself',
      'Ask a question or share your experience'
    ],
    submissionType: 'text',
    submissionInstructions: 'Share your Telegram username and a brief introduction you posted',
    isActive: true,
    createdAt: '2024-01-07',
    updatedAt: '2024-01-07',
    completions: 203,
    prerequisites: [],
    thumbnail: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&h=250&fit=crop',
    platform_type: 'telegram'
  }
];

// Mock Submissions
export const mockSubmissions: Submission[] = [
  {
    id: '1',
    questId: '1',
    userId: '1',
    status: 'approved',
    submittedAt: '2024-01-16T10:30:00Z',
    reviewedAt: '2024-01-16T14:15:00Z',
    reviewedBy: 'admin',
    content: {
      type: 'account-id',
      accountId: '0.0.123456'
    },
    feedback: 'Great job! Your account is properly set up.',
    points: 100
  },
  {
    id: '2',
    questId: '3',
    userId: '2',
    status: 'pending',
    submittedAt: '2024-01-18T16:45:00Z',
    content: {
      type: 'url',
      url: 'https://github.com/bob/my-first-contract'
    }
  },
  {
    id: '3',
    questId: '2',
    userId: '1',
    status: 'needs-revision',
    submittedAt: '2024-01-17T09:20:00Z',
    reviewedAt: '2024-01-17T11:30:00Z',
    reviewedBy: 'admin',
    content: {
      type: 'transaction-id',
      transactionId: '0.0.123456@1705495200.123456789'
    },
    feedback: 'Transaction ID format is incorrect. Please check and resubmit.'
  },
  {
    id: '4',
    questId: '5',
    userId: '2',
    status: 'approved',
    submittedAt: '2024-01-19T14:20:00Z',
    reviewedAt: '2024-01-19T16:45:00Z',
    reviewedBy: 'admin',
    content: {
      type: 'text',
      text: 'I participated in SaucerSwap liquidity farming and learned about impermanent loss. The experience taught me the importance of understanding tokenomics and market dynamics when providing liquidity. I provided HBAR/USDC liquidity and monitored the pool performance over a week, gaining insights into DeFi mechanics on Hedera.'
    },
    feedback: 'Excellent analysis of your DeFi experience!',
    points: 600
  },
  {
    id: '5',
    questId: '6',
    userId: '1',
    status: 'pending',
    submittedAt: '2024-01-20T11:30:00Z',
    content: {
      type: 'url',
      url: 'https://medium.com/@alice/building-hedera-dapps-complete-guide'
    }
  },
  {
    id: '6',
    questId: '7',
    userId: '2',
    status: 'approved',
    submittedAt: '2024-01-21T08:15:00Z',
    reviewedAt: '2024-01-21T09:00:00Z',
    reviewedBy: 'admin',
    content: {
      type: 'text',
      text: 'My Telegram username is @bob_hedera_dev. I introduced myself as a new developer interested in building on Hedera and asked about best practices for smart contract deployment.'
    },
    feedback: 'Welcome to the community!',
    points: 50
  }
];

// Mock Events
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Hedera Hackathon 2024',
    description: 'Build the future of web3 on Hedera',
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    type: 'hackathon',
    quests: ['3', '4', '5'],
    participants: 245,
    maxParticipants: 500,
    isActive: true
  },
  {
    id: '2',
    title: 'Developer Onboarding Cohort',
    description: '4-week intensive program for new Hedera developers',
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    type: 'cohort',
    quests: ['1', '2', '3'],
    participants: 67,
    maxParticipants: 100,
    isActive: true
  }
];

// Mock Leaderboard
export const mockLeaderboard: LeaderboardEntry[] = [
  {
    user: mockUsers[0],
    rank: 1,
    previousRank: 2,
    recentPoints: 500,
    totalPoints: 2850
  },
  {
    user: mockUsers[1], 
    rank: 2,
    previousRank: 1,
    recentPoints: 150,
    totalPoints: 1920
  }
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalUsers: 1247,
  activeQuests: 23,
  totalSubmissions: 456,
  approvalRate: 87.5,
  avgCompletionTime: 2.5,
  popularCategories: [
    { category: 'getting-started', count: 245 },
    { category: 'nfts', count: 189 },
    { category: 'development', count: 156 },
    { category: 'defi', count: 134 },
    { category: 'smart-contracts', count: 98 }
  ]
};