'use client';

import { useState, useEffect } from 'react';
import { BadgesApi } from '@/lib/api/badges';
import { Badge, BadgeFilters } from '@/lib/types';
import { CreateBadgeForm } from '@/components/admin/create-badge-form';
import { tokenStorage } from '@/lib/api/client';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Eye, Filter, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const rarityColors = {
  common: 'bg-black border-2 border-dashed border-gray-600 text-gray-400',
  rare: 'bg-black border-2 border-dashed border-cyan-400 text-cyan-400',
  epic: 'bg-black border-2 border-dashed border-purple-400 text-purple-400',
  legendary: 'bg-black border-2 border-dashed border-yellow-400 text-yellow-400',
};

function AdminBadgesPageContent() {
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="p-4 bg-black border-2 border-dashed border-gray-600 rounded">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-mono text-green-400">[BADGE_MANAGEMENT]</h1>
            <p className="text-gray-400 font-mono text-sm">
              Create and manage badges that users can earn
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 bg-black border-2 border-dashed border-gray-600 text-green-400 font-mono hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            {showCreateForm ? '[HIDE_FORM]' : '[CREATE_BADGE]'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="bg-black border-2 border-dashed border-gray-600">
          <TabsTrigger value="list" className="font-mono data-[state=active]:bg-gray-800 data-[state=active]:text-green-400 text-gray-400">[ALL_BADGES]</TabsTrigger>
          <TabsTrigger value="create" className="font-mono data-[state=active]:bg-gray-800 data-[state=active]:text-green-400 text-gray-400">[CREATE_BADGE]</TabsTrigger>
        </TabsList>

                 <TabsContent value="list" className="space-y-4">
           {/* Filters */}
           <Card className="bg-black border-2 border-dashed border-gray-600">
             <CardHeader>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Filter className="h-4 w-4 text-green-400" />
                   <CardTitle className="text-lg font-mono text-green-400">[FILTERS]</CardTitle>
                 </div>
                 {hasActiveFilters && (
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={clearFilters}
                     className="flex items-center gap-2 bg-black border-2 border-dashed border-gray-600 text-red-400 font-mono hover:bg-gray-800"
                   >
                     <X className="h-4 w-4" />
                     [CLEAR_FILTERS]
                   </Button>
                 )}
               </div>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                   <div className="space-y-2">
                    <Label className="font-mono text-gray-400">[RARITY]</Label>
                    <Select
                      value={filters.rarity || 'all'}
                      onValueChange={(value) => handleFilterChange('rarity', value === 'all' ? undefined : value)}
                    >
                      <SelectTrigger className="bg-black border-2 border-dashed border-gray-600 text-green-400 font-mono">
                        <SelectValue placeholder="[ALL_RARITIES]" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-2 border-dashed border-gray-600">
                        <SelectItem value="all" className="font-mono text-gray-400 hover:text-green-400">[ALL_RARITIES]</SelectItem>
                        <SelectItem value="common" className="font-mono text-gray-400 hover:text-green-400">[COMMON]</SelectItem>
                        <SelectItem value="rare" className="font-mono text-cyan-400 hover:text-green-400">[RARE]</SelectItem>
                        <SelectItem value="epic" className="font-mono text-purple-400 hover:text-green-400">[EPIC]</SelectItem>
                        <SelectItem value="legendary" className="font-mono text-yellow-400 hover:text-green-400">[LEGENDARY]</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                                   <div className="space-y-2">
                    <Label className="font-mono text-gray-400">[STATUS]</Label>
                    <Select
                      value={filters.isActive?.toString() || 'all'}
                      onValueChange={(value) => handleFilterChange('isActive', value === 'true' ? true : value === 'false' ? false : undefined)}
                    >
                      <SelectTrigger className="bg-black border-2 border-dashed border-gray-600 text-green-400 font-mono">
                        <SelectValue placeholder="[ALL_STATUSES]" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-2 border-dashed border-gray-600">
                        <SelectItem value="all" className="font-mono text-gray-400 hover:text-green-400">[ALL_STATUSES]</SelectItem>
                        <SelectItem value="true" className="font-mono text-green-400 hover:text-green-400">[ACTIVE]</SelectItem>
                        <SelectItem value="false" className="font-mono text-red-400 hover:text-green-400">[INACTIVE]</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                 <div className="space-y-2">
                   <Label className="font-mono text-gray-400">[RESULTS]</Label>
                   <div className="text-sm font-mono text-green-400">
                     {totalCount} badge{totalCount !== 1 ? 's' : ''} found
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>

           {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
              <p className="mt-2 font-mono text-gray-400">[LOADING_BADGES...]</p>
            </div>
          ) : badges.length === 0 ? (
            <Card className="bg-black border-2 border-dashed border-gray-600">
              <CardContent className="text-center py-8">
                <p className="font-mono text-gray-400">[NO_BADGES_FOUND]</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 bg-black border-2 border-dashed border-gray-600 text-green-400 font-mono hover:bg-gray-800"
                >
                  [CREATE_FIRST_BADGE]
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge) => (
                <Card key={badge.id} className="bg-black border-2 border-dashed border-gray-600 hover:border-green-400 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-mono text-green-400">{badge.name}</CardTitle>
                        <CardDescription className="line-clamp-2 font-mono text-gray-400 text-sm">
                          {badge.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* TODO: View badge details */}}
                          className="bg-black border-2 border-dashed border-gray-600 text-cyan-400 hover:bg-gray-800"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* TODO: Edit badge */}}
                          className="bg-black border-2 border-dashed border-gray-600 text-yellow-400 hover:bg-gray-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBadge(badge.id)}
                          className="bg-black border-2 border-dashed border-gray-600 text-red-400 hover:bg-gray-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <BadgeComponent
                        className={`${rarityColors[badge.rarity]} font-mono`}
                      >
                        [{badge.rarity.toUpperCase()}]
                      </BadgeComponent>
                      <BadgeComponent className="bg-black border-2 border-dashed border-gray-600 text-green-400 font-mono">
                        [{badge.points}_PTS]
                      </BadgeComponent>
                      {badge.maxToObtain && (
                        <BadgeComponent className="bg-black border-2 border-dashed border-gray-600 text-orange-400 font-mono">
                          [MAX:{badge.maxToObtain}]
                        </BadgeComponent>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm font-mono">
                      <span>
                        {badge.isActive ? (
                          <span className="text-green-400">[ACTIVE]</span>
                        ) : (
                          <span className="text-red-400">[INACTIVE]</span>
                        )}
                      </span>
                      {badge.created_at && (
                        <span className="text-gray-400">
                          Created: {new Date(badge.created_at).toLocaleDateString()}
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
           <CreateBadgeForm onBadgeCreated={loadBadges} />
         </TabsContent>
      </Tabs>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-black border-2 border-dashed border-gray-600 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold font-mono text-green-400">[CREATE_NEW_BADGE]</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-black border-2 border-dashed border-gray-600 text-red-400 font-mono hover:bg-gray-800"
                >
                  [×]
                </Button>
              </div>
                             <CreateBadgeForm onBadgeCreated={loadBadges} />
            </div>
          </div>
        </div>
             )}
     </div>
   );
 }

export default function AdminBadgesPage() {
  return (
    <AuthGuard requireAdmin={true}>
      <AdminBadgesPageContent />
    </AuthGuard>
  );
}
