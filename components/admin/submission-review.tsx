'use client';

import { useState, useEffect } from 'react';
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
  Link
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

export function SubmissionReview({ className }: SubmissionReviewProps) {
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(mockSubmissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewScore, setReviewScore] = useState<number>(0);

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

  const openReviewDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setReviewFeedback(submission.feedback || '');
    setReviewScore(submission.score || 0);
    setIsReviewDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div className={className}>
      <Card className="border-2 border-dashed border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <CardTitle className="flex items-center gap-2 font-mono">
            <div className="p-1 bg-purple-500/20 rounded border border-dashed border-purple-500/40">
              <FileText className="w-4 h-4 text-purple-500" />
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
                className="pl-10 font-mono border-dashed border-purple-500/30 focus:border-solid"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 font-mono border-dashed border-purple-500/30">
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
              <SelectTrigger className="w-44 font-mono border-dashed border-purple-500/30">
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
          <div className="border-2 border-dashed border-purple-500/20 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-b border-dashed border-purple-500/20">
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
                  <TableRow key={submission.id} className="border-b border-dashed border-purple-500/10 hover:bg-gradient-to-r hover:from-purple-500/5 hover:to-pink-500/5">
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
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-lg border border-dashed border-purple-500/20">
              <div className="text-2xl font-bold font-mono text-purple-500">
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
        <DialogContent className="max-w-3xl font-mono border-2 border-dashed border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              [REVIEW_SUBMISSION]
            </DialogTitle>
            <DialogDescription>
              Review and provide feedback for this submission.
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              {/* Submission Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-lg border border-dashed border-purple-500/20">
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
                    className="font-mono border-dashed border-purple-500/30"
                    placeholder="Enter score"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium font-mono">[FEEDBACK]</label>
                  <Textarea
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    className="font-mono border-dashed border-purple-500/30"
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
    </div>
  );
}

export default SubmissionReview;