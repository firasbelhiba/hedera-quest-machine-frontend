'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Quest, FilterOptions, User } from '@/lib/types';
import { QuestService } from '@/lib/services';
import { QuestCard } from '@/components/quests/quest-card';
import { QuestFilters } from '@/components/quests/quest-filters';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Filter, Grid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QuestsPage() {
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    difficulties: [],
    search: '',
    showCompleted: false
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [questsData, userData] = await Promise.all([
          QuestService.getQuests(filters),
          QuestService.getCurrentUser()
        ]);
        // Ensure questsData is always an array
        setQuests(Array.isArray(questsData) ? questsData : []);
        setUser(userData);
      } catch (error) {
        console.error('Failed to load quests:', error);
        // Set empty array on error to prevent filter issues
        setQuests([]);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [filters]);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleQuestSelect = (quest: Quest) => {
    // Navigate to quest details
    router.push(`/quests/${quest.id}`);
  };

  const filteredQuests = (quests || []).filter(quest => {
    if (!filters.showCompleted && user?.completedQuests?.includes(String(quest.id))) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-lg" />
        <div className="relative bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary/20 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                🎮 Discover Quests
              </h1>
              <p className="text-muted-foreground font-mono text-sm">
                {'>'} Explore {quests.length} quests to master the Hedera ecosystem
              </p>
            </div>
        
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 border-2 border-dashed hover:border-solid transition-all duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] font-mono"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? '[Hide]' : '[Show]'} Filters
              </Button>
              
              <div className="flex border-2 border-dashed border-muted rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "rounded-none border-r border-dashed font-mono",
                    viewMode === 'grid' && "shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  )}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "rounded-none font-mono",
                    viewMode === 'list' && "shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  )}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-lg" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="> Type to search quests..."
            className="pl-10 border-2 border-dashed hover:border-solid transition-all duration-200 font-mono bg-background/50 backdrop-blur-sm"
            value={filters.search}
            onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        {showFilters && (
          <div className="w-80 flex-shrink-0">
            <QuestFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              className="sticky top-4"
            />
          </div>
        )}

        {/* Quest Content */}
        <div className="flex-1">
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="bg-gradient-to-r from-background via-muted/50 to-background border-2 border-dashed border-muted p-1">
              <TabsTrigger 
                value="all"
                className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all duration-200"
              >
                🎯 All Quests ({filteredQuests.length})
              </TabsTrigger>
              <TabsTrigger 
                value="available"
                className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all duration-200"
              >
                ⚡ Available ({filteredQuests.filter(q => !user?.completedQuests?.includes(String(q.id))).length})
              </TabsTrigger>
              <TabsTrigger 
                value="completed"
                className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all duration-200"
              >
                ✅ Completed ({filteredQuests.filter(q => user?.completedQuests?.includes(String(q.id))).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredQuests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      isCompleted={user?.completedQuests?.includes(String(quest.id))}
                      onSelect={() => handleQuestSelect(quest)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuests.map((quest) => (
                    <div key={quest.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                         onClick={() => handleQuestSelect(quest)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{quest.title}</h3>
                            {user?.completedQuests?.includes(String(quest.id)) && (
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 text-white text-xs">✓</div>
                              </div>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-3">{quest.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="capitalize">{(quest.category || 'general').replace('-', ' ')}</span>
                            <span className="capitalize">{quest.difficulty}</span>
                            <span>{quest.estimatedTime}</span>
                            <span>{quest.points} points</span>
                          </div>
                        </div>
                        <Button size="sm">
                          {user?.completedQuests?.includes(String(quest.id)) ? 'Review' : 'Start'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredQuests.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No quests found matching your criteria.</p>
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      categories: [],
                      difficulties: [],
                      search: '',
                      showCompleted: false
                    })}
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="available">
              <div className={cn(
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              )}>
                {filteredQuests
                  .filter(q => !user?.completedQuests?.includes(String(q.id)))
                  .map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      isCompleted={false}
                      onSelect={() => handleQuestSelect(quest)}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className={cn(
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              )}>
                {filteredQuests
                  .filter(q => user?.completedQuests?.includes(String(q.id)))
                  .map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      isCompleted={true}
                      onSelect={() => handleQuestSelect(quest)}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}