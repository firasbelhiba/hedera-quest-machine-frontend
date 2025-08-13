'use client';

import { useState, useEffect } from 'react';
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
        setQuests(questsData);
        setUser(userData);
      } catch (error) {
        console.error('Failed to load quests:', error);
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
    window.location.href = `/quests/${quest.id}`;
  };

  const filteredQuests = quests.filter(quest => {
    if (!filters.showCompleted && user?.completedQuests?.includes(quest.id)) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Discover Quests</h1>
          <p className="text-muted-foreground">
            Explore {quests.length} quests to master the Hedera ecosystem
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
          
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Quick search..."
          className="pl-10"
          value={filters.search}
          onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
        />
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
            <TabsList>
              <TabsTrigger value="all">
                All Quests ({filteredQuests.length})
              </TabsTrigger>
              <TabsTrigger value="available">
                Available ({filteredQuests.filter(q => !user?.completedQuests?.includes(q.id)).length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({filteredQuests.filter(q => user?.completedQuests?.includes(q.id)).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredQuests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      isCompleted={user?.completedQuests?.includes(quest.id)}
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
                            {user?.completedQuests?.includes(quest.id) && (
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 text-white text-xs">✓</div>
                              </div>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-3">{quest.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="capitalize">{quest.category.replace('-', ' ')}</span>
                            <span className="capitalize">{quest.difficulty}</span>
                            <span>{quest.estimatedTime}</span>
                            <span>{quest.points} points</span>
                          </div>
                        </div>
                        <Button size="sm">
                          {user?.completedQuests?.includes(quest.id) ? 'Review' : 'Start'}
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
                  .filter(q => !user?.completedQuests?.includes(q.id))
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
                  .filter(q => user?.completedQuests?.includes(q.id))
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