'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  FileText,
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  ExternalLink,
  MessageSquare,
  Star,
  Trophy,
  Code,
  Link,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { QuestService } from '@/lib/services';
import { tokenStorage } from '@/lib/api/client';
import { useToast } from '@/hooks/use-toast';

interface Submission {
  id: string;
  questId: string;
  questTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  submissionUrl?: string;
  repositoryUrl?: string;
  description: string;
  feedback?: string;
  score?: number;
  questPoints: number;
  questDifficulty: 'beginner' | 'intermediate' | 'advanced';
  user?: {
    name: string;
    email: string;
    avatar?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  quest?: {
    title: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
  created_at?: string;
  completedAt?: string;
  content?: {
    type: 'text' | 'url' | 'file' | 'account-id' | 'transaction-id';
    text?: string;
    url?: string;
    fileName?: string;
    accountId?: string;
    transactionId?: string;
  };
}

interface Quest {
  id: string;
  title: string;
  description: string;
  completions?: Submission[];
}

interface ExtendedSubmission extends Submission {
  user?: any;
  completedAt?: string;
  created_at?: string;
}

interface SubmissionReviewProps {
  className?: string;
}

// Mock data - replace with actual API calls
const mockSubmissions: Submission[] = [
  {
    id: '1',
    questId: 'q1',
    questTitle: 'Smart Contract Basics',
    userId: 'u1',
    userName: 'Alice Johnson',
    userEmail: 'alice@example.com',
    status: 'pending',
    submittedAt: '2024-01-20T10:30:00Z',
    submissionUrl: 'https://github.com/alice/smart-contract-basics',
    repositoryUrl: 'https://github.com/alice/smart-contract-basics',
    description: 'Implemented a basic smart contract with all required functions. Added comprehensive tests and documentation.',
    questPoints: 0, // Will be provided by API
    questDifficulty: 'beginner'
  },
  {
    id: '2',
    questId: 'q2',
    questTitle: 'Token Creation Workshop',
    userId: 'u2',
    userName: 'Bob Smith',
    userEmail: 'bob@example.com',
    status: 'approved',
    submittedAt: '2024-01-19T14:15:00Z',
    reviewedAt: '2024-01-19T16:45:00Z',
    reviewedBy: 'admin1',
    submissionUrl: 'https://github.com/bob/hts-token',
    repositoryUrl: 'https://github.com/bob/hts-token',
    description: 'Created HTS token with custom properties and implemented transfer functionality.',
    feedback: 'Excellent implementation with clean code and good documentation.',
    score: 95,
    questPoints: 0, // Will be provided by API
    questDifficulty: 'intermediate'
  },
  {
    id: '3',
    questId: 'q3',
    questTitle: 'NFT Marketplace Development',
    userId: 'u3',
    userName: 'Carol Davis',
    userEmail: 'carol@example.com',
    status: 'needs_revision',
    submittedAt: '2024-01-18T09:20:00Z',
    reviewedAt: '2024-01-18T15:30:00Z',
    reviewedBy: 'admin2',
    submissionUrl: 'https://github.com/carol/nft-marketplace',
    repositoryUrl: 'https://github.com/carol/nft-marketplace',
    description: 'Built NFT marketplace with minting and trading features.',
    feedback: 'Good start but needs better error handling and more comprehensive tests.',
    score: 70,
    questPoints: 0, // Will be provided by API
    questDifficulty: 'advanced'
  },
  {
    id: '4',
    questId: 'q1',
    questTitle: 'Smart Contract Basics',
    userId: 'u4',
    userName: 'David Wilson',
    userEmail: 'david@example.com',
    status: 'rejected',
    submittedAt: '2024-01-17T11:45:00Z',
    reviewedAt: '2024-01-17T17:20:00Z',
    reviewedBy: 'admin1',
    submissionUrl: 'https://github.com/david/contract-attempt',
    repositoryUrl: 'https://github.com/david/contract-attempt',
    description: 'Basic smart contract implementation.',
    feedback: 'Code does not compile and lacks required functionality. Please review the quest requirements.',
    score: 25,
    questPoints: 100,
    questDifficulty: 'beginner'
  }
];

export default function SubmissionReview() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(mockSubmissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewScore, setReviewScore] = useState(0);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [questSubmissions, setQuestSubmissions] = useState<ExtendedSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'overview' | 'quest-detail'>('overview');
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedDetailSubmission, setSelectedDetailSubmission] = useState<ExtendedSubmission | null>(null);

  // Load quests on component mount
  useEffect(() => {
    const loadQuests = async () => {
      try {
        setLoading(true);
        const response = await QuestService.getQuestCompletions();
        if (response.success) {
          setQuests(response.quests || []);
          toast({
            title: "Quests Loaded",
            description: `Successfully loaded ${response.quests?.length || 0} quests.`,
            variant: "default",
          });
        } else {
          throw new Error('Failed to load quests');
        }
      } catch (error) {
        console.error('Error loading quests:', error);
        toast({
          title: "Loading Failed",
          description: "Failed to load quests. Please refresh the page to try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuests();
  }, [toast]);

  useEffect(() => {
    let filtered = submissions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(submission => 
        submission.questTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(submission => submission.questDifficulty === difficultyFilter);
    }

    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, statusFilter, difficultyFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-mono"><CheckCircle className="w-3 h-3 mr-1" />APPROVED</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-mono"><Clock className="w-3 h-3 mr-1" />PENDING</Badge>;
      case 'needs_revision':
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-mono"><AlertCircle className="w-3 h-3 mr-1" />NEEDS_REVISION</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-mono"><XCircle className="w-3 h-3 mr-1" />REJECTED</Badge>;
      default:
        return <Badge variant="outline" className="font-mono">{status.toUpperCase()}</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono font-semibold shadow-sm dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/50">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              BEGINNER
            </div>
          </Badge>
        );
      case 'intermediate':
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-mono font-semibold shadow-sm dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700/50">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              INTERMEDIATE
            </div>
          </Badge>
        );
      case 'advanced':
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 font-mono font-semibold shadow-sm dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-700/50">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
              ADVANCED
            </div>
          </Badge>
        );
      case 'expert':
        return (
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-mono font-semibold shadow-sm dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700/50">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
              EXPERT
            </div>
          </Badge>
        );
      case 'master':
        return (
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 font-mono font-semibold shadow-sm dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-700/50">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              MASTER
            </div>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-mono font-semibold">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              {difficulty.toUpperCase()}
            </div>
          </Badge>
        );
    }
  };

  const handleReviewSubmission = (submissionId: string, status: 'approved' | 'rejected' | 'needs_revision', feedback: string, score: number) => {
    setSubmissions(prev => prev.map(submission => {
      if (submission.id === submissionId) {
        return {
          ...submission,
          status,
          feedback,
          score,
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'current_admin'
        };
      }
      return submission;
    }));
    setIsReviewDialogOpen(false);
    setSelectedSubmission(null);
    setReviewFeedback('');
    setReviewScore(0);
  };

  const handleQuestSelect = async (quest: Quest) => {
    try {
      setSelectedQuest(quest);
      setView('quest-detail');
      
      // Transform quest completions to match ExtendedSubmission format
      let questSubmissions = quest.completions || [];
      
      if (questSubmissions.length > 0) {
        questSubmissions = questSubmissions.map((submission: any) => {
          if (submission.user && submission.user.firstName && submission.user.lastName) {
            return {
              ...submission,
              user: {
                ...submission.user,
                name: `${submission.user.firstName} ${submission.user.lastName}`.trim(),
                email: submission.user.email || `${submission.user.username}@example.com`
              }
            };
          }
          return submission;
        });
      }
      
      setQuestSubmissions(questSubmissions);
      
      toast({
        title: "Quest Selected",
        description: `Loaded ${questSubmissions.length} submissions for "${quest.title}".`,
        variant: "default",
      });
      
    } catch (error) {
      console.error('Error selecting quest:', error);
      toast({
        title: "Selection Failed",
        description: "Failed to load quest submissions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (submissionId: string, action: string, feedback?: string) => {
    try {
      setLoading(true);
      
      let status: 'approved' | 'rejected' | 'needs-revision';
      let statusText: string;
      
      switch (action) {
        case 'approved':
          status = 'approved';
          statusText = 'approved';
          break;
        case 'rejected':
          status = 'rejected';
          statusText = 'rejected';
          break;
        case 'needs-revision':
          status = 'needs-revision';
          statusText = 'marked for revision';
          break;
        default:
          throw new Error(`Invalid action: ${action}`);
      }
      
      // Use the proper API service method
      await QuestService.reviewSubmission(submissionId, status, feedback);
      
      // Update local state
      setQuestSubmissions(prev => prev.map(sub => 
        sub.id === submissionId ? { 
          ...sub, 
          status,
          feedback,
          reviewedAt: new Date().toISOString()
        } : sub
      ));
      
      // Show success toast
      toast({
        title: "Submission Updated",
        description: `Submission has been successfully ${statusText}.`,
        variant: "default",
      });
      
      // Close detail dialog if open
      if (isDetailDialogOpen) {
        setIsDetailDialogOpen(false);
        setSelectedDetailSubmission(null);
      }
      
    } catch (error) {
      console.error('Error updating submission status:', error);
      
      // Show error toast
      toast({
        title: "Update Failed",
        description: "Failed to update submission status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'needs-revision':
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400 border-green-400';
      case 'rejected':
        return 'text-red-400 border-red-400';
      case 'pending':
        return 'text-yellow-400 border-yellow-400';
      case 'needs-revision':
        return 'text-orange-400 border-orange-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  const openReviewDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setReviewFeedback(submission.feedback || '');
    setReviewScore(submission.score || 0);
    setIsReviewDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (view === 'quest-detail' && selectedQuest) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView('overview')}
            className="bg-gray-800 border border-gray-600 text-green-400 hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Button>
          <div>
            <h2 className="text-xl font-bold text-green-400">Quest Submissions</h2>
            <p className="text-gray-400">Review submissions for: {selectedQuest.title}</p>
          </div>
        </div>

        {/* Quest Info */}
        <Card className="bg-gray-900 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">{selectedQuest.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">{selectedQuest.description}</p>
            <div className="flex gap-4 text-sm">
              <div className="text-gray-400">
                Total Submissions: <span className="text-white font-medium">{questSubmissions.length}</span>
              </div>
              <div className="text-gray-400">
                Pending: <span className="text-yellow-400 font-medium">{questSubmissions.filter(s => s.status === 'pending').length}</span>
              </div>
              <div className="text-gray-400">
                Approved: <span className="text-green-400 font-medium">{questSubmissions.filter(s => s.status === 'approved').length}</span>
              </div>
              <div className="text-gray-400">
                Rejected: <span className="text-red-400 font-medium">{questSubmissions.filter(s => s.status === 'rejected').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quest Submissions Table */}
        <Card className="bg-gray-900 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Submissions ({questSubmissions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-700">
                    <TableHead className="text-gray-400">User</TableHead>
                    <TableHead className="text-gray-400">Content</TableHead>
                    <TableHead className="text-gray-400">Submitted</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Validation</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questSubmissions.map((submission) => (
                    <TableRow key={submission.id} className="border-b border-gray-700 hover:bg-gray-800">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center">
                            <User className="w-4 h-4 text-green-400" />
                          </div>
                          <div>
                            <div className="text-white">{submission.user?.name || 'Unknown User'}</div>
                            <div className="text-xs text-gray-400">@{submission.user?.username || submission.user?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {submission.content?.type === 'text' && (
                            <p className="text-sm truncate text-gray-400">{submission.content.text}</p>
                          )}
                          {submission.content?.type === 'url' && (
                            <a 
                              href={submission.content.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-green-400 text-sm truncate block"
                            >
                              {submission.content.url}
                            </a>
                          )}
                          {submission.content?.type === 'account-id' && (
                            <code className="text-xs bg-gray-800 border border-gray-600 px-2 py-1 rounded text-green-400">
                              {submission.content.accountId}
                            </code>
                          )}
                          {submission.content?.type === 'transaction-id' && (
                            <code className="text-xs bg-gray-800 border border-gray-600 px-2 py-1 rounded text-green-400">
                              {submission.content.transactionId}
                            </code>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(submission.submittedAt || submission.created_at || Date.now()), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(submission.status)}
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs bg-gray-800 border border-gray-600",
                              getStatusColor(submission.status)
                            )}
                          >
                            {submission.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(submission.id, 'approved', 'Submission approved')}
                            disabled={submission.status === 'approved' || loading}
                            className="bg-green-900/20 border border-green-600 text-green-400 hover:bg-green-800/30 disabled:opacity-50"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Validate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(submission.id, 'rejected', 'Submission rejected')}
                            disabled={submission.status === 'rejected' || loading}
                            className="bg-red-900/20 border border-red-600 text-red-400 hover:bg-red-800/30 disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedDetailSubmission(submission);
                            setIsDetailDialogOpen(true);
                          }}
                          className="bg-gray-800 border border-gray-600 text-green-400 hover:bg-gray-700"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {questSubmissions.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No submissions found for this quest.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10">
          <CardTitle className="flex items-center gap-2 font-mono">
            <div className="p-1 bg-primary/20 rounded border border-dashed border-primary/40">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            📝 SUBMISSION_REVIEW
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="[SEARCH_SUBMISSIONS]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-mono border-dashed border-primary/30 focus:border-solid"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 font-mono border-dashed border-primary/30">
                <SelectValue placeholder="[STATUS]" />
              </SelectTrigger>
              <SelectContent className="font-mono">
                <SelectItem value="all">[ALL_STATUS]</SelectItem>
                <SelectItem value="pending">[PENDING]</SelectItem>
                <SelectItem value="approved">[APPROVED]</SelectItem>
                <SelectItem value="needs_revision">[NEEDS_REVISION]</SelectItem>
                <SelectItem value="rejected">[REJECTED]</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-44 font-mono border-dashed border-primary/30">
                <SelectValue placeholder="[DIFFICULTY]" />
              </SelectTrigger>
              <SelectContent className="font-mono">
                <SelectItem value="all">[ALL_LEVELS]</SelectItem>
                <SelectItem value="beginner">[BEGINNER]</SelectItem>
                <SelectItem value="intermediate">[INTERMEDIATE]</SelectItem>
                <SelectItem value="advanced">[ADVANCED]</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submissions Table */}
          <div className="border-2 border-dashed border-primary/20 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-b border-dashed border-primary/20">
                  <TableHead className="font-mono">[SUBMISSION]</TableHead>
                  <TableHead className="font-mono">[USER]</TableHead>
                  <TableHead className="font-mono">[QUEST]</TableHead>
                  <TableHead className="font-mono">[STATUS]</TableHead>
                  <TableHead className="font-mono">[SCORE]</TableHead>
                  <TableHead className="font-mono">[SUBMITTED]</TableHead>
                  <TableHead className="font-mono">[ACTIONS]</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id} className="border-b border-dashed border-primary/10 hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium font-mono text-sm">{submission.id}</div>
                        <div className="text-xs text-muted-foreground font-mono truncate max-w-xs">
                          {submission.description}
                        </div>
                        {submission.submissionUrl && (
                          <div className="flex items-center gap-1 text-xs">
                            <Link className="w-3 h-3 text-blue-500" />
                            <a href={submission.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-mono">
                              [VIEW_SUBMISSION]
                            </a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium font-mono text-sm">{submission.userName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{submission.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium font-mono text-sm">{submission.questTitle}</div>
                        <div className="flex items-center gap-2">
                          {getDifficultyBadge(submission.questDifficulty)}
                          <div className="flex items-center gap-1 text-xs font-mono">
                            <Trophy className="w-3 h-3 text-yellow-500" />
                            <span>{submission.questPoints} pts</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      {submission.score !== undefined ? (
                        <div className="flex items-center gap-1 font-mono">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-sm font-bold">{submission.score}/100</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground font-mono text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <div className="space-y-1">
                        <div>{formatDate(submission.submittedAt)}</div>
                        {submission.reviewedAt && (
                          <div className="text-muted-foreground">
                            Reviewed: {formatDate(submission.reviewedAt)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 border border-dashed border-purple-500/30 hover:border-solid">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="font-mono border-2 border-dashed border-purple-500/30">
                          <DropdownMenuLabel>[ACTIONS]</DropdownMenuLabel>
                          <DropdownMenuSeparator className="border-dashed border-purple-500/20" />
                          <DropdownMenuItem onClick={() => openReviewDialog(submission)}>
                            <Eye className="mr-2 h-4 w-4" />
                            [REVIEW]
                          </DropdownMenuItem>
                          {submission.submissionUrl && (
                            <DropdownMenuItem asChild>
                              <a href={submission.submissionUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                [VIEW_CODE]
                              </a>
                            </DropdownMenuItem>
                          )}
                          {submission.status === 'pending' && (
                            <>
                              <DropdownMenuSeparator className="border-dashed border-purple-500/20" />
                              <DropdownMenuItem onClick={() => handleReviewSubmission(submission.id, 'approved', 'Approved', 100)} className="text-green-600">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                [QUICK_APPROVE]
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReviewSubmission(submission.id, 'rejected', 'Rejected', 0)} className="text-red-600">
                                <XCircle className="mr-2 h-4 w-4" />
                                [QUICK_REJECT]
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Quest Selection */}
          <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10">
              <CardTitle className="flex items-center gap-2 font-mono">
                <div className="p-1 bg-primary/20 rounded border border-dashed border-primary/40">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                🎯 SELECT_QUEST_TO_REVIEW
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p className="text-lg font-medium">Loading quests...</p>
                  <p className="text-sm text-gray-500">Please wait while we fetch the available quests</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quests.map((quest) => (
                    <Card 
                      key={quest.id} 
                      className={cn(
                        "group relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 to-blue-500/10 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105",
                        loading && "opacity-50 cursor-not-allowed"
                      )} 
                      onClick={() => !loading && handleQuestSelect(quest)}
                    >
                      <CardContent className="relative p-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5" />
                        <div className="relative space-y-3">
                          <h3 className="font-mono font-medium text-primary">{quest.title}</h3>
                          <p className="text-muted-foreground text-sm font-mono line-clamp-2">{quest.description}</p>
                          <div className="flex justify-between text-sm font-mono">
                            <span className="text-muted-foreground">Total: <span className="text-primary font-bold">{quest.completions?.length || 0}</span></span>
                            <span className="text-muted-foreground">Pending: <span className="text-yellow-500 font-bold">{quest.completions?.filter((c: any) => c.status === 'pending').length || 0}</span></span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4 rounded-lg border border-dashed border-blue-500/20">
              <div className="text-2xl font-bold font-mono text-blue-500">{submissions.length}</div>
              <div className="text-sm text-muted-foreground font-mono">TOTAL_SUBMISSIONS</div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 rounded-lg border border-dashed border-yellow-500/20">
              <div className="text-2xl font-bold font-mono text-yellow-500">{submissions.filter(s => s.status === 'pending').length}</div>
              <div className="text-sm text-muted-foreground font-mono">PENDING_REVIEW</div>
            </div>
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4 rounded-lg border border-dashed border-green-500/20">
              <div className="text-2xl font-bold font-mono text-green-500">{submissions.filter(s => s.status === 'approved').length}</div>
              <div className="text-sm text-muted-foreground font-mono">APPROVED</div>
            </div>
            <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 p-4 rounded-lg border border-dashed border-primary/20">
              <div className="text-2xl font-bold font-mono text-primary">
                {submissions.filter(s => s.score !== undefined).length > 0 
                  ? Math.round(submissions.filter(s => s.score !== undefined).reduce((sum, s) => sum + (s.score || 0), 0) / submissions.filter(s => s.score !== undefined).length)
                  : 0
                }
              </div>
              <div className="text-sm text-muted-foreground font-mono">AVG_SCORE</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-3xl font-mono border-2 border-dashed border-primary/30">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              [REVIEW_SUBMISSION]
            </DialogTitle>
            <DialogDescription>
              Review and provide feedback for this submission.
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              {/* Submission Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-lg border border-dashed border-primary/20">
                <div>
                  <label className="text-sm font-medium font-mono text-muted-foreground">[USER]</label>
                  <div className="font-mono">{selectedSubmission.userName}</div>
                  <div className="text-sm text-muted-foreground font-mono">{selectedSubmission.userEmail}</div>
                </div>
                <div>
                  <label className="text-sm font-medium font-mono text-muted-foreground">[QUEST]</label>
                  <div className="font-mono">{selectedSubmission.questTitle}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {getDifficultyBadge(selectedSubmission.questDifficulty)}
                    <div className="flex items-center gap-1 text-xs font-mono">
                      <Trophy className="w-3 h-3 text-yellow-500" />
                      <span>{selectedSubmission.questPoints} pts</span>
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium font-mono text-muted-foreground">[DESCRIPTION]</label>
                  <div className="font-mono text-sm">{selectedSubmission.description}</div>
                </div>
                {selectedSubmission.submissionUrl && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium font-mono text-muted-foreground">[SUBMISSION_URL]</label>
                    <div>
                      <a 
                        href={selectedSubmission.submissionUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-500 hover:underline font-mono text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {selectedSubmission.submissionUrl}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Review Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium font-mono">[SCORE] (0-100)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={reviewScore}
                    onChange={(e) => setReviewScore(Number(e.target.value))}
                    className="font-mono border-dashed border-primary/30"
                    placeholder="Enter score"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium font-mono">[FEEDBACK]</label>
                  <Textarea
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    className="font-mono border-dashed border-primary/30"
                    placeholder="Provide detailed feedback..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsReviewDialogOpen(false)} 
              className="font-mono border-dashed"
            >
              [CANCEL]
            </Button>
            <Button 
              onClick={() => selectedSubmission && handleReviewSubmission(selectedSubmission.id, 'needs_revision', reviewFeedback, reviewScore)}
              className="font-mono bg-gradient-to-r from-orange-500 to-yellow-500"
            >
              [NEEDS_REVISION]
            </Button>
            <Button 
              onClick={() => selectedSubmission && handleReviewSubmission(selectedSubmission.id, 'rejected', reviewFeedback, reviewScore)}
              className="font-mono bg-gradient-to-r from-red-500 to-pink-500"
            >
              [REJECT]
            </Button>
            <Button 
              onClick={() => selectedSubmission && handleReviewSubmission(selectedSubmission.id, 'approved', reviewFeedback, reviewScore)}
              className="font-mono bg-gradient-to-r from-green-500 to-emerald-500"
            >
              [APPROVE]
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detailed Review Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto font-mono border-2 border-dashed border-primary/30">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              [DETAILED_SUBMISSION_REVIEW]
            </DialogTitle>
          </DialogHeader>
          
          {selectedDetailSubmission && (
            <div className="space-y-6">
              {/* User Information */}
              <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10">
                  <CardTitle className="font-mono text-primary">[USER_INFORMATION]</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-mono text-muted-foreground">[NAME]</label>
                      <p className="font-mono text-primary">{selectedDetailSubmission.user?.name || 'Unknown User'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-mono text-muted-foreground">[USERNAME]</label>
                      <p className="font-mono text-primary">@{selectedDetailSubmission.user?.username || selectedDetailSubmission.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-mono text-muted-foreground">[EMAIL]</label>
                      <p className="font-mono text-primary">{selectedDetailSubmission.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-mono text-muted-foreground">[USER_ID]</label>
                      <p className="font-mono text-primary">{selectedDetailSubmission.user?.id || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submission Content */}
              <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10">
                  <CardTitle className="font-mono text-primary">[SUBMISSION_CONTENT]</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedDetailSubmission.content?.type === 'text' && (
                      <div>
                        <label className="text-sm font-mono text-muted-foreground">[TEXT_CONTENT]</label>
                        <div className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 rounded p-3 mt-1">
                          <p className="font-mono text-primary whitespace-pre-wrap">{selectedDetailSubmission.content.text}</p>
                        </div>
                      </div>
                    )}
                    {selectedDetailSubmission.content?.type === 'url' && (
                      <div>
                        <label className="text-sm font-mono text-muted-foreground">[URL]</label>
                        <div className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 rounded p-3 mt-1">
                          <a 
                            href={selectedDetailSubmission.content.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-mono text-primary hover:text-blue-400 break-all underline"
                          >
                            {selectedDetailSubmission.content.url}
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedDetailSubmission.content?.type === 'account-id' && (
                      <div>
                        <label className="text-sm font-mono text-muted-foreground">[ACCOUNT_ID]</label>
                        <div className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 rounded p-3 mt-1">
                          <code className="font-mono text-primary break-all">{selectedDetailSubmission.content.accountId}</code>
                        </div>
                      </div>
                    )}
                    {selectedDetailSubmission.content?.type === 'transaction-id' && (
                      <div>
                        <label className="text-sm font-mono text-muted-foreground">[TRANSACTION_ID]</label>
                        <div className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 rounded p-3 mt-1">
                          <code className="font-mono text-primary break-all">{selectedDetailSubmission.content.transactionId}</code>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submission Metadata */}
              <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10">
                  <CardTitle className="font-mono text-primary">[SUBMISSION_DETAILS]</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-mono text-muted-foreground">[STATUS]</label>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedDetailSubmission.status)}
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs font-mono border-2 border-dashed",
                            getStatusColor(selectedDetailSubmission.status)
                          )}
                        >
                          {selectedDetailSubmission.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-mono text-muted-foreground">[SUBMITTED_DATE]</label>
                      <p className="font-mono text-primary">
                        {format(new Date(selectedDetailSubmission.submittedAt || selectedDetailSubmission.created_at || Date.now()), 'PPP p')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-mono text-muted-foreground">[SUBMISSION_ID]</label>
                      <p className="font-mono text-primary">{selectedDetailSubmission.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-mono text-muted-foreground">[QUEST_ID]</label>
                      <p className="font-mono text-primary">{selectedDetailSubmission.questId || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-dashed border-primary/30">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="font-mono border-2 border-dashed border-primary/30 text-primary hover:bg-primary/10"
                >
                  [CLOSE]
                </Button>
                <Button 
                  onClick={() => handleStatusUpdate(selectedDetailSubmission.id, 'needs-revision', 'Please review and make necessary changes')}
                  disabled={selectedDetailSubmission.status === 'needs-revision' || loading}
                  className="font-mono bg-yellow-600 hover:bg-yellow-700 text-white disabled:opacity-50 border-2 border-yellow-500/30"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  [REQUEST_REVISION]
                </Button>
                <Button 
                  onClick={() => handleStatusUpdate(selectedDetailSubmission.id, 'rejected', 'Submission does not meet requirements')}
                  disabled={selectedDetailSubmission.status === 'rejected' || loading}
                  className="font-mono bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 border-2 border-red-500/30"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  [REJECT]
                </Button>
                <Button 
                  onClick={() => handleStatusUpdate(selectedDetailSubmission.id, 'approved', 'Great work! Submission approved.')}
                  disabled={selectedDetailSubmission.status === 'approved' || loading}
                  className="font-mono bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 border-2 border-green-500/30"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  [APPROVE]
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SubmissionReview;