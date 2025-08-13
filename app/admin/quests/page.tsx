'use client';

import { useState, useEffect } from 'react';
import { Quest, User } from '@/lib/types';
import { QuestService } from '@/lib/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  Users,
  Clock,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ManageQuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [filteredQuests, setFilteredQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadQuests();
  }, []);

  useEffect(() => {
    filterQuests();
  }, [quests, searchTerm, selectedCategory, selectedDifficulty]);

  const loadQuests = async () => {
    setIsLoading(true);
    try {
      const data = await QuestService.getQuests();
      setQuests(data);
    } catch (error) {
      console.error('Failed to load quests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterQuests = () => {
    let filtered = [...quests];

    if (searchTerm) {
      filtered = filtered.filter(quest =>
        quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(quest => quest.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(quest => quest.difficulty === selectedDifficulty);
    }

    setFilteredQuests(filtered);
  };

  const handleDeleteQuest = async (questId: string) => {
    if (confirm('Are you sure you want to delete this quest?')) {
      try {
        await QuestService.deleteQuest(questId);
        loadQuests();
      } catch (error) {
        console.error('Failed to delete quest:', error);
      }
    }
  };

  const toggleQuestStatus = async (quest: Quest) => {
    try {
      await QuestService.updateQuest(quest.id, { isActive: !quest.isActive });
      loadQuests();
    } catch (error) {
      console.error('Failed to update quest status:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'expert': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'getting-started': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'defi': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'nfts': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'development': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      'consensus': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'smart-contracts': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      'token-service': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      'file-service': 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Quests</h1>
          <p className="text-muted-foreground">Create, edit, and manage learning quests</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Quest
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Quests</p>
                <p className="text-2xl font-bold">{quests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{quests.filter(q => q.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Completions</p>
                <p className="text-2xl font-bold">{quests.reduce((sum, q) => sum + q.completions, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Time</p>
                <p className="text-2xl font-bold">2.5h</p>
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
                placeholder="Search quests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Categories</option>
              <option value="getting-started">Getting Started</option>
              <option value="defi">DeFi</option>
              <option value="nfts">NFTs</option>
              <option value="development">Development</option>
              <option value="consensus">Consensus</option>
              <option value="smart-contracts">Smart Contracts</option>
              <option value="token-service">Token Service</option>
              <option value="file-service">File Service</option>
            </select>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Quests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quests ({filteredQuests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quest</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Completions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuests.map((quest) => (
                  <TableRow key={quest.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{quest.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {quest.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', getCategoryColor(quest.category))} variant="outline">
                        {quest.category.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', getDifficultyColor(quest.difficulty))} variant="outline">
                        {quest.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>{quest.points}</TableCell>
                    <TableCell>{quest.completions}</TableCell>
                    <TableCell>
                      <Badge variant={quest.isActive ? "default" : "secondary"}>
                        {quest.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedQuest(quest)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Quest
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleQuestStatus(quest)}>
                            <Trophy className="w-4 h-4 mr-2" />
                            {quest.isActive ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteQuest(quest.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Quest
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quest Details Dialog */}
      {selectedQuest && (
        <Dialog open={!!selectedQuest} onOpenChange={() => setSelectedQuest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedQuest.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedQuest.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>Category: <Badge className={getCategoryColor(selectedQuest.category)} variant="outline">{selectedQuest.category}</Badge></div>
                    <div>Difficulty: <Badge className={getDifficultyColor(selectedQuest.difficulty)} variant="outline">{selectedQuest.difficulty}</Badge></div>
                    <div>Points: {selectedQuest.points}</div>
                    <div>Estimated Time: {selectedQuest.estimatedTime}</div>
                    <div>Completions: {selectedQuest.completions}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <ul className="text-sm space-y-1">
                    {selectedQuest.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Submission Instructions</h4>
                <p className="text-sm text-muted-foreground">{selectedQuest.submissionInstructions}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Quest Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Quest</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Quest creation form would be implemented here</p>
            <Button onClick={() => setShowCreateDialog(false)} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}