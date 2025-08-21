'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Submission, Quest } from '@/lib/types';
import { QuestService } from '@/lib/services';
import { tokenStorage } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  User as UserIcon,
  Calendar,
  Eye,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ExtendedSubmission extends Submission {
  user?: any;
  completedAt?: string;
  created_at?: string;
}

export default function QuestSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const questId = params?.questId as string;
  
  if (!questId) {
    return <div>Loading...</div>;
  }
  
  const [quest, setQuest] = useState<Quest | null>(null);
  const [submissions, setSubmissions] = useState<ExtendedSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ExtendedSubmission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleStatusUpdate = async (submissionId: string, action: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hedera-quests.com';
      const endpoint = action === 'approved' 
        ? `${baseUrl}/quest-completions/completions/${submissionId}/validate`
        : `${baseUrl}/quest-completions/completions/${submissionId}/reject`;
      
      const token = tokenStorage.getAccessToken();
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        // Update the submission status in the local state
        const newStatus = action === 'approved' ? 'approved' : 'rejected';
        setSubmissions(prev => prev.map(sub => 
          sub.id === submissionId ? { ...sub, status: newStatus } : sub
        ));
      } else {
        console.error('Failed to update submission status:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating submission status:', error);
    }
  };

  useEffect(() => {
    const loadQuestSubmissions = async () => {
      try {
        setLoading(true);
        const response = await QuestService.getQuestCompletions();
        
        if (response.success) {
          // Find the specific quest
          const foundQuest = response.quests.find((q: any) => q.id.toString() === questId);
          if (foundQuest) {
            setQuest(foundQuest);
            let questSubmissions = foundQuest.completions || [];
            
            // Transform API user data to match expected format
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
            
            setSubmissions(questSubmissions);
          }
        }
      } catch (error) {
        console.error('Error loading quest submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (questId) {
      loadQuestSubmissions();
    }
  }, [questId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-green-400">Loading quest submissions...</div>
        </div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400">Quest not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="bg-gray-800 border border-gray-600 text-green-400 hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-green-400">Quest Submissions</h1>
            <p className="text-gray-400">Review submissions for: {quest.title}</p>
          </div>
        </div>

        {/* Quest Info */}
        <Card className="bg-gray-900 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">{quest.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">{quest.description}</p>
            <div className="flex gap-4 text-sm">
              <div className="text-gray-400">
                Total Submissions: <span className="text-white font-medium">{submissions.length}</span>
              </div>
              <div className="text-gray-400">
                Pending: <span className="text-yellow-400 font-medium">{submissions.filter(s => s.status === 'pending').length}</span>
              </div>
              <div className="text-gray-400">
                Approved: <span className="text-green-400 font-medium">{submissions.filter(s => s.status === 'approved').length}</span>
              </div>
              <div className="text-gray-400">
                Rejected: <span className="text-red-400 font-medium">{submissions.filter(s => s.status === 'rejected').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card className="bg-gray-900 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Submissions ({submissions.length})</CardTitle>
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
                  {submissions.map((submission) => (
                    <TableRow key={submission.id} className="border-b border-gray-700 hover:bg-gray-800">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-green-400" />
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
                          {new Date(submission.submittedAt || submission.created_at || Date.now()).toLocaleDateString()}
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
                            onClick={() => handleStatusUpdate(submission.id, 'approved')}
                            disabled={submission.status === 'approved'}
                            className="bg-green-900/20 border border-green-600 text-green-400 hover:bg-green-800/30 disabled:opacity-50"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Validate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(submission.id, 'rejected')}
                            disabled={submission.status === 'rejected'}
                            className="bg-red-900/20 border border-red-600 text-red-400 hover:bg-red-800/30 disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog open={isDialogOpen && selectedSubmission?.id === submission.id} onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (!open) setSelectedSubmission(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setIsDialogOpen(true);
                              }}
                              className="bg-gray-800 border border-gray-600 text-green-400 hover:bg-gray-700"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-green-400 flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Submission Details
                              </DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Review submission from {submission.user?.name || 'Unknown User'}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              {/* User Info */}
                              <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-gray-400 mb-2">SUBMITTED BY</h3>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center">
                                    <UserIcon className="w-5 h-5 text-green-400" />
                                  </div>
                                  <div>
                                    <div className="text-white font-medium">{submission.user?.name || 'Unknown User'}</div>
                                    <div className="text-sm text-gray-400">@{submission.user?.username || submission.user?.email}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Submission Content */}
                              <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-gray-400 mb-3">SUBMISSION CONTENT</h3>
                                <div className="space-y-3">
                                  {submission.content?.type === 'text' && (
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">TEXT RESPONSE</div>
                                      <div className="bg-gray-700 border border-gray-600 rounded p-3 text-sm text-white">
                                        {submission.content.text}
                                      </div>
                                    </div>
                                  )}
                                  {submission.content?.type === 'url' && (
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">URL SUBMISSION</div>
                                      <div className="bg-gray-700 border border-gray-600 rounded p-3">
                                        <a 
                                          href={submission.content.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-cyan-400 hover:text-green-400 text-sm flex items-center gap-2"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          {submission.content.url}
                                        </a>
                                      </div>
                                    </div>
                                  )}
                                  {submission.content?.type === 'account-id' && (
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">HEDERA ACCOUNT ID</div>
                                      <div className="bg-gray-700 border border-gray-600 rounded p-3">
                                        <code className="text-green-400 text-sm font-mono">
                                          {submission.content.accountId}
                                        </code>
                                      </div>
                                    </div>
                                  )}
                                  {submission.content?.type === 'transaction-id' && (
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">TRANSACTION ID</div>
                                      <div className="bg-gray-700 border border-gray-600 rounded p-3">
                                        <code className="text-green-400 text-sm font-mono">
                                          {submission.content.transactionId}
                                        </code>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Submission Meta */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                                  <h3 className="text-sm font-medium text-gray-400 mb-2">STATUS</h3>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(submission.status)}
                                    <Badge 
                                      variant="secondary" 
                                      className={cn(
                                        "text-xs bg-gray-700 border",
                                        getStatusColor(submission.status)
                                      )}
                                    >
                                      {submission.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                                  <h3 className="text-sm font-medium text-gray-400 mb-2">SUBMITTED</h3>
                                  <div className="flex items-center gap-2 text-sm text-white">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {new Date(submission.submittedAt || submission.created_at || Date.now()).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-3 pt-4 border-t border-gray-700">
                                <Button 
                                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                                  onClick={() => {
                                    // TODO: Implement approve functionality
                                    console.log('Approve submission:', submission.id);
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button 
                                  variant="outline"
                                  className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600 flex-1"
                                  onClick={() => {
                                    // TODO: Implement needs revision functionality
                                    console.log('Request revision for submission:', submission.id);
                                  }}
                                >
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Needs Revision
                                </Button>
                                <Button 
                                  variant="outline"
                                  className="bg-red-600 hover:bg-red-700 text-white border-red-600 flex-1"
                                  onClick={() => {
                                    // TODO: Implement reject functionality
                                    console.log('Reject submission:', submission.id);
                                  }}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {submissions.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No submissions found for this quest.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}