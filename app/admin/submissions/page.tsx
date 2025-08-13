'use client';

import { useState, useEffect } from 'react';
import { Submission, Quest, User } from '@/lib/types';
import { QuestService } from '@/lib/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Search,
  Filter,
  FileText,
  User as UserIcon,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReviewSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewPoints, setReviewPoints] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchTerm, statusFilter]);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await QuestService.getSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.questId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.userId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }

    // Sort by submission date (newest first)
    filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    setFilteredSubmissions(filtered);
  };

  const handleReviewSubmission = async (
    submissionId: string, 
    status: 'approved' | 'rejected' | 'needs-revision'
  ) => {
    try {
      const points = status === 'approved' ? parseInt(reviewPoints) || 0 : undefined;
      await QuestService.reviewSubmission(submissionId, status, reviewFeedback, points);
      setSelectedSubmission(null);
      setReviewFeedback('');
      setReviewPoints('');
      loadSubmissions();
    } catch (error) {
      console.error('Failed to review submission:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'needs-revision':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'needs-revision':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatSubmissionContent = (submission: Submission) => {
    const { content } = submission;
    switch (content.type) {
      case 'url':
        return content.url;
      case 'text':
        return content.text?.substring(0, 100) + (content.text && content.text.length > 100 ? '...' : '');
      case 'transaction-id':
        return content.transactionId;
      case 'account-id':
        return content.accountId;
      case 'file':
        return content.fileName;
      default:
        return 'Unknown content type';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Review Submissions</h1>
        <p className="text-muted-foreground">Review and approve user quest submissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'approved').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Needs Review</p>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'needs-revision').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by quest ID or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="needs-revision">Needs Revision</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions ({filteredSubmissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quest ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-mono text-sm">
                      #{submission.questId}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {submission.userId}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {formatSubmissionContent(submission)}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {submission.content.type.replace('-', ' ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(submission.submittedAt).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(submission.status)}
                        <Badge className={cn('text-xs', getStatusColor(submission.status))} variant="outline">
                          {submission.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      {selectedSubmission && (
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Submission</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Submission Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>Quest ID: <span className="font-mono">#{selectedSubmission.questId}</span></div>
                    <div>User ID: <span className="font-mono">{selectedSubmission.userId}</span></div>
                    <div>Type: <span className="capitalize">{selectedSubmission.content.type.replace('-', ' ')}</span></div>
                    <div>Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Current Status</h4>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(selectedSubmission.status)}
                    <Badge className={getStatusColor(selectedSubmission.status)} variant="outline">
                      {selectedSubmission.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  {selectedSubmission.reviewedAt && (
                    <div className="text-sm text-muted-foreground">
                      Reviewed: {new Date(selectedSubmission.reviewedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Submission Content</h4>
                <div className="bg-muted p-3 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(selectedSubmission.content, null, 2)}
                  </pre>
                </div>
              </div>

              {selectedSubmission.feedback && (
                <div>
                  <h4 className="font-semibold mb-2">Previous Feedback</h4>
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    {selectedSubmission.feedback}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Review Feedback</h4>
                <Textarea
                  placeholder="Enter your feedback for the user..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <h4 className="font-semibold mb-2">Points to Award (if approved)</h4>
                <Input
                  type="number"
                  placeholder="Enter points..."
                  value={reviewPoints}
                  onChange={(e) => setReviewPoints(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleReviewSubmission(selectedSubmission.id, 'approved')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReviewSubmission(selectedSubmission.id, 'needs-revision')}
                  variant="outline"
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Needs Revision
                </Button>
                <Button
                  onClick={() => handleReviewSubmission(selectedSubmission.id, 'rejected')}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}