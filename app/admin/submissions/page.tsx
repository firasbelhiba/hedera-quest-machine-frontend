'use client';

import { useState, useEffect } from 'react';
import { Submission, Quest, User } from '@/lib/types';
import { QuestService } from '@/lib/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Search,
  Filter,
  FileText,
  User as UserIcon,
  Calendar,
  Globe,
  Bot,
  Play,
  Settings,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Extended submission interface with additional properties
interface ExtendedSubmission extends Submission {
  questTitle?: string;
  quest?: any;
  user?: any;
  completedAt?: string;
  created_at?: string;
}

export default function ReviewSubmissionsPage() {
  const router = useRouter();
  const [questsWithCompletions, setQuestsWithCompletions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<ExtendedSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ExtendedSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activePlatform, setActivePlatform] = useState<'twitter'|'facebook'|'discord'|'others'>('twitter');

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchTerm, statusFilter, activePlatform]);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const response = await QuestService.getQuestCompletions();
      const questsData = response.quests || [];
      setQuestsWithCompletions(questsData);
      // Extract submissions from the new format
      const allSubmissions = questsData.flatMap((quest: any) => 
        quest.completions.map((completion: any) => ({
          ...completion,
          questId: quest.id,
          questTitle: quest.title,
          quest: quest // Include the full quest object for platform filtering
        }))
      );
      setSubmissions(allSubmissions);
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
        submission.questTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.questId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }

    filtered = filtered.filter(
      (submission) => {
        const platformType = (submission.quest?.platform_type ?? '').toLowerCase();
        if (activePlatform === 'others') {
          return platformType && !['twitter', 'facebook', 'discord'].includes(platformType);
        }
        return platformType === activePlatform;
      }
    );

    // Sort by submission date (newest first)
    filtered.sort((a, b) => new Date(b.completedAt || b.created_at || b.submittedAt).getTime() - new Date(a.completedAt || a.created_at || a.submittedAt).getTime());

    setFilteredSubmissions(filtered);
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

      {/* Platform Tabs */}
      <Tabs value={activePlatform} onValueChange={(value) => setActivePlatform(value as 'twitter'|'facebook'|'discord'|'others')} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="twitter">Twitter</TabsTrigger>
          <TabsTrigger value="facebook">Facebook</TabsTrigger>
          <TabsTrigger value="discord">Discord</TabsTrigger>
          <TabsTrigger value="others">Others</TabsTrigger>
        </TabsList>
        

        
        <TabsContent value="twitter" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by quest title, user name, or username..."
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

          {/* Twitter Automation Widget */}
          <Card className="border-2 border-dashed border-gray-600 bg-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-mono text-green-400">
                <Bot className="w-5 h-5" />
                [TWITTER_AUTO_VALIDATOR]
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Configuration Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-900 border border-dashed border-gray-700 rounded">
                    <label className="flex items-center gap-2 text-xs font-mono text-gray-300">
                      <input type="checkbox" className="w-3 h-3" defaultChecked />
                      <span>[LIKES_VALIDATION]</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 font-mono">Validate likes interaction</p>
                  </div>
                  <div className="p-3 bg-gray-900 border border-dashed border-gray-700 rounded">
                    <label className="flex items-center gap-2 text-xs font-mono text-gray-300">
                      <input type="checkbox" className="w-3 h-3" defaultChecked />
                      <span>[RETWEETS_CHECK]</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 font-mono">Validate retweets interaction</p>
                  </div>
                  <div className="p-3 bg-gray-900 border border-dashed border-gray-700 rounded">
                    <label className="flex items-center gap-2 text-xs font-mono text-gray-300">
                      <input type="checkbox" className="w-3 h-3" defaultChecked />
                      <span>[COMMENTS_ANALYSIS]</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 font-mono">Validate comments interaction</p>
                  </div>
                  <div className="p-3 bg-gray-900 border border-dashed border-gray-700 rounded">
                    <label className="flex items-center gap-2 text-xs font-mono text-gray-300">
                      <input type="checkbox" className="w-3 h-3" defaultChecked />
                      <span>[FOLLOW_VALIDATION]</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 font-mono">Validate follow interaction</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                    <Zap className="w-3 h-3" />
                    <span>AI-powered validation with configurable criteria</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-dashed border-gray-500 text-gray-300 hover:bg-gray-800 bg-black font-mono"
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      [SAVE_CONFIG]
                    </Button>
                    <Button 
                      className="bg-gray-800 hover:bg-gray-700 text-green-400 font-mono border-2 border-gray-600"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      [LAUNCH_AUTO_REVIEW]
                    </Button>
                  </div>
                </div>

                {/* Status Display */}
                <div className="p-3 bg-gray-900 border border-dashed border-gray-700 rounded font-mono text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Status: [READY]</span>
                    <span className="text-gray-300">Pending: {filteredSubmissions.filter(s => s.status === 'pending').length} submissions</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Active Rules: 4/6</span>
                    <span>Est. Processing: ~{Math.ceil(filteredSubmissions.filter(s => s.status === 'pending').length * 0.5)}min</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submissions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Twitter Submissions ({filteredSubmissions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quest</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="font-medium">{submission.questTitle}</div>
                          <div className="text-xs text-muted-foreground font-mono">#{submission.questId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-medium">{submission.user?.name || 'Unknown User'}</div>
                              <div className="text-xs text-muted-foreground">@{submission.user?.username || submission.user?.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {submission.content?.type === 'text' && (
                              <p className="text-sm truncate">{submission.content.text}</p>
                            )}
                            {submission.content?.type === 'url' && (
                              <a 
                                href={submission.content.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm truncate block"
                              >
                                {submission.content.url}
                              </a>
                            )}
                            {submission.content?.type === 'account-id' && (
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {submission.content.accountId}
                              </code>
                            )}
                            {submission.content?.type === 'transaction-id' && (
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {submission.content.transactionId}
                              </code>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
                                "text-xs",
                                getStatusColor(submission.status)
                              )}
                            >
                              {submission.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              console.log('Navigating to submission:', submission.id, 'Type:', typeof submission.id);
                              router.push(`/admin/submissions/${submission.id}`);
                            }}
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
        </TabsContent>
        
        <TabsContent value="facebook" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by quest title, user name, or username..."
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
              <CardTitle>Facebook Submissions ({filteredSubmissions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quest</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="font-medium">{submission.questTitle}</div>
                          <div className="text-xs text-muted-foreground font-mono">#{submission.questId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-medium">{submission.user?.name || 'Unknown User'}</div>
                              <div className="text-xs text-muted-foreground">@{submission.user?.username || submission.user?.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {submission.content?.type === 'text' && (
                              <p className="text-sm truncate">{submission.content.text}</p>
                            )}
                            {submission.content?.type === 'url' && (
                              <a 
                                href={submission.content.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm truncate block"
                              >
                                {submission.content.url}
                              </a>
                            )}
                            {submission.content?.type === 'account-id' && (
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {submission.content.accountId}
                              </code>
                            )}
                            {submission.content?.type === 'transaction-id' && (
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {submission.content.transactionId}
                              </code>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
                                "text-xs",
                                getStatusColor(submission.status)
                              )}
                            >
                              {submission.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              console.log('Navigating to submission:', submission.id, 'Type:', typeof submission.id);
                              router.push(`/admin/submissions/${submission.id}`);
                            }}
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
        </TabsContent>
        
        <TabsContent value="discord" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by quest title, user name, or username..."
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
              <CardTitle>Discord Submissions ({filteredSubmissions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quest</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="font-medium">{submission.questTitle}</div>
                          <div className="text-xs text-muted-foreground font-mono">#{submission.questId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-medium">{submission.user?.name || 'Unknown User'}</div>
                              <div className="text-xs text-muted-foreground">@{submission.user?.username || submission.user?.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {submission.content?.type === 'text' && (
                              <p className="text-sm truncate">{submission.content.text}</p>
                            )}
                            {submission.content?.type === 'url' && (
                              <a 
                                href={submission.content.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm truncate block"
                              >
                                {submission.content.url}
                              </a>
                            )}
                            {submission.content?.type === 'account-id' && (
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {submission.content.accountId}
                              </code>
                            )}
                            {submission.content?.type === 'transaction-id' && (
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {submission.content.transactionId}
                              </code>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
                                "text-xs",
                                getStatusColor(submission.status)
                              )}
                            >
                              {submission.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              console.log('Navigating to submission:', submission.id, 'Type:', typeof submission.id);
                              router.push(`/admin/submissions/${submission.id}`);
                            }}
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
        </TabsContent>
        
        <TabsContent value="others" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by quest title, user name, or username..."
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
              <CardTitle>Other Platform Submissions ({filteredSubmissions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quest</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="font-medium">{submission.questTitle}</div>
                          <div className="text-xs text-muted-foreground font-mono">#{submission.questId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-medium">{submission.user?.name || 'Unknown User'}</div>
                              <div className="text-xs text-muted-foreground">@{submission.user?.username || submission.user?.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {submission.content?.type === 'text' && (
                              <p className="text-sm truncate">{submission.content.text}</p>
                            )}
                            {submission.content?.type === 'url' && (
                              <a 
                                href={submission.content.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm truncate block"
                              >
                                {submission.content.url}
                              </a>
                            )}
                            {submission.content?.type === 'account-id' && (
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {submission.content.accountId}
                              </code>
                            )}
                            {submission.content?.type === 'transaction-id' && (
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {submission.content.transactionId}
                              </code>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
                                "text-xs",
                                getStatusColor(submission.status)
                              )}
                            >
                              {submission.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              console.log('Navigating to submission:', submission.id, 'Type:', typeof submission.id);
                              router.push(`/admin/submissions/${submission.id}`);
                            }}
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
        </TabsContent>
      </Tabs>

    </div>
  );
}