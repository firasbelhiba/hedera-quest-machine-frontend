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
                      <Badge className={cn('text-xs', getCategoryColor(quest.category || 'general'))} variant="outline">
                        {quest.category ? quest.category.replace('-', ' ') : 'No Category'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', getDifficultyColor(quest.difficulty))} variant="outline">
                        {quest.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>{quest.points || quest.reward || '0'}</TableCell>
                    <TableCell>{quest.completions || quest.currentParticipants || '0'}</TableCell>
                    <TableCell>
                      <Badge variant={(quest.isActive || quest.status === 'active') ? "default" : "secondary"}>
                        {(quest.isActive || quest.status === 'active') ? 'Active' : 'Inactive'}
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
                          <DropdownMenuItem onClick={() => handleViewQuestDetails(quest)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditQuest(quest)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Quest
                          </DropdownMenuItem>
                          {!(quest.isActive || quest.status === 'active') && (
                            <DropdownMenuItem onClick={() => activateQuest(quest)}>
                              <Trophy className="w-4 h-4 mr-2" />
                              Activate Quest
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteQuest(String(quest.id))}
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
        <Dialog open={!!selectedQuest} onOpenChange={() => {
          setSelectedQuest(null);
          setSelectedQuestDetails(null);
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedQuest.title}</DialogTitle>
            </DialogHeader>
            {isLoadingDetails ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading quest details...</span>
              </div>
            ) : selectedQuestDetails ? (
               <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                 <div>
                   <p className="text-muted-foreground">{selectedQuestDetails.description}</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                     <div>
                       <h4 className="font-semibold mb-3">Quest Details</h4>
                       <div className="space-y-2 text-sm">
                         <div className="flex justify-between"><span className="font-medium">ID:</span> <span>{selectedQuestDetails.id}</span></div>
                         <div className="flex justify-between"><span className="font-medium">Status:</span> <Badge variant={selectedQuestDetails.status === 'active' ? 'default' : 'secondary'}>{selectedQuestDetails.status}</Badge></div>
                         <div className="flex justify-between"><span className="font-medium">Difficulty:</span> <Badge className={getDifficultyColor(selectedQuestDetails.difficulty)} variant="outline">{selectedQuestDetails.difficulty}</Badge></div>
                         <div className="flex justify-between"><span className="font-medium">Reward:</span> <span>{selectedQuestDetails.reward || selectedQuestDetails.points || 'N/A'}</span></div>
                         <div className="flex justify-between"><span className="font-medium">Max Participants:</span> <span>{selectedQuestDetails.maxParticipants || 'Unlimited'}</span></div>
                         <div className="flex justify-between"><span className="font-medium">Current Participants:</span> <span>{selectedQuestDetails.currentParticipants || 0}</span></div>
                       </div>
                     </div>
                     
                     <div>
                       <h4 className="font-semibold mb-3">Platform & Interaction</h4>
                       <div className="space-y-2 text-sm">
                         <div className="flex justify-between"><span className="font-medium">Platform:</span> <span className="capitalize">{selectedQuestDetails.platform_type || 'N/A'}</span></div>
                         <div className="flex justify-between"><span className="font-medium">Interaction:</span> <span className="capitalize">{selectedQuestDetails.interaction_type || 'N/A'}</span></div>
                         {selectedQuestDetails.quest_link && (
                           <div>
                             <span className="font-medium">Quest Link:</span>
                             <a href={selectedQuestDetails.quest_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline block truncate mt-1">
                               {selectedQuestDetails.quest_link}
                             </a>
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                   
                   <div className="space-y-4">
                     <div>
                       <h4 className="font-semibold mb-3">Timeline</h4>
                       <div className="space-y-2 text-sm">
                         <div className="flex justify-between"><span className="font-medium">Start Date:</span> <span>{selectedQuestDetails.startDate ? new Date(selectedQuestDetails.startDate).toLocaleDateString() : 'N/A'}</span></div>
                         <div className="flex justify-between"><span className="font-medium">End Date:</span> <span>{selectedQuestDetails.endDate ? new Date(selectedQuestDetails.endDate).toLocaleDateString() : 'N/A'}</span></div>
                         <div className="flex justify-between"><span className="font-medium">Created:</span> <span>{selectedQuestDetails.created_at ? new Date(selectedQuestDetails.created_at).toLocaleDateString() : 'N/A'}</span></div>
                         <div className="flex justify-between"><span className="font-medium">Updated:</span> <span>{selectedQuestDetails.updated_at ? new Date(selectedQuestDetails.updated_at).toLocaleDateString() : 'N/A'}</span></div>
                       </div>
                     </div>
                     
                     {selectedQuestDetails.creator && (
                       <div>
                         <h4 className="font-semibold mb-3">Creator</h4>
                         <div className="space-y-2 text-sm">
                           <div className="flex justify-between"><span className="font-medium">Name:</span> <span>{selectedQuestDetails.creator.firstName} {selectedQuestDetails.creator.lastName}</span></div>
                           <div className="flex justify-between"><span className="font-medium">Username:</span> <span>{selectedQuestDetails.creator.username}</span></div>
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
                 
                 {selectedQuestDetails.badges && selectedQuestDetails.badges.length > 0 && (
                   <div>
                     <h4 className="font-semibold mb-3">Associated Badges</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {selectedQuestDetails.badges.map((badge: any, index: number) => (
                         <div key={badge.id || index} className="border rounded-lg p-3 space-y-2">
                           <div className="flex items-center gap-2">
                             {badge.image && (
                               <img src={badge.image} alt={badge.name} className="w-8 h-8 rounded" />
                             )}
                             <div>
                               <div className="font-medium text-sm">{badge.name}</div>
                               <div className="text-xs text-muted-foreground">{badge.rarity} • {badge.points} pts</div>
                             </div>
                           </div>
                           <p className="text-xs text-muted-foreground">{badge.description}</p>
                           <div className="text-xs">Max to obtain: {badge.maxToObtain}</div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
                 
                 {selectedQuestDetails.participants && selectedQuestDetails.participants.length > 0 && (
                   <div>
                     <h4 className="font-semibold mb-3">Participants ({selectedQuestDetails.participants.length})</h4>
                     <div className="text-sm text-muted-foreground">
                       {selectedQuestDetails.participants.length === 0 ? 'No participants yet' : `${selectedQuestDetails.participants.length} participants enrolled`}
                     </div>
                   </div>
                 )}
                 
                 {selectedQuestDetails.requirements && selectedQuestDetails.requirements.length > 0 && (
                   <div>
                     <h4 className="font-semibold mb-3">Requirements</h4>
                     <ul className="text-sm space-y-1">
                       {selectedQuestDetails.requirements.map((req: string, index: number) => (
                         <li key={index} className="flex items-start gap-2">
                           <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                           {req}
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
                 
                 {selectedQuestDetails.submissionInstructions && (
                   <div>
                     <h4 className="font-semibold mb-3">Submission Instructions</h4>
                     <p className="text-sm text-muted-foreground">{selectedQuestDetails.submissionInstructions}</p>
                   </div>
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
    </div>
  );
}