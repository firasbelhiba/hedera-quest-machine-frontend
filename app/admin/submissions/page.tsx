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
  Globe
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
  const [filteredQuests, setFilteredQuests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activePlatform, setActivePlatform] = useState<'twitter'|'facebook'|'discord'|'others'>('twitter');

  useEffect(() => {
    loadQuests();
  }, []);

  useEffect(() => {
    filterQuests();
  }, [questsWithCompletions, searchTerm, statusFilter, activePlatform]);

  const loadQuests = async () => {
    setIsLoading(true);
    try {
      const response = await QuestService.getQuestCompletions();
      const questsData = response.quests || [];
      setQuestsWithCompletions(questsData);
    } catch (error) {
      console.error('Failed to load quests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterQuests = () => {
    let filtered = [...questsWithCompletions];

    if (searchTerm) {
      filtered = filtered.filter(quest =>
        quest.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(quest => 
        quest.completions.some((completion: any) => completion.status === statusFilter)
      );
    }

    filtered = filtered.filter(
      (quest) => {
        const platformType = (quest.platform_type ?? '').toLowerCase();
        if (activePlatform === 'others') {
          return platformType && !['twitter', 'facebook', 'discord'].includes(platformType);
        }
        return platformType === activePlatform;
      }
    );

    // Sort by quest creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime());

    setFilteredQuests(filtered);
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
      <div className="p-6 bg-gray-900 border border-gray-700 rounded-lg">
        <h1 className="text-3xl font-bold text-white">Review Submissions</h1>
        <p className="text-gray-400 text-sm mt-1">Review and approve user quest submissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="text-xs text-white">Total Quests</p>
                <p className="text-2xl font-bold text-white">{questsWithCompletions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <div>
                <p className="text-xs text-white">Pending Review</p>
                <p className="text-2xl font-bold text-white">{questsWithCompletions.reduce((acc, quest) => acc + quest.completions.filter((c: any) => c.status === 'pending').length, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-xs text-white">Approved</p>
                <p className="text-2xl font-bold text-white">{questsWithCompletions.reduce((acc, quest) => acc + quest.completions.filter((c: any) => c.status === 'approved').length, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              <div>
                <p className="text-xs text-white">Needs Review</p>
                <p className="text-2xl font-bold text-white">{questsWithCompletions.reduce((acc, quest) => acc + quest.completions.filter((c: any) => c.status === 'needs-revision').length, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Tabs */}
      <Tabs value={activePlatform} onValueChange={(value) => setActivePlatform(value as 'twitter'|'facebook'|'discord'|'others')} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900 border border-gray-700">
          <TabsTrigger value="twitter" className="data-[state=active]:bg-gray-800 data-[state=active]:text-green-400 text-gray-400">Twitter</TabsTrigger>
          <TabsTrigger value="facebook" className="data-[state=active]:bg-gray-800 data-[state=active]:text-green-400 text-gray-400">Facebook</TabsTrigger>
          <TabsTrigger value="discord" className="data-[state=active]:bg-gray-800 data-[state=active]:text-green-400 text-gray-400">Discord</TabsTrigger>
          <TabsTrigger value="others" className="data-[state=active]:bg-gray-800 data-[state=active]:text-green-400 text-gray-400">Others</TabsTrigger>
        </TabsList>
        

        
        <TabsContent value="twitter" className="space-y-6">
          {/* Filters */}
          <Card className="bg-gray-900 border border-gray-700">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search quests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border border-gray-600 text-green-400 placeholder:text-gray-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-green-400"
                >
                  <option value="all" className="bg-gray-800 text-gray-400">All Status</option>
                  <option value="pending" className="bg-gray-800 text-gray-400">Pending</option>
                  <option value="approved" className="bg-gray-800 text-gray-400">Approved</option>
                  <option value="rejected" className="bg-gray-800 text-gray-400">Rejected</option>
                  <option value="needs-revision" className="bg-gray-800 text-gray-400">Needs Revision</option>
                </select>
              </div>
            </CardContent>
          </Card>



          {/* Quests Table */}
          <Card className="bg-gray-900 border border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Twitter Quests ({filteredQuests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-700">
                      <TableHead className="text-gray-400">Quest</TableHead>
                      <TableHead className="text-gray-400">Description</TableHead>
                      <TableHead className="text-gray-400">Submissions</TableHead>
                      <TableHead className="text-gray-400">Pending</TableHead>
                      <TableHead className="text-gray-400">Approved</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuests.map((quest) => (
                      <TableRow key={quest.id} className="border-b border-gray-700 hover:bg-gray-800">
                        <TableCell>
                          <div className="text-white">{quest.title}</div>
                          <div className="text-xs text-gray-400">#{quest.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-400">{quest.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-white font-medium">{quest.completions?.length || 0}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-yellow-400 font-medium">
                            {quest.completions?.filter(c => c.status === 'pending').length || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-green-400 font-medium">
                            {quest.completions?.filter(c => c.status === 'approved').length || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              router.push(`/admin/submissions/${quest.id}`);
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="facebook" className="space-y-6">
          {/* Filters */}
          <Card className="bg-gray-900 border border-gray-700">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search quests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border border-gray-600 text-green-400 placeholder:text-gray-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-green-400"
                >
                  <option value="all" className="bg-gray-800 text-gray-400">All Status</option>
                  <option value="pending" className="bg-gray-800 text-gray-400">Pending</option>
                  <option value="approved" className="bg-gray-800 text-gray-400">Approved</option>
                  <option value="rejected" className="bg-gray-800 text-gray-400">Rejected</option>
                  <option value="needs-revision" className="bg-gray-800 text-gray-400">Needs Revision</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Submissions Table */}
          <Card className="bg-gray-900 border border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Facebook Quests ({filteredQuests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-700">
                      <TableHead className="text-gray-400">Quest</TableHead>
                      <TableHead className="text-gray-400">User</TableHead>
                      <TableHead className="text-gray-400">Content</TableHead>
                      <TableHead className="text-gray-400">Submitted</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuests.map((quest) => (
                      <TableRow key={quest.id} className="border-b border-gray-700 hover:bg-gray-800">
                        <TableCell>
                          <div className="text-white">{quest.title}</div>
                          <div className="text-xs text-gray-400">#{quest.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-400">{quest.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-white font-medium">{quest.completions?.length || 0}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-yellow-400 font-medium">
                            {quest.completions?.filter(c => c.status === 'pending').length || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-green-400 font-medium">
                            {quest.completions?.filter(c => c.status === 'approved').length || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              router.push(`/admin/submissions/${quest.id}`);
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="discord" className="space-y-6">
          {/* Filters */}
          <Card className="bg-gray-900 border border-gray-700">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search submissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border border-gray-600 text-green-400 placeholder:text-gray-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-green-400"
                >
                  <option value="all" className="bg-gray-800 text-gray-400">All Status</option>
                  <option value="pending" className="bg-gray-800 text-gray-400">Pending</option>
                  <option value="approved" className="bg-gray-800 text-gray-400">Approved</option>
                  <option value="rejected" className="bg-gray-800 text-gray-400">Rejected</option>
                  <option value="needs-revision" className="bg-gray-800 text-gray-400">Needs Revision</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Submissions Table */}
          <Card className="bg-gray-900 border border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Discord Quests ({filteredQuests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-700">
                      <TableHead className="text-gray-400">Quest</TableHead>
                      <TableHead className="text-gray-400">User</TableHead>
                      <TableHead className="text-gray-400">Content</TableHead>
                      <TableHead className="text-gray-400">Submitted</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuests.map((quest) => (
                      <TableRow key={quest.id} className="border-b border-gray-700 hover:bg-gray-800">
                        <TableCell>
                          <div className="text-white">{quest.title}</div>
                          <div className="text-xs text-gray-400">#{quest.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-400">{quest.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-white font-medium">{quest.completions?.length || 0}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-yellow-400 font-medium">
                            {quest.completions?.filter(c => c.status === 'pending').length || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-green-400 font-medium">
                            {quest.completions?.filter(c => c.status === 'approved').length || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              router.push(`/admin/submissions/${quest.id}`);
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="others" className="space-y-6">
          {/* Filters */}
          <Card className="bg-gray-900 border border-gray-700">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search quests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white"
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
          <Card className="bg-gray-900 border border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Other Platform Quests ({filteredQuests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-700">
                      <TableHead className="text-gray-400">Quest</TableHead>
                      <TableHead className="text-gray-400">User</TableHead>
                      <TableHead className="text-gray-400">Content</TableHead>
                      <TableHead className="text-gray-400">Submitted</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {filteredQuests.map((quest) => (
                      <TableRow key={quest.id} className="border-b border-gray-700 hover:bg-gray-800">
                        <TableCell>
                          <div className="font-medium text-white">{quest.title}</div>
                          <div className="text-xs text-gray-400">#{quest.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-400">{quest.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-white font-medium">{quest.completions?.length || 0}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-yellow-400 font-medium">
                            {quest.completions?.filter(c => c.status === 'pending').length || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-green-400 font-medium">
                            {quest.completions?.filter(c => c.status === 'approved').length || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-gray-800 border border-gray-600 text-white hover:bg-gray-700"
                            onClick={() => {
                              router.push(`/admin/submissions/${quest.id}`);
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