'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Submission } from '@/lib/types';
import { QuestService } from '@/lib/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  FileText,
  User as UserIcon,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReviewSubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = params?.id as string;
  
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewPoints, setReviewPoints] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      console.log('Loading submission with ID:', submissionId, 'Type:', typeof submissionId);
      const data = await QuestService.getQuestCompletions();
      
      // Find the submission by ID (handle both string and number comparison)
      let foundSubmission = null;
      for (const quest of data.quests || []) {
        console.log('Quest completions:', quest.completions?.map((c: any) => ({ id: c.id, type: typeof c.id })));
        const found = quest.completions?.find((comp: any) => 
          comp.id.toString() === submissionId
        );
        if (found) {
          console.log('Found submission:', found);
          foundSubmission = {
            ...found,
            questTitle: quest.title,
            questId: quest.id
          };
          break;
        }
      }
      
      if (foundSubmission) {
        setSubmission(foundSubmission);
        setReviewFeedback(foundSubmission.rejectionReason || '');
      } else {
        // Submission not found, redirect back
        router.push('/admin/submissions');
      }
    } catch (error) {
      console.error('Error loading submission:', error);
      router.push('/admin/submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmission = async (status: 'approved' | 'rejected' | 'needs-revision') => {
    if (!submission) return;
    
    try {
      setSubmitting(true);
      await QuestService.reviewSubmission(
        submission.id.toString(), 
        status,
        reviewFeedback,
        reviewPoints ? parseInt(reviewPoints) : undefined
      );
      
      // Navigate back to submissions list
      router.push('/admin/submissions');
    } catch (error) {
      console.error('Error reviewing submission:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'validated':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'needs-revision':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'validated':
        return 'border-green-500 text-green-600';
      case 'rejected':
        return 'border-red-500 text-red-600';
      case 'needs-revision':
        return 'border-orange-500 text-orange-600';
      default:
        return 'border-blue-500 text-blue-600';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading submission...</div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Submission not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/admin/submissions')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Submissions
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Review Submission</h1>
          <p className="text-muted-foreground">Review and approve or reject this quest submission</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submission Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Submission Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quest</label>
                  <div className="font-medium">{submission.questTitle}</div>
                  <div className="text-sm text-muted-foreground font-mono">#{submission.questId}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User</label>
                  <div className="font-medium">{submission.user?.firstName} {submission.user?.lastName}</div>
                  <div className="text-sm text-muted-foreground font-mono">@{submission.user?.username}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(submission.completedAt || submission.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(submission.status)}
                    <Badge className={getStatusColor(submission.status)} variant="outline">
                      {submission.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence */}
          <Card>
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <div className="whitespace-pre-wrap text-sm">
                  {submission.evidence || 'No evidence provided'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Previous Feedback */}
          {submission.rejectionReason && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg text-sm">
                  {submission.rejectionReason}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Review Panel */}
        <div className="space-y-6">
          {/* Status Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Review Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(submission.validatedAt || submission.rejectedAt) && (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Reviewed:</span>
                    <div className="text-muted-foreground">
                      {new Date(submission.validatedAt || submission.rejectedAt).toLocaleString()}
                    </div>
                  </div>
                  {submission.validatedBy && (
                    <div className="text-sm">
                      <span className="font-medium">By:</span>
                      <div className="text-muted-foreground">Admin ID {submission.validatedBy}</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Form */}
          <Card>
            <CardHeader>
              <CardTitle>Review Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Review Feedback</label>
                <Textarea
                  placeholder="Enter your feedback for the user..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Points to Award (if approved)</label>
                <Input
                  type="number"
                  placeholder="Enter points..."
                  value={reviewPoints}
                  onChange={(e) => setReviewPoints(e.target.value)}
                />
              </div>

              <div className="space-y-2 pt-4">
                <Button
                  onClick={() => handleReviewSubmission('approved')}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={submitting}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Submission
                </Button>
                <Button
                  onClick={() => handleReviewSubmission('needs-revision')}
                  variant="outline"
                  className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                  disabled={submitting}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Needs Revision
                </Button>
                <Button
                  onClick={() => handleReviewSubmission('rejected')}
                  variant="outline"
                  className="w-full border-red-500 text-red-600 hover:bg-red-50"
                  disabled={submitting}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Submission
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}