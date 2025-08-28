'use client';

import { useState, useEffect } from 'react';
import { BadgesApi } from '@/lib/api/badges';
import { Badge, BadgeFilters } from '@/lib/types';
import { CreateBadgeForm } from '@/components/admin/create-badge-form';
import { tokenStorage } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Eye, Filter, X, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const rarityColors = {
  common: 'bg-gray-100 border border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400',
  rare: 'bg-cyan-50 border border-cyan-300 text-cyan-700 dark:bg-gray-800 dark:border-cyan-400 dark:text-cyan-400',
  epic: 'bg-purple-50 border border-purple-300 text-purple-700 dark:bg-gray-800 dark:border-purple-400 dark:text-purple-400',
  legendary: 'bg-yellow-50 border border-yellow-300 text-yellow-700 dark:bg-gray-800 dark:border-yellow-400 dark:text-yellow-400',
};

export default function BadgeManagement() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<BadgeFilters>({});
  const { toast } = useToast();

  useEffect(() => {
    loadBadges();
  }, [filters]);

  const loadBadges = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      const token = tokenStorage.getAccessToken();
      if (!token) {
        throw new Error('Authentication required. Please log in to access badge management.');
      }
      
      const response = await BadgesApi.list(filters);
      setBadges(response.data);
      setTotalCount(response.count);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load badges',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBadgeCreated = () => {
    setShowCreateForm(false);
    loadBadges();
  };

  const handleFilterChange = (key: keyof BadgeFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const handleDeleteBadge = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this badge?')) return;

    try {
      // Check if user is authenticated
      const token = tokenStorage.getAccessToken();
      if (!token) {
        throw new Error('Authentication required. Please log in to manage badges.');
      }
      
      await BadgesApi.delete(id);
      toast({
        title: 'Success',
        description: 'Badge deleted successfully',
      });
      loadBadges();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete badge',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-50 to-orange-100/50 dark:from-amber-950/30 dark:to-orange-900/20 rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5" />
        <div className="relative p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 rounded-lg blur-sm" />
                <div className="relative p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-mono">
                  BADGE_MANAGEMENT
                </h2>
                <p className="text-amber-600/70 text-sm mt-1 font-mono">
                  Create and manage badges that users can earn
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
            >
              <Plus className="h-4 w-4" />
              {showCreateForm ? 'Hide Form' : 'Create Badge'}
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 rounded-xl" />
          <div className="relative p-2 bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl">
            <TabsList className="grid w-full grid-cols-2 gap-1 bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="list" 
                className="relative font-mono text-sm px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>All Badges</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="create" 
                className="relative font-mono text-sm px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Badge</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <CardTitle className="text-lg font-mono bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                    FILTERS
                  </CardTitle>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center gap-2 border-dashed border-red-500/30 text-red-600 hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="border-t-2 border-dashed border-primary/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="font-mono text-sm">Rarity</Label>
                  <Select
                    value={filters.rarity || 'all'}
                    onValueChange={(value) => handleFilterChange('rarity', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Rarities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rarities</SelectItem>
                      <SelectItem value="common">Common</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                      <SelectItem value="epic">Epic</SelectItem>
                      <SelectItem value="legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-mono text-sm">Status</Label>
                  <Select
                    value={filters.isActive?.toString() || 'all'}
                    onValueChange={(value) => handleFilterChange('isActive', value === 'true' ? true : value === 'false' ? false : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-mono text-sm">Results</Label>
                  <div className="text-sm font-mono bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                    {totalCount} badge{totalCount !== 1 ? 's' : ''} found
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground font-mono">Loading badges...</p>
            </div>
          ) : badges.length === 0 ? (
            <Card className="border-2 border-dashed border-muted-foreground/20">
              <CardContent className="text-center py-8">
                <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-mono mb-4">No badges found</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20"
                >
                  Create First Badge
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge) => (
                <Card key={badge.id} className="group relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="relative pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-mono">{badge.name}</CardTitle>
                        <CardDescription className="line-clamp-2 text-sm mt-1">
                          {badge.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* TODO: View badge details */}}
                          className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 hover:bg-cyan-500/20"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* TODO: Edit badge */}}
                          className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 hover:bg-yellow-500/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBadge(badge.id)}
                          className="bg-red-500/10 border border-red-500/20 text-red-600 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative pt-0">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <BadgeComponent className={`${rarityColors[badge.rarity]} font-mono text-xs`}>
                        {badge.rarity.toUpperCase()}
                      </BadgeComponent>
                      <BadgeComponent className="bg-primary/10 border border-primary/20 text-primary font-mono text-xs">
                        {badge.points} PTS
                      </BadgeComponent>
                      {badge.maxToObtain && (
                        <BadgeComponent className="bg-orange-500/10 border border-orange-500/20 text-orange-600 font-mono text-xs">
                          MAX: {badge.maxToObtain}
                        </BadgeComponent>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm font-mono">
                      <span>
                        {badge.isActive ? (
                          <span className="text-green-600">ACTIVE</span>
                        ) : (
                          <span className="text-red-600">INACTIVE</span>
                        )}
                      </span>
                      {badge.created_at && (
                        <span className="text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(badge.created_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create">
          <CreateBadgeForm onBadgeCreated={handleBadgeCreated} />
        </TabsContent>
      </Tabs>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold font-mono">Create New Badge</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-red-500/10 border border-red-500/20 text-red-600 hover:bg-red-500/20"
                >
                  ×
                </Button>
              </div>
              <CreateBadgeForm onBadgeCreated={handleBadgeCreated} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}