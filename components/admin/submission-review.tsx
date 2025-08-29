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
  Loader2,
  Target,
  Grid3X3,
  List,
  Table as TableIcon
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
  status: 'pending' | 'approved' | 'rejected' | 'needs-revision';
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
    twitterProfile?: {
      id: number;
      twitter_id: string;
      twitter_username: string;
      twitter_profile_picture?: string;
      access_token: string;
      refresh_token: string;
      expires_at?: string;
      user_id: number;
      admin_id?: number;
      created_at: string;
      updated_at: string;
    };
    facebookProfile?: {
      id: number;
      facebook_id: string;
      firstname: string;
      lastname: string;
      email: string;
      access_token: string;
      refresh_token: string;
      expires_at?: string;
      user_id: number;
      admin_id?: number;
      created_at: string;
      updated_at: string;
    };
    discordProfile?: {
      id: number;
      discord_id: string;
      discord_username: string;
      discord_picture?: string;
      access_token: string;
      refresh_token: string;
      expires_at?: string;
      user_id: number;
      admin_id?: number;
      created_at: string;
      updated_at: string;
    };
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

// Mock data removed - now using real API data from QuestService.getSubmissions()

export default function SubmissionReview({ className }: SubmissionReviewProps = {}) {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedDetailSubmission, setSelectedDetailSubmission] = useState<Submission | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [reviewScore, setReviewScore] = useState(0);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [questSubmissions, setQuestSubmissions] = useState<ExtendedSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'overview' | 'quest-detail'>('overview');

  const [viewMode, setViewMode] = useState<'card' | 'table' | 'list'>('card');

  // Load submissions and quests on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load submissions
        const submissionsData = await QuestService.getSubmissions();
        
        // Transform basic submission data to match expected format
        const enrichedSubmissions = submissionsData.map((submission: any, index: number) => ({
          id: submission.id || `sub-${index + 1}`,
          questId: submission.questId || `quest-${index + 1}`,
          userId: submission.userId || `user-${index + 1}`,
          userName: submission.userName || `User ${index + 1}`,
          userEmail: submission.userEmail || `user${index + 1}@example.com`,
          questTitle: submission.questTitle || `Quest ${index + 1}`,
          questDifficulty: submission.questDifficulty || 'beginner',
          questPoints: submission.questPoints || 100,
          status: submission.status || 'pending',
          submittedAt: submission.submittedAt || new Date().toISOString(),
          reviewedAt: submission.reviewedAt,
          content: submission.content || { type: 'text', text: 'Sample submission content' },
          feedback: submission.feedback,
          points: submission.points,
          score: submission.score,
          description: submission.description || 'Sample submission description',
          submissionUrl: submission.submissionUrl || submission.content?.url
        }));
        
        // Only use real API data, no sample data
        setSubmissions(enrichedSubmissions);
        
        // Load quests
        const response = await QuestService.getQuestCompletions();
        if (response.success) {
          setQuests(response.quests || []);
          toast({
            title: "Data Loaded",
            description: `Successfully loaded ${enrichedSubmissions.length} submissions and ${response.quests?.length || 0} quests.`,
            variant: "default",
          });
        } else {
          throw new Error('Failed to load quests');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Loading Failed",
          description: "Failed to load submissions and quests. Please refresh the page to try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
      case 'needs-revision':
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

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to open review dialog
  const openReviewDialog = (submission: any) => {
    setSelectedSubmission(submission);
    setReviewScore(submission.score || 0);
    setReviewFeedback(submission.feedback || '');
    setIsReviewDialogOpen(true);
  };

  // Function to handle quest selection
  const handleQuestSelect = (quest: Quest) => {
    setSelectedQuest(quest);
    setQuestSubmissions(quest.completions || []);
    setView('quest-detail');
  };

  // Function to handle status updates from quick action buttons
  const handleStatusUpdate = async (submissionId: string, status: 'approved' | 'rejected' | 'needs-revision', feedback: string) => {
    await handleReviewSubmission(submissionId, status, feedback, status === 'approved' ? 100 : 0);
  };

  const handleReviewSubmission = async (submissionId: string, status: 'approved' | 'rejected' | 'needs-revision', feedback: string, score: number) => {
    try {
      setLoading(true);
      
      // Call the API to review the submission
      await QuestService.reviewSubmission(submissionId, status, feedback, score);
      
      // Update local state for general submissions
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
      
      // Update quest submissions state to refresh the table
      setQuestSubmissions(prev => prev.map(submission => {
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
      
      toast({
        title: "Review Submitted",
        description: `Submission has been ${status}.`,
        variant: "default",
      });
      
    } catch (error) {
      console.error('Error reviewing submission:', error);
      toast({
        title: "Review Failed",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsReviewDialogOpen(false);
      setSelectedSubmission(null);
      setReviewFeedback('');
      setReviewScore(0);
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



  if (view === 'quest-detail' && selectedQuest) {
    return (
      <>
        <div className="space-y-6">
          {/* Header */}
          <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10">
              <CardTitle className="flex items-center gap-2 font-mono">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView('overview')}
                  className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-dashed border-primary/30 text-primary hover:bg-primary/20 font-mono"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  [BACK_TO_OVERVIEW]
                </Button>
                <div className="p-1 bg-primary/20 rounded border border-dashed border-primary/40">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                QUEST_SUBMISSIONS_REVIEW
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-muted-foreground">Review submissions for: <span className="text-primary font-bold">{selectedQuest.title}</span></p>
            </CardContent>
          </Card>

        {/* Quest Info */}
        <Card className="border-2 border-dashed border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
          <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
            <CardTitle className="flex items-center gap-2 font-mono">
              <div className="p-1 bg-cyan-500/20 rounded border border-dashed border-cyan-500/40">
                <FileText className="w-4 h-4 text-cyan-500" />
              </div>
              QUEST_INFO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-muted-foreground mb-4">{selectedQuest.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono">
              <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 p-3 rounded border border-dashed border-primary/20">
                <div className="text-muted-foreground">TOTAL:</div>
                <div className="text-primary font-bold text-lg">{questSubmissions.length}</div>
              </div>
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-3 rounded border border-dashed border-yellow-500/20">
                <div className="text-muted-foreground">PENDING:</div>
                <div className="text-yellow-500 font-bold text-lg">{questSubmissions.filter(s => s.status === 'pending').length}</div>
              </div>
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-3 rounded border border-dashed border-green-500/20">
                <div className="text-muted-foreground">APPROVED:</div>
                <div className="text-green-500 font-bold text-lg">{questSubmissions.filter(s => s.status === 'approved').length}</div>
              </div>
              <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 p-3 rounded border border-dashed border-red-500/20">
                <div className="text-muted-foreground">REJECTED:</div>
                <div className="text-red-500 font-bold text-lg">{questSubmissions.filter(s => s.status === 'rejected').length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quest Submissions Table */}
        <Card className="border-2 border-dashed border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
            <CardTitle className="flex items-center gap-2 font-mono">
              <div className="p-1 bg-purple-500/20 rounded border border-dashed border-purple-500/40">
                <FileText className="w-4 h-4 text-purple-500" />
              </div>
              SUBMISSIONS_TABLE ({questSubmissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-dashed border-purple-500/30">
                    <TableHead className="text-muted-foreground font-mono">[USER]</TableHead>
                    <TableHead className="text-muted-foreground font-mono">[CONTENT]</TableHead>
                    <TableHead className="text-muted-foreground font-mono">[SUBMITTED]</TableHead>
                    <TableHead className="text-muted-foreground font-mono">[STATUS]</TableHead>
                    <TableHead className="text-muted-foreground font-mono">[VALIDATION]</TableHead>
                    <TableHead className="text-muted-foreground font-mono">[ACTIONS]</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questSubmissions.map((submission) => (
                    <TableRow key={submission.id} className="border-b border-dashed border-purple-500/20 hover:bg-gradient-to-r hover:from-purple-500/5 hover:to-blue-500/5">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-blue-500/20 border border-dashed border-primary/40 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-mono font-medium text-foreground">{submission.user?.firstName && submission.user?.lastName ? `${submission.user.firstName} ${submission.user.lastName}` : submission.user?.name || 'Unknown User'}</div>
                            <div className="text-xs text-muted-foreground font-mono">@{submission.user?.username || submission.user?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {submission.content?.type === 'text' && (
                            <p className="text-sm truncate text-muted-foreground font-mono">{submission.content.text}</p>
                          )}
                          {submission.content?.type === 'url' && (
                            <a 
                              href={submission.content.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-cyan-500 hover:text-primary text-sm truncate block font-mono underline"
                            >
                              {submission.content.url}
                            </a>
                          )}
                          {submission.content?.type === 'account-id' && (
                            <code className="text-xs bg-gradient-to-r from-primary/10 to-blue-500/10 border border-dashed border-primary/30 px-2 py-1 rounded text-primary font-mono">
                              {submission.content.accountId}
                            </code>
                          )}
                          {submission.content?.type === 'transaction-id' && (
                            <code className="text-xs bg-gradient-to-r from-primary/10 to-blue-500/10 border border-dashed border-primary/30 px-2 py-1 rounded text-primary font-mono">
                              {submission.content.transactionId}
                            </code>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground font-mono">
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
                              "text-xs bg-gradient-to-r from-primary/10 to-blue-500/10 border border-dashed font-mono",
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
                            className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-dashed border-green-500/30 text-green-500 hover:bg-green-500/20 disabled:opacity-50 font-mono text-xs"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            [VALIDATE]
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(submission.id, 'rejected', 'Submission rejected')}
                            disabled={submission.status === 'rejected' || loading}
                            className="bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-dashed border-red-500/30 text-red-500 hover:bg-red-500/20 disabled:opacity-50 font-mono text-xs"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            [REJECT]
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              console.log('DETAILS button clicked!');
                              console.log('Setting selectedDetailSubmission:', submission);
                              setSelectedDetailSubmission(submission);
                              console.log('Setting isDetailDialogOpen to true');
                              setIsDetailDialogOpen(true);
                              console.log('Dialog state should be open now');
                            }}
                            className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-dashed border-blue-500/30 text-blue-500 hover:bg-blue-500/20 font-mono text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            [DETAILS]
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>

                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {questSubmissions.length === 0 && (
                <div className="text-center py-8">
                  <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-dashed border-primary/20 rounded-lg p-6">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-mono text-muted-foreground">[NO_SUBMISSIONS_FOUND]</p>
                    <p className="font-mono text-sm text-muted-foreground/70 mt-2">This quest has no submissions yet.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-2xl font-mono border-2 border-dashed border-primary/30">
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
                {/* Submission Info */}
                <div className="p-4 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-lg border border-dashed border-primary/20">
                  <h3 className="font-mono font-bold text-primary mb-3">[SUBMISSION_INFO]</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium font-mono text-muted-foreground">[USER]</label>
                      <div className="font-mono">{selectedSubmission.userName}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium font-mono text-muted-foreground">[EMAIL]</label>
                      <div className="font-mono">{selectedSubmission.userEmail}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium font-mono text-muted-foreground">[QUEST]</label>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{selectedSubmission.questTitle}</span>
                        {getDifficultyBadge(selectedSubmission.questDifficulty || 'unknown')}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium font-mono text-muted-foreground">[SUBMITTED]</label>
                      <div className="font-mono text-sm">
                        {format(new Date(selectedSubmission.submittedAt || selectedSubmission.created_at || Date.now()), 'PPp')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-lg border border-dashed border-blue-500/20">
                  <h3 className="font-mono font-bold text-blue-600 mb-3">[SUBMISSION_CONTENT]</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium font-mono text-muted-foreground">[DESCRIPTION]</label>
                      <div className="font-mono text-sm p-3 bg-white/50 rounded border border-dashed border-blue-500/20">
                        {selectedSubmission.description || 'No description provided'}
                      </div>
                    </div>
                    {selectedSubmission.content && (
                      <div>
                        <label className="text-sm font-medium font-mono text-muted-foreground">[CONTENT]</label>
                        <div className="p-3 bg-white/50 rounded border border-dashed border-blue-500/20">
                          {selectedSubmission.content.type === 'text' && (
                            <div className="font-mono text-sm whitespace-pre-wrap">{selectedSubmission.content.text}</div>
                          )}
                          {selectedSubmission.content.type === 'url' && (
                            <a 
                              href={selectedSubmission.content.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-500 hover:underline font-mono text-sm flex items-center gap-1"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {selectedSubmission.content.url}
                            </a>
                          )}
                          {selectedSubmission.content.type === 'account-id' && (
                            <code className="text-sm bg-gradient-to-r from-primary/10 to-blue-500/10 border border-dashed border-primary/30 px-3 py-2 rounded text-primary font-mono block">
                              {selectedSubmission.content.accountId}
                            </code>
                          )}
                          {selectedSubmission.content.type === 'transaction-id' && (
                            <code className="text-sm bg-gradient-to-r from-primary/10 to-blue-500/10 border border-dashed border-primary/30 px-3 py-2 rounded text-primary font-mono block">
                              {selectedSubmission.content.transactionId}
                            </code>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Form */}
                <div className="p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-lg border border-dashed border-purple-500/20">
                  <h3 className="font-mono font-bold text-purple-600 mb-3">[REVIEW_FORM]</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium font-mono text-muted-foreground">[SCORE] (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={reviewScore}
                        onChange={(e) => setReviewScore(Number(e.target.value))}
                        className="w-full p-2 border border-dashed border-purple-500/30 rounded font-mono text-sm bg-white/50"
                        placeholder="Enter score (0-100)"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium font-mono text-muted-foreground">[FEEDBACK]</label>
                      <textarea
                        value={reviewFeedback}
                        onChange={(e) => setReviewFeedback(e.target.value)}
                        className="w-full p-3 border border-dashed border-purple-500/30 rounded font-mono text-sm bg-white/50 min-h-[100px]"
                        placeholder="Provide detailed feedback for the submission..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsReviewDialogOpen(false)}
                className="font-mono border-dashed border-primary/30 text-primary hover:bg-primary/10"
              >
                [CANCEL]
              </Button>
              <Button 
                variant="outline"
                onClick={() => selectedSubmission && handleReviewSubmission(selectedSubmission.id, 'needs-revision', reviewFeedback, reviewScore)}
                className="font-mono bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-dashed border-orange-500/30 text-orange-500 hover:bg-orange-500/20"
              >
                [NEEDS_REVISION]
              </Button>
              <Button 
                variant="outline"
                onClick={() => selectedSubmission && handleReviewSubmission(selectedSubmission.id, 'rejected', reviewFeedback, reviewScore)}
                className="font-mono bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-dashed border-red-500/30 text-red-500 hover:bg-red-500/20"
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


      {/* Details Dialog */}
      {(() => {
        console.log('Details Dialog render - isDetailDialogOpen:', isDetailDialogOpen);
        console.log('Details Dialog render - selectedDetailSubmission:', selectedDetailSubmission);
        return null;
      })()}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl font-mono border-2 border-dashed border-primary/30">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              [SUBMISSION_DETAILS]
            </DialogTitle>
            <DialogDescription>
              View detailed information about this submission.
            </DialogDescription>
          </DialogHeader>
          {selectedDetailSubmission && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* User Information */}
              <div className="p-4 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-lg border border-dashed border-primary/20">
                <h3 className="font-mono font-bold text-primary mb-3">[USER_INFORMATION]</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium font-mono text-muted-foreground">[FIRST_NAME]</label>
                    <div className="font-mono">{selectedDetailSubmission.user?.firstName || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium font-mono text-muted-foreground">[LAST_NAME]</label>
                    <div className="font-mono">{selectedDetailSubmission.user?.lastName || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium font-mono text-muted-foreground">[USERNAME]</label>
                    <div className="font-mono">{selectedDetailSubmission.user?.username || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium font-mono text-muted-foreground">[USER_ID]</label>
                    <div className="font-mono text-sm text-muted-foreground">{selectedDetailSubmission.userId}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium font-mono text-muted-foreground">[STATUS]</label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedDetailSubmission.status)}
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs bg-gradient-to-r from-primary/10 to-blue-500/10 border border-dashed font-mono",
                          getStatusColor(selectedDetailSubmission.status)
                        )}
                      >
                        {selectedDetailSubmission.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Social Media Profiles */}
                {(() => {
                  console.log('=== SOCIAL MEDIA DEBUG ===');
                  console.log('selectedDetailSubmission:', selectedDetailSubmission);
                  console.log('user object:', selectedDetailSubmission?.user);
                  console.log('twitterProfile:', selectedDetailSubmission?.user?.twitterProfile);
                  console.log('facebookProfile:', selectedDetailSubmission?.user?.facebookProfile);
                  console.log('discordProfile:', selectedDetailSubmission?.user?.discordProfile);
                  console.log('=== END DEBUG ===');
                  return null;
                })()}
                {(selectedDetailSubmission.user?.twitterProfile || selectedDetailSubmission.user?.facebookProfile || selectedDetailSubmission.user?.discordProfile) && (
                  <div className="mt-4 pt-4 border-t border-dashed border-primary/20">
                    <h4 className="font-mono font-bold text-primary mb-3">[SOCIAL_MEDIA_PROFILES]</h4>
                    <div className="space-y-3">
                      {selectedDetailSubmission.user?.twitterProfile && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-dashed border-blue-200">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            T
                          </div>
                          <div className="flex-1">
                            <div className="font-mono text-sm font-bold text-blue-700">
                              @{selectedDetailSubmission.user.twitterProfile.twitter_username}
                            </div>
                            <div className="font-mono text-xs text-blue-600">
                              ID: {selectedDetailSubmission.user.twitterProfile.twitter_id}
                            </div>
                          </div>
                          {selectedDetailSubmission.user.twitterProfile.twitter_profile_picture && (
                            <img 
                              src={selectedDetailSubmission.user.twitterProfile.twitter_profile_picture.trim()} 
                              alt="Twitter Profile" 
                              className="w-8 h-8 rounded-full border border-blue-300"
                            />
                          )}
                        </div>
                      )}
                      
                      {selectedDetailSubmission.user?.facebookProfile && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-dashed border-blue-200">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            F
                          </div>
                          <div className="flex-1">
                            <div className="font-mono text-sm font-bold text-blue-700">
                              {selectedDetailSubmission.user.facebookProfile.firstname} {selectedDetailSubmission.user.facebookProfile.lastname}
                            </div>
                            <div className="font-mono text-xs text-blue-600">
                              ID: {selectedDetailSubmission.user.facebookProfile.facebook_id}
                            </div>
                            <div className="font-mono text-xs text-blue-600">
                              Email: {selectedDetailSubmission.user.facebookProfile.email}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selectedDetailSubmission.user?.discordProfile && (
                        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-dashed border-indigo-200">
                          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            D
                          </div>
                          <div className="flex-1">
                            <div className="font-mono text-sm font-bold text-indigo-700">
                              {selectedDetailSubmission.user.discordProfile.discord_username}
                            </div>
                            <div className="font-mono text-xs text-indigo-600">
                              ID: {selectedDetailSubmission.user.discordProfile.discord_id}
                            </div>
                          </div>
                          {selectedDetailSubmission.user.discordProfile.discord_picture && (
                            <img 
                              src={selectedDetailSubmission.user.discordProfile.discord_picture} 
                              alt="Discord Profile" 
                              className="w-8 h-8 rounded-full border border-indigo-300"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quest Information */}
              <div className="p-4 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-lg border border-dashed border-green-500/20">
                <h3 className="font-mono font-bold text-green-600 mb-3">[QUEST_INFORMATION]</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium font-mono text-muted-foreground">[TITLE]</label>
                    <div className="font-mono">{selectedDetailSubmission.questTitle}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium font-mono text-muted-foreground">[QUEST_ID]</label>
                    <div className="font-mono text-sm text-muted-foreground">{selectedDetailSubmission.questId}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium font-mono text-muted-foreground">[DIFFICULTY]</label>
                    <div>{getDifficultyBadge(selectedDetailSubmission.questDifficulty || 'unknown')}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium font-mono text-muted-foreground">[POINTS]</label>
                    <div className="flex items-center gap-1 font-mono">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-500 font-bold">{selectedDetailSubmission.questPoints}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submission Content */}
              <div className="p-4 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-lg border border-dashed border-blue-500/20">
                <h3 className="font-mono font-bold text-blue-600 mb-3">[SUBMISSION_CONTENT]</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium font-mono text-muted-foreground">[DESCRIPTION]</label>
                    <div className="font-mono text-sm p-3 bg-white/50 rounded border border-dashed border-blue-500/20">
                      {selectedDetailSubmission.description || 'No description provided'}
                    </div>
                  </div>
                  
                  {selectedDetailSubmission.content && (
                    <div>
                      <label className="text-sm font-medium font-mono text-muted-foreground">[CONTENT_TYPE: {selectedDetailSubmission.content.type?.toUpperCase()}]</label>
                      <div className="p-3 bg-white/50 rounded border border-dashed border-blue-500/20">
                        {selectedDetailSubmission.content.type === 'text' && (
                          <div className="font-mono text-sm whitespace-pre-wrap">{selectedDetailSubmission.content.text}</div>
                        )}
                        {selectedDetailSubmission.content.type === 'url' && (
                          <a 
                            href={selectedDetailSubmission.content.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-500 hover:underline font-mono text-sm flex items-center gap-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {selectedDetailSubmission.content.url}
                          </a>
                        )}
                        {selectedDetailSubmission.content.type === 'account-id' && (
                          <code className="text-sm bg-gradient-to-r from-primary/10 to-blue-500/10 border border-dashed border-primary/30 px-3 py-2 rounded text-primary font-mono block">
                            {selectedDetailSubmission.content.accountId}
                          </code>
                        )}
                        {selectedDetailSubmission.content.type === 'transaction-id' && (
                          <code className="text-sm bg-gradient-to-r from-primary/10 to-blue-500/10 border border-dashed border-primary/30 px-3 py-2 rounded text-primary font-mono block">
                            {selectedDetailSubmission.content.transactionId}
                          </code>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedDetailSubmission.submissionUrl && (
                    <div>
                      <label className="text-sm font-medium font-mono text-muted-foreground">[SUBMISSION_URL]</label>
                      <div className="p-3 bg-white/50 rounded border border-dashed border-blue-500/20">
                        <a 
                          href={selectedDetailSubmission.submissionUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 hover:underline font-mono text-sm flex items-center gap-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {selectedDetailSubmission.submissionUrl}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submission Metadata */}
              <div className="p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-lg border border-dashed border-purple-500/20">
                <h3 className="font-mono font-bold text-purple-600 mb-3">[SUBMISSION_METADATA]</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium font-mono text-muted-foreground">[SUBMISSION_ID]</label>
                    <div className="font-mono text-sm text-muted-foreground">{selectedDetailSubmission.id}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium font-mono text-muted-foreground">[SUBMITTED_AT]</label>
                    <div className="font-mono text-sm">
                      {format(new Date(selectedDetailSubmission.submittedAt || selectedDetailSubmission.created_at || Date.now()), 'PPpp')}
                    </div>
                  </div>
                  {selectedDetailSubmission.reviewedAt && (
                    <div>
                      <label className="text-sm font-medium font-mono text-muted-foreground">[REVIEWED_AT]</label>
                      <div className="font-mono text-sm">
                        {format(new Date(selectedDetailSubmission.reviewedAt), 'PPpp')}
                      </div>
                    </div>
                  )}
                  {selectedDetailSubmission.reviewedBy && (
                    <div>
                      <label className="text-sm font-medium font-mono text-muted-foreground">[REVIEWED_BY]</label>
                      <div className="font-mono text-sm">{selectedDetailSubmission.reviewedBy}</div>
                    </div>
                  )}
                  {selectedDetailSubmission.score !== undefined && (
                    <div>
                      <label className="text-sm font-medium font-mono text-muted-foreground">[SCORE]</label>
                      <div className="font-mono text-sm font-bold text-primary">{selectedDetailSubmission.score}/100</div>
                    </div>
                  )}
                  {selectedDetailSubmission.feedback && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium font-mono text-muted-foreground">[FEEDBACK]</label>
                      <div className="font-mono text-sm p-3 bg-white/50 rounded border border-dashed border-purple-500/20 whitespace-pre-wrap">
                        {selectedDetailSubmission.feedback}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDetailDialogOpen(false)} 
              className="font-mono border-dashed border-primary/30 text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              [CLOSE]
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </>
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
            SUBMISSION_REVIEW
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters and Search removed as requested by user */}

          {/* Table removed as requested by user */}

          {/* Quest Selection with Multi-View System */}
          <div className="flex items-center justify-between mb-6 mt-6">
            {/* View Toggle Controls */}
            <div className="flex items-center gap-1 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-lg p-1 border border-dashed border-primary/20">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
                className={cn(
                  "font-mono text-xs h-8 px-3 transition-all duration-200",
                  viewMode === 'card' 
                    ? "bg-gradient-to-r from-primary to-blue-500 text-white shadow-md" 
                    : "text-primary hover:bg-primary/10 border border-dashed border-primary/20"
                )}
              >
                <Grid3X3 className="w-3 h-3 mr-1" />
                CARD
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className={cn(
                  "font-mono text-xs h-8 px-3 transition-all duration-200",
                  viewMode === 'table' 
                    ? "bg-gradient-to-r from-primary to-blue-500 text-white shadow-md" 
                    : "text-primary hover:bg-primary/10 border border-dashed border-primary/20"
                )}
              >
                <TableIcon className="w-3 h-3 mr-1" />
                TABLE
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  "font-mono text-xs h-8 px-3 transition-all duration-200",
                  viewMode === 'list' 
                    ? "bg-gradient-to-r from-primary to-blue-500 text-white shadow-md" 
                    : "text-primary hover:bg-primary/10 border border-dashed border-primary/20"
                )}
              >
                <List className="w-3 h-3 mr-1" />
                LIST
              </Button>
            </div>
          </div>
          {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p className="text-lg font-medium">Loading quests...</p>
                  <p className="text-sm text-gray-500">Please wait while we fetch the available quests</p>
                </div>
              ) : (
                <div className="transition-all duration-300">
                  {/* Card View */}
                  {viewMode === 'card' && (
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

                  {/* Table View */}
                  {viewMode === 'table' && (
                    <div className="border border-dashed border-primary/20 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-b border-dashed border-primary/20">
                            <TableHead className="font-mono text-primary font-bold">[QUEST_TITLE]</TableHead>
                            <TableHead className="font-mono text-primary font-bold">[DESCRIPTION]</TableHead>
                            <TableHead className="font-mono text-primary font-bold text-center">[TOTAL]</TableHead>
                            <TableHead className="font-mono text-primary font-bold text-center">[PENDING]</TableHead>
                            <TableHead className="font-mono text-primary font-bold text-center">[ACTIONS]</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {quests.map((quest) => (
                            <TableRow 
                              key={quest.id} 
                              className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 cursor-pointer transition-all duration-200 border-b border-dashed border-primary/10"
                              onClick={() => !loading && handleQuestSelect(quest)}
                            >
                              <TableCell className="font-mono font-medium text-primary">{quest.title}</TableCell>
                              <TableCell className="font-mono text-muted-foreground text-sm max-w-xs truncate">{quest.description}</TableCell>
                              <TableCell className="font-mono text-center">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border border-dashed border-primary/20">
                                  {quest.completions?.length || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-center">
                                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border border-dashed border-yellow-500/20">
                                  {quest.completions?.filter((c: any) => c.status === 'pending').length || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="font-mono text-xs border-dashed border-primary/30 text-primary hover:bg-primary/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    !loading && handleQuestSelect(quest);
                                  }}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  VIEW
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* List View */}
                  {viewMode === 'list' && (
                    <div className="space-y-2">
                      {quests.map((quest) => (
                        <div 
                          key={quest.id}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-lg border border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5 hover:from-primary/10 hover:to-blue-500/10 cursor-pointer transition-all duration-200",
                            loading && "opacity-50 cursor-not-allowed"
                          )}
                          onClick={() => !loading && handleQuestSelect(quest)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/20 rounded border border-dashed border-primary/40">
                                <Target className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-mono font-medium text-primary truncate">{quest.title}</h3>
                                <p className="font-mono text-sm text-muted-foreground truncate">{quest.description}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 ml-4">
                            <div className="text-center">
                              <div className="font-mono text-sm font-bold text-primary">{quest.completions?.length || 0}</div>
                              <div className="font-mono text-xs text-muted-foreground">TOTAL</div>
                            </div>
                            <div className="text-center">
                              <div className="font-mono text-sm font-bold text-yellow-500">{quest.completions?.filter((c: any) => c.status === 'pending').length || 0}</div>
                              <div className="font-mono text-xs text-muted-foreground">PENDING</div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="font-mono text-xs border-dashed border-primary/30 text-primary hover:bg-primary/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                !loading && handleQuestSelect(quest);
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              VIEW
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
                    {getDifficultyBadge(selectedSubmission.questDifficulty || 'unknown')}
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
              onClick={() => selectedSubmission && handleReviewSubmission(selectedSubmission.id, 'needs-revision', reviewFeedback, reviewScore)}
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

    </div>
  );
}