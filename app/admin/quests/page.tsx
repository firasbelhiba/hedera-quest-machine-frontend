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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { CreateQuestForm } from '@/components/admin/create-quest-form';
import { EditQuestForm } from '@/components/admin/edit-quest-form';
import { useToast } from '@/hooks/use-toast';

export default function ManageQuestsPage() {
  const { toast } = useToast();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [filteredQuests, setFilteredQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [selectedQuestDetails, setSelectedQuestDetails] = useState<Quest | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [questToEdit, setQuestToEdit] = useState<Quest | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [questToDelete, setQuestToDelete] = useState<Quest | null>(null);

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

  const handleDeleteQuest = (quest: Quest) => {
    setQuestToDelete(quest);
    setShowDeleteDialog(true);
  };

  const confirmDeleteQuest = async () => {
    if (!questToDelete) return;
    
    try {
      const result = await QuestService.deleteQuest(String(questToDelete.id));
      toast({
        title: "Quest Deleted",
        description: result.message || "The quest has been successfully deleted.",
      });
      loadQuests();
    } catch (error) {
      console.error('Failed to delete quest:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete the quest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setQuestToDelete(null);
    }
  };

  const activateQuest = async (quest: Quest) => {
    try {
      await QuestService.activateQuest(String(quest.id));
      loadQuests();
      toast({
        title: "Quest Activated",
        description: `"${quest.title}" has been successfully activated.`,
      });
    } catch (error) {
      console.error('Failed to activate quest:', error);
      toast({
        title: "Activation Failed",
        description: "Failed to activate the quest. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewQuestDetails = async (quest: Quest) => {
    setSelectedQuest(quest);
    setIsLoadingDetails(true);
    setSelectedQuestDetails(null);
    
    try {
      console.log('Fetching quest details for ID:', quest.id);
      const questDetails = await QuestService.getQuest(String(quest.id));
      console.log('Quest details response:', questDetails);
      setSelectedQuestDetails(questDetails);
    } catch (error) {
      console.error('Failed to load quest details:', error);
      // Fallback to the quest data from the list
      setSelectedQuestDetails(quest);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleEditQuest = (quest: Quest) => {
    setQuestToEdit(quest);
    setShowEditDialog(true);
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setQuestToEdit(null);
    loadQuests(); // Reload the quests list
    toast({
      title: "Quest Updated",
      description: "The quest has been successfully updated.",
    });
  };

  const handleEditCancel = () => {
    setShowEditDialog(false);
    setQuestToEdit(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-gray-800 border border-green-400 text-green-400';
      case 'intermediate': return 'bg-gray-800 border border-yellow-400 text-yellow-400';
      case 'advanced': return 'bg-gray-800 border border-orange-400 text-orange-400';
      case 'expert': return 'bg-gray-800 border border-red-400 text-red-400';
      default: return 'bg-gray-800 border border-gray-400 text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'getting-started': 'bg-gray-800 border border-blue-400 text-blue-400',
      'defi': 'bg-gray-800 border border-purple-400 text-purple-400',
      'nfts': 'bg-gray-800 border border-pink-400 text-pink-400',
      'development': 'bg-gray-800 border border-cyan-400 text-cyan-400',
      'consensus': 'bg-gray-800 border border-indigo-400 text-indigo-400',
      'smart-contracts': 'bg-gray-800 border border-emerald-400 text-emerald-400',
      'token-service': 'bg-gray-800 border border-amber-400 text-amber-400',
      'file-service': 'bg-gray-800 border border-slate-400 text-slate-400',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-800 border border-gray-400 text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p className="ml-3 text-gray-400">Loading quests...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="p-6 bg-gray-900 border border-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Quests</h1>
            <p className="text-gray-400 text-sm mt-1">Create, edit, and manage learning quests</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2 bg-gray-800 border border-gray-600 text-white hover:bg-gray-700">
            <Plus className="w-4 h-4" />
            Create Quest
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Quests</p>
                <p className="text-2xl font-bold text-white">{quests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Active</p>
                <p className="text-2xl font-bold text-white">{quests.filter(q => q.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Completions</p>
                <p className="text-2xl font-bold text-white">{quests.reduce((sum, q) => sum + (q.completions || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">Avg Time</p>
                <p className="text-2xl font-bold text-white">2.5h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                className="pl-10 bg-gray-800 border border-gray-600 text-white placeholder:text-gray-400"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md"
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
              className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md"
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
      <Card className="bg-gray-900 border border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 border border-gray-600 rounded-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">Quest Management</CardTitle>
                <p className="text-sm text-gray-400 mt-1">
                  {filteredQuests.length} quest{filteredQuests.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            <Badge className="bg-gray-800 border border-gray-600 text-white">
              Total: {filteredQuests.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-700 bg-gray-800">
                  <TableHead className="font-semibold text-white py-4 px-6">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Quest Details
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-white py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Category
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-white py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Difficulty
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-white py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Rewards
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-white py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Participants
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-white py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Status
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-white py-4 px-4 text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuests.map((quest, index) => (
                  <TableRow 
                    key={quest.id} 
                    className={cn(
                      "hover:bg-gray-800/50 transition-colors border-b border-gray-700",
                      index % 2 === 0 ? "bg-gray-900" : "bg-gray-800/20"
                    )}
                  >
                    <TableCell className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-800 border border-gray-600 flex-shrink-0 mt-1">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-white mb-1 line-clamp-1">
                            {quest.title}
                          </div>
                          <div className="text-sm text-gray-400 line-clamp-2 max-w-md">
                            {quest.description}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs bg-gray-800 border border-gray-600 text-gray-400">
                              ID: {quest.id}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <Badge 
                        className={cn('text-xs font-medium bg-gray-800 border border-gray-600', getCategoryColor(quest.category || 'general'))} 
                        variant="outline"
                      >
                        {quest.category ? quest.category.replace('-', ' ') : 'No Category'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <Badge 
                        className={cn('text-xs font-medium bg-gray-800 border border-gray-600', getDifficultyColor(quest.difficulty))} 
                        variant="outline"
                      >
                        {quest.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-white" />
                        <span className="font-medium text-white">
                          {quest.points || quest.reward || '0'} pts
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-white" />
                        <span className="font-medium text-white">
                          {quest.completions || quest.currentParticipants || '0'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          (quest.isActive || quest.status === 'active') 
                            ? "bg-green-400 animate-pulse" 
                            : "bg-gray-600"
                        )} />
                        <Badge 
                          variant="outline"
                          className={cn(
                            "font-medium bg-gray-800 border border-gray-600",
                            (quest.isActive || quest.status === 'active') ? "text-green-400" : "text-gray-400"
                          )}
                        >
                          {(quest.isActive || quest.status === 'active') ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 bg-gray-800 border border-gray-600 hover:bg-gray-700 transition-colors text-white"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-black border border-dashed border-gray-600">
                            <DropdownMenuItem 
                              onClick={() => handleViewQuestDetails(quest)}
                              className="cursor-pointer font-mono text-green-400 hover:bg-gray-900 focus:bg-gray-900"
                            >
                              <Eye className="w-4 h-4 mr-2 text-green-400" />
                              [View Details]
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEditQuest(quest)}
                              className="cursor-pointer font-mono text-green-400 hover:bg-gray-900 focus:bg-gray-900"
                            >
                              <Edit className="w-4 h-4 mr-2 text-green-400" />
                              [Edit Quest]
                            </DropdownMenuItem>
                            {!(quest.isActive || quest.status === 'active') && (
                              <DropdownMenuItem 
                                onClick={() => activateQuest(quest)}
                                className="cursor-pointer font-mono text-green-400 hover:bg-gray-900 focus:bg-gray-900"
                              >
                                <Trophy className="w-4 h-4 mr-2 text-green-400" />
                                [Activate Quest]
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteQuest(quest)}
                              className="text-red-400 cursor-pointer hover:bg-gray-900 focus:bg-gray-900 font-mono"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              [Delete Quest]
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
        </CardContent>
      </Card>

      {/* Quest Details Dialog */}
      {selectedQuest && (
        <Dialog open={!!selectedQuest} onOpenChange={() => {
          setSelectedQuest(null);
          setSelectedQuestDetails(null);
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-black border border-dashed border-gray-600">
            <DialogHeader className="pb-4 border-b border-dashed border-gray-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-900 border border-dashed border-gray-600">
                  <Trophy className="h-5 w-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-xl font-mono text-green-400">[{selectedQuest.title}]</DialogTitle>
                  {selectedQuestDetails && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="bg-black border-dashed border-gray-600 font-mono text-green-400">
                        [{selectedQuestDetails.status}]
                      </Badge>
                      <Badge className={cn('bg-black border-dashed border-gray-600 font-mono', getDifficultyColor(selectedQuestDetails.difficulty))} variant="outline">
                        [{selectedQuestDetails.difficulty}]
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </DialogHeader>
            
            {isLoadingDetails ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
                <span className="ml-3 font-mono text-gray-400">[Loading quest details...]</span>
              </div>
            ) : selectedQuestDetails ? (
               <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-1">
                 {/* Description Card */}
                 <Card className="mb-6 bg-black border border-dashed border-gray-600">
                   <CardContent className="p-6">
                     <div className="flex items-center gap-2 mb-3">
                       <FileText className="h-4 w-4 text-green-400" />
                       <h3 className="font-semibold font-mono text-lg text-green-400">[Description]</h3>
                     </div>
                     <p className="font-mono text-gray-400 leading-relaxed">{selectedQuestDetails.description}</p>
                   </CardContent>
                 </Card>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                   {/* Quest Information Card */}
                   <Card className="bg-black border border-dashed border-gray-600">
                     <CardContent className="p-6">
                       <div className="flex items-center gap-2 mb-4">
                         <Trophy className="h-4 w-4 text-green-400" />
                         <h3 className="font-semibold font-mono text-lg text-green-400">[Quest Information]</h3>
                       </div>
                       <div className="space-y-3">
                         <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-600">
                           <span className="text-sm font-medium font-mono text-gray-400">Quest ID</span>
                           <span className="text-sm font-mono text-green-400">{selectedQuestDetails.id}</span>
                         </div>
                         <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-600">
                           <span className="text-sm font-medium font-mono text-gray-400">Reward</span>
                           <span className="text-sm font-semibold font-mono text-green-400">
                             {selectedQuestDetails.reward || selectedQuestDetails.points || 'N/A'}
                           </span>
                         </div>
                         <div className="flex items-center justify-between py-2">
                           <span className="text-sm font-medium font-mono text-gray-400">Category</span>
                           <span className="text-sm font-mono text-green-400 capitalize">{selectedQuestDetails.category || 'N/A'}</span>
                         </div>

                       </div>
                     </CardContent>
                   </Card>
                   
                   {/* Participation & Timeline Card */}
                   <Card className="bg-black border border-dashed border-gray-600">
                     <CardContent className="p-6">
                       <div className="flex items-center gap-2 mb-4">
                         <Users className="h-4 w-4 text-green-400" />
                         <h3 className="font-semibold font-mono text-lg text-green-400">[Participation & Timeline]</h3>
                       </div>
                       <div className="space-y-3">
                         <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-600">
                           <span className="text-sm font-medium font-mono text-gray-400">Current Participants</span>
                           <span className="text-sm font-semibold font-mono text-green-400">{selectedQuestDetails.currentParticipants || 0}</span>
                         </div>
                         <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-600">
                           <span className="text-sm font-medium font-mono text-gray-400">Max Participants</span>
                           <span className="text-sm font-mono text-green-400">{selectedQuestDetails.maxParticipants || 'Unlimited'}</span>
                         </div>
                         <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-600">
                           <span className="text-sm font-medium font-mono text-gray-400">Start Date</span>
                           <span className="text-sm font-mono text-green-400">{selectedQuestDetails.startDate ? new Date(selectedQuestDetails.startDate).toLocaleDateString() : 'N/A'}</span>
                         </div>
                         <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-600">
                           <span className="text-sm font-medium font-mono text-gray-400">End Date</span>
                           <span className="text-sm font-mono text-green-400">{selectedQuestDetails.endDate ? new Date(selectedQuestDetails.endDate).toLocaleDateString() : 'N/A'}</span>
                         </div>
                         <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-600">
                           <span className="text-sm font-medium font-mono text-gray-400">Created</span>
                           <span className="text-sm font-mono text-green-400">{selectedQuestDetails.created_at ? new Date(selectedQuestDetails.created_at).toLocaleDateString() : 'N/A'}</span>
                         </div>
                         <div className="flex items-center justify-between py-2">
                           <span className="text-sm font-medium font-mono text-gray-400">Last Updated</span>
                           <span className="text-sm font-mono text-green-400">{selectedQuestDetails.updated_at ? new Date(selectedQuestDetails.updated_at).toLocaleDateString() : 'N/A'}</span>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 </div>
                 
                 {selectedQuestDetails.creator && (
                   <Card className="mb-6 bg-black border border-dashed border-gray-600">
                     <CardContent className="p-6">
                       <div className="flex items-center gap-2 mb-4">
                         <Users className="h-4 w-4 text-green-400" />
                         <h3 className="font-semibold font-mono text-lg text-green-400">[Creator Information]</h3>
                       </div>
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-gray-900 border border-dashed border-gray-600 flex items-center justify-center">
                           <Users className="h-6 w-6 text-green-400" />
                         </div>
                         <div>
                           <div className="font-medium font-mono text-green-400">{selectedQuestDetails.creator.firstName} {selectedQuestDetails.creator.lastName}</div>
                           <div className="text-sm font-mono text-gray-400">@{selectedQuestDetails.creator.username}</div>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 )}
                 
                 {selectedQuestDetails.badges && selectedQuestDetails.badges.length > 0 && (
                   <Card className="mb-6 bg-black border border-dashed border-gray-600">
                     <CardContent className="p-6">
                       <div className="flex items-center gap-2 mb-4">
                         <Trophy className="h-4 w-4 text-green-400" />
                         <h3 className="font-semibold font-mono text-lg text-green-400">[Associated Badges]</h3>
                         <Badge variant="outline" className="ml-auto bg-black border-dashed border-gray-600 font-mono text-gray-400">[{selectedQuestDetails.badges.length}]</Badge>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {selectedQuestDetails.badges.map((badge: any, index: number) => (
                           <div key={badge.id || index} className="border border-dashed border-gray-600 bg-gray-900 p-4 space-y-3 hover:bg-gray-800 transition-colors">
                             <div className="flex items-center gap-3">
                               {badge.image ? (
                                 <img src={badge.image} alt={badge.name} className="w-10 h-10 border border-dashed border-gray-600" />
                               ) : (
                                 <div className="w-10 h-10 bg-black border border-dashed border-gray-600 flex items-center justify-center">
                                   <Trophy className="h-5 w-5 text-green-400" />
                                 </div>
                               )}
                               <div className="flex-1">
                                 <div className="font-medium font-mono text-green-400">{badge.name}</div>
                                 <div className="text-xs font-mono text-gray-400 flex items-center gap-2">
                                   <span>[{badge.rarity}]</span>
                                   <span>•</span>
                                   <span className="font-semibold text-green-400">{badge.points} pts</span>
                                 </div>
                               </div>
                             </div>
                             <p className="text-sm font-mono text-gray-400">{badge.description}</p>
                             <div className="text-xs font-mono text-gray-400 border-t border-dashed border-gray-600 pt-2">
                               Max to obtain: <span className="font-medium text-green-400">[{badge.maxToObtain}]</span>
                             </div>
                           </div>
                         ))}
                       </div>
                     </CardContent>
                   </Card>
                 )}
                 
                 {selectedQuestDetails.currentParticipants !== undefined && (
                   <Card className="mb-6 bg-black border border-dashed border-gray-600">
                     <CardContent className="p-6">
                       <div className="flex items-center gap-2 mb-4">
                         <Users className="h-4 w-4 text-green-400" />
                         <h3 className="font-semibold font-mono text-lg text-green-400">[Participants]</h3>
                         <Badge variant="outline" className="ml-auto bg-black border-dashed border-gray-600 font-mono text-gray-400">[{selectedQuestDetails.currentParticipants || 0}]</Badge>
                       </div>
                       <div className="font-mono text-gray-400">
                         {(selectedQuestDetails.currentParticipants || 0) === 0 ? (
                           <p className="text-center py-4">[No participants yet]</p>
                         ) : (
                           <p>[{selectedQuestDetails.currentParticipants} participants enrolled in this quest]</p>
                         )}
                       </div>
                     </CardContent>
                   </Card>
                 )}
                 
                 {selectedQuestDetails.requirements && selectedQuestDetails.requirements.length > 0 && (
                   <Card className="mb-6 bg-black border border-dashed border-gray-600">
                     <CardContent className="p-6">
                       <div className="flex items-center gap-2 mb-4">
                         <FileText className="h-4 w-4 text-green-400" />
                         <h3 className="font-semibold font-mono text-lg text-green-400">[Requirements]</h3>
                         <Badge variant="outline" className="ml-auto bg-black border-dashed border-gray-600 font-mono text-gray-400">[{selectedQuestDetails.requirements.length}]</Badge>
                       </div>
                       <ul className="space-y-3">
                         {selectedQuestDetails.requirements.map((req: string, index: number) => (
                           <li key={index} className="flex items-start gap-3 p-3 bg-gray-900 border border-dashed border-gray-600">
                             <div className="w-2 h-2 bg-green-400 mt-2 flex-shrink-0"></div>
                             <span className="text-sm font-mono text-gray-400 leading-relaxed">{req}</span>
                           </li>
                         ))}
                       </ul>
                     </CardContent>
                   </Card>
                 )}
                 
                 {selectedQuestDetails.submissionInstructions && (
                   <Card className="mb-6 bg-black border border-dashed border-gray-600">
                     <CardContent className="p-6">
                       <div className="flex items-center gap-2 mb-4">
                         <FileText className="h-4 w-4 text-green-400" />
                         <h3 className="font-semibold font-mono text-lg text-green-400">[Submission Instructions]</h3>
                       </div>
                       <div className="bg-gray-900 border border-dashed border-gray-600 p-4">
                         <p className="text-sm font-mono text-gray-400 leading-relaxed">{selectedQuestDetails.submissionInstructions}</p>
                       </div>
                     </CardContent>
                   </Card>
                 )}
               </div>
            ) : (
              <div className="text-center py-8 font-mono text-gray-400">
                [Failed to load quest details]
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Create Quest Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0 bg-black border border-dashed border-gray-600">
          <CreateQuestForm 
            onSuccess={() => {
              setShowCreateDialog(false);
              loadQuests(); // Refresh the quests list
              toast({
                title: "Quest Created",
                description: "The quest has been successfully created.",
              });
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Quest Dialog */}
      {questToEdit && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0 bg-black border border-dashed border-gray-600">
            <EditQuestForm 
              quest={questToEdit}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-black border border-dashed border-gray-600">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-green-400">[Delete Quest]</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-gray-400">
              Are you sure you want to delete "{questToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setShowDeleteDialog(false)}
              className="bg-black border border-dashed border-gray-600 font-mono text-gray-400 hover:bg-gray-900 hover:text-gray-300"
            >
              [Cancel]
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteQuest}
              className="bg-red-900 border border-dashed border-red-600 font-mono text-red-400 hover:bg-red-800 hover:text-red-300"
            >
              [Delete Quest]
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}