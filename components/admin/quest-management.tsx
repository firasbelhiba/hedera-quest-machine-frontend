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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Compass,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  Star,
  Clock,
  Users,
  Trophy,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Quest } from '@/lib/types';

interface QuestManagementProps {
  className?: string;
}

// Mock data - replace with actual API calls
const mockQuests: Quest[] = [
  {
    id: '1',
    title: 'Smart Contract Basics',
    description: 'Learn the fundamentals of Hedera smart contracts',
    category: 'smart-contracts',
    difficulty: 'beginner',
    points: 100,
    estimatedTime: 30,
    status: 'published',
    completions: 245,
    rating: 4.8,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Token Creation Workshop',
    description: 'Create and deploy your first HTS token',
    category: 'tokens',
    difficulty: 'intermediate',
    points: 250,
    estimatedTime: 60,
    status: 'published',
    completions: 128,
    rating: 4.6,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-12'
  },
  {
    id: '3',
    title: 'Advanced DeFi Protocols',
    description: 'Build complex DeFi applications on Hedera',
    category: 'defi',
    difficulty: 'advanced',
    points: 500,
    estimatedTime: 120,
    status: 'draft',
    completions: 0,
    rating: 0,
    createdAt: '2024-01-18',
    updatedAt: '2024-01-19'
  },
  {
    id: '4',
    title: 'NFT Marketplace Development',
    description: 'Create a full-featured NFT marketplace',
    category: 'nfts',
    difficulty: 'advanced',
    points: 400,
    estimatedTime: 90,
    status: 'archived',
    completions: 67,
    rating: 4.2,
    createdAt: '2023-12-20',
    updatedAt: '2024-01-08'
  }
];

export function QuestManagement({ className }: QuestManagementProps) {
  const [quests, setQuests] = useState<Quest[]>(mockQuests);
  const [filteredQuests, setFilteredQuests] = useState<Quest[]>(mockQuests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    let filtered = quests;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(quest => 
        quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(quest => quest.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(quest => quest.category === categoryFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(quest => quest.difficulty === difficultyFilter);
    }

    setFilteredQuests(filtered);
  }, [quests, searchTerm, statusFilter, categoryFilter, difficultyFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-mono"><CheckCircle className="w-3 h-3 mr-1" />PUBLISHED</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-mono"><AlertCircle className="w-3 h-3 mr-1" />DRAFT</Badge>;
      case 'archived':
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20 font-mono"><XCircle className="w-3 h-3 mr-1" />ARCHIVED</Badge>;
      default:
        return <Badge variant="outline" className="font-mono">{status.toUpperCase()}</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-mono">BEGINNER</Badge>;
      case 'intermediate':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-mono">INTERMEDIATE</Badge>;
      case 'advanced':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-mono">ADVANCED</Badge>;
      default:
        return <Badge variant="outline" className="font-mono">{difficulty.toUpperCase()}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors: Record<string, string> = {
      'smart-contracts': 'purple',
      'tokens': 'blue',
      'nfts': 'pink',
      'defi': 'cyan',
      'consensus': 'orange',
      'mirror-node': 'indigo'
    };
    
    const color = categoryColors[category] || 'gray';
    return (
      <Badge className={`bg-${color}-500/10 text-${color}-500 border-${color}-500/20 font-mono`}>
        {category.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  const handleQuestAction = (questId: string, action: string) => {
    setQuests(prev => prev.map(quest => {
      if (quest.id === questId) {
        switch (action) {
          case 'publish':
            return { ...quest, status: 'published' };
          case 'draft':
            return { ...quest, status: 'draft' };
          case 'archive':
            return { ...quest, status: 'archived' };
          default:
            return quest;
        }
      }
      return quest;
    }));
  };

  const handleDeleteQuest = (questId: string) => {
    setQuests(prev => prev.filter(quest => quest.id !== questId));
  };

  return (
    <div className={className}>
      <Card className="border-2 border-dashed border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
        <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
          <CardTitle className="flex items-center gap-2 font-mono">
            <div className="p-1 bg-cyan-500/20 rounded border border-dashed border-cyan-500/40">
              <Compass className="w-4 h-4 text-cyan-500" />
            </div>
            🎯 QUEST_MANAGEMENT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="[SEARCH_QUESTS]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-mono border-dashed border-cyan-500/30 focus:border-solid"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 font-mono border-dashed border-cyan-500/30">
                <SelectValue placeholder="[STATUS]" />
              </SelectTrigger>
              <SelectContent className="font-mono">
                <SelectItem value="all">[ALL_STATUS]</SelectItem>
                <SelectItem value="published">[PUBLISHED]</SelectItem>
                <SelectItem value="draft">[DRAFT]</SelectItem>
                <SelectItem value="archived">[ARCHIVED]</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 font-mono border-dashed border-cyan-500/30">
                <SelectValue placeholder="[CATEGORY]" />
              </SelectTrigger>
              <SelectContent className="font-mono">
                <SelectItem value="all">[ALL_CATEGORIES]</SelectItem>
                <SelectItem value="smart-contracts">[SMART_CONTRACTS]</SelectItem>
                <SelectItem value="tokens">[TOKENS]</SelectItem>
                <SelectItem value="nfts">[NFTS]</SelectItem>
                <SelectItem value="defi">[DEFI]</SelectItem>
                <SelectItem value="consensus">[CONSENSUS]</SelectItem>
                <SelectItem value="mirror-node">[MIRROR_NODE]</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-44 font-mono border-dashed border-cyan-500/30">
                <SelectValue placeholder="[DIFFICULTY]" />
              </SelectTrigger>
              <SelectContent className="font-mono">
                <SelectItem value="all">[ALL_LEVELS]</SelectItem>
                <SelectItem value="beginner">[BEGINNER]</SelectItem>
                <SelectItem value="intermediate">[INTERMEDIATE]</SelectItem>
                <SelectItem value="advanced">[ADVANCED]</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="font-mono border-2 border-dashed border-green-500/50 hover:border-solid bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              [CREATE_QUEST]
            </Button>
          </div>

          {/* Quests Table */}
          <div className="border-2 border-dashed border-cyan-500/20 rounded-lg overflow-hidden bg-gradient-to-br from-white/50 to-cyan-50/30 dark:from-gray-900/50 dark:to-cyan-900/10">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b-2 border-dashed border-cyan-500/30">
                  <TableHead className="font-mono font-semibold text-cyan-700 dark:text-cyan-300 py-4">[QUEST]</TableHead>
                  <TableHead className="font-mono font-semibold text-cyan-700 dark:text-cyan-300 py-4">[CATEGORY]</TableHead>
                  <TableHead className="font-mono font-semibold text-cyan-700 dark:text-cyan-300 py-4">[DIFFICULTY]</TableHead>
                  <TableHead className="font-mono font-semibold text-cyan-700 dark:text-cyan-300 py-4">[STATUS]</TableHead>
                  <TableHead className="font-mono font-semibold text-cyan-700 dark:text-cyan-300 py-4">[STATS]</TableHead>
                  <TableHead className="font-mono font-semibold text-cyan-700 dark:text-cyan-300 py-4">[UPDATED]</TableHead>
                  <TableHead className="font-mono font-semibold text-cyan-700 dark:text-cyan-300 py-4 text-center">[ACTIONS]</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuests.map((quest) => (
                  <TableRow key={quest.id} className="border-b border-dashed border-cyan-500/10 hover:bg-gradient-to-r hover:from-cyan-500/8 hover:to-blue-500/8 transition-all duration-200 group">
                    <TableCell className="py-4">
                      <div className="min-w-0">
                        <div className="font-semibold font-mono text-gray-900 dark:text-gray-100 mb-1">{quest.title}</div>
                        <div className="text-sm text-muted-foreground font-mono line-clamp-2 max-w-sm">
                          {quest.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">{getCategoryBadge(quest.category)}</TableCell>
                    <TableCell className="py-4">{getDifficultyBadge(quest.difficulty)}</TableCell>
                    <TableCell className="py-4">{getStatusBadge(quest.status)}</TableCell>
                    <TableCell className="py-4">
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded border border-dashed border-yellow-300/50">
                          <Trophy className="w-3 h-3 text-yellow-600" />
                          <span className="font-semibold">{quest.points}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border border-dashed border-blue-300/50">
                          <Users className="w-3 h-3 text-blue-600" />
                          <span className="font-semibold">{quest.completions}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded border border-dashed border-purple-300/50">
                          <Star className="w-3 h-3 text-purple-600" />
                          <span className="font-semibold">{quest.rating}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded border border-dashed border-green-300/50">
                          <Clock className="w-3 h-3 text-green-600" />
                          <span className="font-semibold">{quest.estimatedTime}m</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm py-4 text-muted-foreground">{quest.updatedAt}</TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedQuest(quest);
                            setIsEditDialogOpen(true);
                          }}
                          className="h-8 px-3 border border-dashed border-blue-500/30 hover:border-solid hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 hover:text-blue-700 transition-all duration-200"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 border border-dashed border-cyan-500/30 hover:border-solid hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all duration-200">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="font-mono border-2 border-dashed border-cyan-500/30">
                            <DropdownMenuLabel>[ACTIONS]</DropdownMenuLabel>
                            <DropdownMenuSeparator className="border-dashed border-cyan-500/20" />
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              [VIEW]
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedQuest(quest);
                              setIsEditDialogOpen(true);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              [EDIT]
                            </DropdownMenuItem>
                            {quest.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handleQuestAction(quest.id, 'publish')} className="text-green-600">
                                <Play className="mr-2 h-4 w-4" />
                                [PUBLISH]
                              </DropdownMenuItem>
                            )}
                            {quest.status === 'published' && (
                              <DropdownMenuItem onClick={() => handleQuestAction(quest.id, 'draft')} className="text-yellow-600">
                                <Pause className="mr-2 h-4 w-4" />
                                [UNPUBLISH]
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleQuestAction(quest.id, 'archive')} className="text-orange-600">
                              <XCircle className="mr-2 h-4 w-4" />
                              [ARCHIVE]
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="border-dashed border-cyan-500/20" />
                            <DropdownMenuItem onClick={() => handleDeleteQuest(quest.id)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              [DELETE]
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4 rounded-lg border border-dashed border-blue-500/20">
              <div className="text-2xl font-bold font-mono text-blue-500">{quests.length}</div>
              <div className="text-sm text-muted-foreground font-mono">TOTAL_QUESTS</div>
            </div>
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4 rounded-lg border border-dashed border-green-500/20">
              <div className="text-2xl font-bold font-mono text-green-500">{quests.filter(q => q.status === 'published').length}</div>
              <div className="text-sm text-muted-foreground font-mono">PUBLISHED</div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 rounded-lg border border-dashed border-yellow-500/20">
              <div className="text-2xl font-bold font-mono text-yellow-500">{quests.filter(q => q.status === 'draft').length}</div>
              <div className="text-sm text-muted-foreground font-mono">DRAFTS</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-lg border border-dashed border-purple-500/20">
              <div className="text-2xl font-bold font-mono text-purple-500">{quests.reduce((sum, q) => sum + q.completions, 0)}</div>
              <div className="text-sm text-muted-foreground font-mono">COMPLETIONS</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Quest Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl font-mono border-2 border-dashed border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              [CREATE_NEW_QUEST]
            </DialogTitle>
            <DialogDescription>
              Create a new quest for users to complete.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium font-mono">[TITLE]</label>
              <Input placeholder="Quest title" className="font-mono border-dashed" />
            </div>
            <div>
              <label className="text-sm font-medium font-mono">[DESCRIPTION]</label>
              <Textarea placeholder="Quest description" className="font-mono border-dashed" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium font-mono">[CATEGORY]</label>
                <Select>
                  <SelectTrigger className="font-mono border-dashed">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="font-mono">
                    <SelectItem value="smart-contracts">[SMART_CONTRACTS]</SelectItem>
                    <SelectItem value="tokens">[TOKENS]</SelectItem>
                    <SelectItem value="nfts">[NFTS]</SelectItem>
                    <SelectItem value="defi">[DEFI]</SelectItem>
                    <SelectItem value="consensus">[CONSENSUS]</SelectItem>
                    <SelectItem value="mirror-node">[MIRROR_NODE]</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium font-mono">[DIFFICULTY]</label>
                <Select>
                  <SelectTrigger className="font-mono border-dashed">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent className="font-mono">
                    <SelectItem value="beginner">[BEGINNER]</SelectItem>
                    <SelectItem value="intermediate">[INTERMEDIATE]</SelectItem>
                    <SelectItem value="advanced">[ADVANCED]</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium font-mono">[POINTS]</label>
                <Input type="number" placeholder="100" className="font-mono border-dashed" />
              </div>
              <div>
                <label className="text-sm font-medium font-mono">[ESTIMATED_TIME] (minutes)</label>
                <Input type="number" placeholder="30" className="font-mono border-dashed" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="font-mono border-dashed">
              [CANCEL]
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(false)} className="font-mono bg-gradient-to-r from-cyan-500 to-blue-500">
              [CREATE_QUEST]
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Quest Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl font-mono border-2 border-dashed border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              [EDIT_QUEST]
            </DialogTitle>
            <DialogDescription>
              Modify quest details and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedQuest && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium font-mono">[TITLE]</label>
                <Input defaultValue={selectedQuest.title} className="font-mono border-dashed" />
              </div>
              <div>
                <label className="text-sm font-medium font-mono">[DESCRIPTION]</label>
                <Textarea defaultValue={selectedQuest.description} className="font-mono border-dashed" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium font-mono">[CATEGORY]</label>
                  <Select defaultValue={selectedQuest.category}>
                    <SelectTrigger className="font-mono border-dashed">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="font-mono">
                      <SelectItem value="smart-contracts">[SMART_CONTRACTS]</SelectItem>
                      <SelectItem value="tokens">[TOKENS]</SelectItem>
                      <SelectItem value="nfts">[NFTS]</SelectItem>
                      <SelectItem value="defi">[DEFI]</SelectItem>
                      <SelectItem value="consensus">[CONSENSUS]</SelectItem>
                      <SelectItem value="mirror-node">[MIRROR_NODE]</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium font-mono">[DIFFICULTY]</label>
                  <Select defaultValue={selectedQuest.difficulty}>
                    <SelectTrigger className="font-mono border-dashed">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="font-mono">
                      <SelectItem value="beginner">[BEGINNER]</SelectItem>
                      <SelectItem value="intermediate">[INTERMEDIATE]</SelectItem>
                      <SelectItem value="advanced">[ADVANCED]</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium font-mono">[POINTS]</label>
                  <Input type="number" defaultValue={selectedQuest.points} className="font-mono border-dashed" />
                </div>
                <div>
                  <label className="text-sm font-medium font-mono">[ESTIMATED_TIME] (minutes)</label>
                  <Input type="number" defaultValue={selectedQuest.estimatedTime} className="font-mono border-dashed" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="font-mono border-dashed">
              [CANCEL]
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)} className="font-mono bg-gradient-to-r from-cyan-500 to-blue-500">
              [SAVE_CHANGES]
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default QuestManagement;