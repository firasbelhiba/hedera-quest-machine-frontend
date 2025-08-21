'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Submission, Quest } from '@/lib/types';
import { QuestService } from '@/lib/services';
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
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtendedSubmission extends Submission {
  user?: any;
  completedAt?: string;
  created_at?: string;
}

export default function QuestSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const questId = params.questId as string;
  
  const [quest, setQuest] = useState<Quest | null>(null);
  const [submissions, setSubmissions] = useState<ExtendedSubmission[]>([]);
  const [loading, setLoading] = useState(true);

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
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            router.push(`/admin/submissions/${submission.id}`);
                          }}
                          className="bg-gray-800 border border-gray-600 text-green-400 hover:bg-gray-700"
                        >
                          Review
                        </Button>
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