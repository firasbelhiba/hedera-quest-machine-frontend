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
  common: 'bg-gray-100 text-gray-800',
  rare: 'bg-blue-100 text-blue-800',
  epic: 'bg-purple-100 text-purple-800',
  legendary: 'bg-yellow-100 text-yellow-800',
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Badge Management</h1>
          <p className="text-muted-foreground">
            Create and manage badges that users can earn
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {showCreateForm ? 'Hide Form' : 'Create Badge'}
        </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">All Badges</TabsTrigger>
          <TabsTrigger value="create">Create Badge</TabsTrigger>
        </TabsList>

                 <TabsContent value="list" className="space-y-4">
           {/* Filters */}
           <Card>
             <CardHeader>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Filter className="h-4 w-4" />
                   <CardTitle className="text-lg">Filters</CardTitle>
                 </div>
                 {hasActiveFilters && (
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={clearFilters}
                     className="flex items-center gap-2"
                   >
                     <X className="h-4 w-4" />
                     Clear Filters
                   </Button>
                 )}
               </div>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                   <div className="space-y-2">
                    <Label>Rarity</Label>
                    <Select
                      value={filters.rarity || 'all'}
                      onValueChange={(value) => handleFilterChange('rarity', value === 'all' ? undefined : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All rarities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All rarities</SelectItem>
                        <SelectItem value="common">Common</SelectItem>
                        <SelectItem value="rare">Rare</SelectItem>
                        <SelectItem value="epic">Epic</SelectItem>
                        <SelectItem value="legendary">Legendary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                                   <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={filters.isActive?.toString() || 'all'}
                      onValueChange={(value) => handleFilterChange('isActive', value === 'true' ? true : value === 'false' ? false : undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                 <div className="space-y-2">
                   <Label>Results</Label>
                   <div className="text-sm text-muted-foreground">
                     {totalCount} badge{totalCount !== 1 ? 's' : ''} found
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>

           {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading badges...</p>
            </div>
          ) : badges.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No badges found</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4"
                >
                  Create your first badge
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge) => (
                <Card key={badge.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{badge.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {badge.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* TODO: View badge details */}}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* TODO: Edit badge */}}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBadge(badge.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <BadgeComponent
                        className={rarityColors[badge.rarity]}
                      >
                        {badge.rarity}
                      </BadgeComponent>
                      <BadgeComponent variant="secondary">
                        {badge.points} pts
                      </BadgeComponent>
                      {badge.maxToObtain && (
                        <BadgeComponent variant="outline">
                          Max: {badge.maxToObtain}
                        </BadgeComponent>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>
                        {badge.isActive ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-red-600">Inactive</span>
                        )}
                      </span>
                      {badge.created_at && (
                        <span>
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
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Create New Badge</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  ×
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
