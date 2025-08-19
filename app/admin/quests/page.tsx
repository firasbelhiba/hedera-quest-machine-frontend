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
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Quest Management</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredQuests.length} quest{filteredQuests.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              Total: {filteredQuests.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 bg-muted/30">
                  <TableHead className="font-semibold text-foreground py-4 px-6">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Quest Details
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Category
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Difficulty
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Rewards
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Participants
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Status
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground py-4 px-4 text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuests.map((quest, index) => (
                  <TableRow 
                    key={quest.id} 
                    className={cn(
                      "hover:bg-muted/50 transition-colors border-b",
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    )}
                  >
                    <TableCell className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0 mt-1">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-foreground mb-1 line-clamp-1">
                            {quest.title}
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                            {quest.description}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              ID: {quest.id}
                            </Badge>
                            {quest.platform && (
                              <Badge variant="secondary" className="text-xs">
                                {quest.platform}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <Badge 
                        className={cn('text-xs font-medium', getCategoryColor(quest.category || 'general'))} 
                        variant="outline"
                      >
                        {quest.category ? quest.category.replace('-', ' ') : 'No Category'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <Badge 
                        className={cn('text-xs font-medium', getDifficultyColor(quest.difficulty))} 
                        variant="outline"
                      >
                        {quest.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">
                          {quest.points || quest.reward || '0'} pts
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">
                          {quest.completions || quest.currentParticipants || '0'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          (quest.isActive || quest.status === 'active') 
                            ? "bg-green-500 animate-pulse" 
                            : "bg-gray-400"
                        )} />
                        <Badge 
                          variant={(quest.isActive || quest.status === 'active') ? "default" : "secondary"}
                          className="font-medium"
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
                              className="h-8 w-8 p-0 hover:bg-muted/80 transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => handleViewQuestDetails(quest)}
                              className="cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2 text-blue-500" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEditQuest(quest)}
                              className="cursor-pointer"
                            >
                              <Edit className="w-4 h-4 mr-2 text-orange-500" />
                              Edit Quest
                            </DropdownMenuItem>
                            {!(quest.isActive || quest.status === 'active') && (
                              <DropdownMenuItem 
                                onClick={() => activateQuest(quest)}
                                className="cursor-pointer"
                              >
                                <Trophy className="w-4 h-4 mr-2 text-green-500" />
                                Activate Quest
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteQuest(quest)}
                              className="text-red-600 cursor-pointer hover:bg-red-50 focus:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Quest
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader className="pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-xl">{selectedQuest.title}</DialogTitle>
                  {selectedQuestDetails && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={selectedQuestDetails.status === 'active' ? 'default' : 'secondary'}>
                        {selectedQuestDetails.status}
                      </Badge>
                      <Badge className={getDifficultyColor(selectedQuestDetails.difficulty)} variant="outline">
                        {selectedQuestDetails.difficulty}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </DialogHeader>
            
            {isLoadingDetails ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Loading quest details...</span>
              </div>
            ) : selectedQuestDetails ? (
               <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-1">
                 {/* Description Card */}
                 <Card className="mb-6">
                   <CardContent className="p-6">
                     <div className="flex items-center gap-2 mb-3">
                       <FileText className="h-4 w-4 text-muted-foreground" />
                       <h3 className="font-semibold text-lg">Description</h3>
                     </div>
                     <p className="text-muted-foreground leading-relaxed">{selectedQuestDetails.description}</p>
                   </CardContent>
                 </Card>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                   {/* Quest Information Card */}
                   <Card>
                     <CardContent className="p-6">
                       <div className="flex items-center gap-2 mb-4">
                         <Trophy className="h-4 w-4 text-muted-foreground" />
                         <h3 className="font-semibold text-lg">Quest Information</h3>
                       </div>
                       <div className="space-y-3">
                         <div className="flex items-center justify-between py-2 border-b border-border/50">
                           <span className="text-sm font-medium text-muted-foreground">Quest ID</span>
                           <span className="text-sm font-mono">{selectedQuestDetails.id}</span>
                         </div>
                         <div className="flex items-center justify-between py-2 border-b border-border/50">
                           <span className="text-sm font-medium text-muted-foreground">Reward</span>
                           <span className="text-sm font-semibold text-green-600">
                             {selectedQuestDetails.reward || selectedQuestDetails.points || 'N/A'}
                           </span>
                         </div>
                         <div className="flex items-center justify-between py-2 border-b border-border/50">
                           <span className="text-sm font-medium text-muted-foreground">Platform</span>
                           <span className="text-sm capitalize">{selectedQuestDetails.platform_type || 'N/A'}</span>
                         </div>
                         <div className="flex items-center justify-between py-2">
                           <span className="text-sm font-medium text-muted-foreground">Interaction Type</span>
                           <span className="text-sm capitalize">{selectedQuestDetails.interaction_type || 'N/A'}</span>
                         </div>
                         {selectedQuestDetails.quest_link && (
                           <div className="pt-3 border-t border-border/50">
                             <span className="text-sm font-medium text-muted-foreground block mb-2">Quest Link</span>
                             <a 
                               href={selectedQuestDetails.quest_link} 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               className="text-blue-500 hover:text-blue-600 text-sm break-all hover:underline"
                             >
                               {selectedQuestDetails.quest_link}
                             </a>
                           </div>
                         )}
                       </div>
                     </CardContent>
                   </Card>
                   
                   {/* Participation & Timeline Card */}
                   <Card>
                     <CardContent className="p-6">
                       <div className="flex items-center gap-2 mb-4">
                         <Users className="h-4 w-4 text-muted-foreground" />
                         <h3 className="font-semibold text-lg">Participation & Timeline</h3>
                       </div>
                       <div className="space-y-3">
                         <div className="flex items-center justify-between py-2 border-b border-border/50">
                           <span className="text-sm font-medium text-muted-foreground">Current Participants</span>
                           <span className="text-sm font-semibold">{selectedQuestDetails.currentParticipants || 0}</span>
                         </div>
                         <div className="flex items-center justify-between py-2 border-b border-border/50">
                           <span className="text-sm font-medium text-muted-foreground">Max Participants</span>
                           <span className="text-sm">{selectedQuestDetails.maxParticipants || 'Unlimited'}</span>
                         </div>
                         <div className="flex items-center justify-between py-2 border-b border-border/50">
                           <span className="text-sm font-medium text-muted-foreground">Start Date</span>
                           <span className="text-sm">{selectedQuestDetails.startDate ? new Date(selectedQuestDetails.startDate).toLocaleDateString() : 'N/A'}</span>
                         </div>
                         <div className="flex items-center justify-between py-2 border-b border-border/50">
                           <span className="text-sm font-medium text-muted-foreground">End Date</span>
                           <span className="text-sm">{selectedQuestDetails.endDate ? new Date(selectedQuestDetails.endDate).toLocaleDateString() : 'N/A'}</span>
                         </div>
                         <div className="flex items-center justify-between py-2 border-b border-border/50">
                           <span className="text-sm font-medium text-muted-foreground">Created</span>
                           <span className="text-sm">{selectedQuestDetails.created_at ? new Date(selectedQuestDetails.created_at).toLocaleDateString() : 'N/A'}</span>
                         </div>
                         <div className="flex items-center justify-between py-2">
                           <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                           <span className="text-sm">{selectedQuestDetails.updated_at ? new Date(selectedQuestDetails.updated_at).toLocaleDateString() : 'N/A'}</span>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 </div>
                 
                 {selectedQuestDetails.creator && (
                   <Card className="mb-6">
                     <CardContent className="p-6">
                       <div className="flex items-center gap-2 mb-4">
                         <Users className="h-4 w-4 text-muted-foreground" />
                         <h3 className="font-semibold text-lg">Creator Information</h3>
                       </div>
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                           <Users className="h-6 w-6 text-primary" />
                         </div>
                         <div>
                           <div className="font-medium">{selectedQuestDetails.creator.firstName} {selectedQuestDetails.creator.lastName}</div>
                           <div className="text-sm text-muted-foreground">@{selectedQuestDetails.creator.username}</div>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 )}
                 
                 {selectedQuestDetails.badges && selectedQuestDetails.badges.length > 0 && (
                   <Card className="mb-6">
                     <CardContent className="p-6">
                       <div className="flex items-center gap-2 mb-4">
                         <Trophy className="h-4 w-4 text-muted-foreground" />
                         <h3 className="font-semibold text-lg">Associated Badges</h3>
                         <Badge variant="secondary" className="ml-auto">{selectedQuestDetails.badges.length}</Badge>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {selectedQuestDetails.badges.map((badge: any, index: number) => (
                           <div key={badge.id || index} className="border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
                             <div className="flex items-center gap-3">
                               {badge.image ? (
                                 <img src={badge.image} alt={badge.name} className="w-10 h-10 rounded-lg" />
                               ) : (
                                 <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                   <Trophy className="h-5 w-5 text-primary" />
                                 </div>
                               )}
                               <div className="flex-1">
                                 <div className="font-medium">{badge.name}</div>
                                 <div className="text-xs text-muted-foreground flex items-center gap-2">
                                   <span>{badge.rarity}</span>
                                   <span>•</span>
                                   <span className="font-semibold text-green-600">{badge.points} pts</span>
                                 </div>
                               </div>
                             </div>
                             <p className="text-sm text-muted-foreground">{badge.description}</p>
                             <div className="text-xs text-muted-foreground border-t pt-2">
                               Max to obtain: <span className="font-medium">{badge.maxToObtain}</span>
                             </div>
                           </div>
                         ))}
                       </div>
                     </CardContent>
                   </Card>
                 )}
                 
                 {selectedQuestDetails.participants && selectedQuestDetails.participants.length > 0 && (
                   <Card className="mb-6">
                     <CardContent className="p-6">
                       <div className="flex items-center gap-2 mb-4">
                         <Users className="h-4 w-4 text-muted-foreground" />
                         <h3 className="font-semibold text-lg">Participants</h3>
                         <Badge variant="secondary" className="ml-auto">{selectedQuestDetails.participants.length}</Badge>
                       </div>
                       <div className="text-muted-foreground">
                         {selectedQuestDetails.participants.length === 0 ? (
                           <p className="text-center py-4">No participants yet</p>
                         ) : (
                           <p>{selectedQuestDetails.participants.length} participants enrolled in this quest</p>
                         )}
                       </div>
                     </CardContent>
                   </Card>
                 )}
                 
                 {selectedQuestDetails.requirements && selectedQuestDetails.requirements.length > 0 && (
                   <Card className="mb-6">
                     <CardContent className="p-6">
                       <div className="flex items-center gap-2 mb-4">
                         <FileText className="h-4 w-4 text-muted-foreground" />
                         <h3 className="font-semibold text-lg">Requirements</h3>
                         <Badge variant="secondary" className="ml-auto">{selectedQuestDetails.requirements.length}</Badge>
                       </div>
                       <ul className="space-y-3">
                         {selectedQuestDetails.requirements.map((req: string, index: number) => (
                           <li key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                             <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                             <span className="text-sm leading-relaxed">{req}</span>
                           </li>
                         ))}
                       </ul>
                     </CardContent>
                   </Card>
                 )}
                 
                 {selectedQuestDetails.submissionInstructions && (
                   <Card className="mb-6">
                     <CardContent className="p-6">
                       <div className="flex items-center gap-2 mb-4">
                         <FileText className="h-4 w-4 text-muted-foreground" />
                         <h3 className="font-semibold text-lg">Submission Instructions</h3>
                       </div>
                       <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                         <p className="text-sm leading-relaxed">{selectedQuestDetails.submissionInstructions}</p>
                       </div>
                     </CardContent>
                   </Card>
                 )}
               </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Failed to load quest details
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Create Quest Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
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
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quest</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{questToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteQuest}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Quest
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}