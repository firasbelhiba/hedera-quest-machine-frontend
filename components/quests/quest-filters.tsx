'use client';

import { useState } from 'react';
import { FilterOptions, QuestCategory, Difficulty } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}

const categories: { value: QuestCategory; label: string }[] = [
  { value: 'getting-started', label: 'Getting Started' },
  { value: 'defi', label: 'DeFi' },
  { value: 'nfts', label: 'NFTs' },
  { value: 'development', label: 'Development' },
  { value: 'consensus', label: 'Consensus' },
  { value: 'smart-contracts', label: 'Smart Contracts' },
  { value: 'token-service', label: 'Token Service' },
  { value: 'file-service', label: 'File Service' },
];

const difficulties: { value: Difficulty; label: string; color: string }[] = [
  { value: 'beginner', label: 'Beginner', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 border-emerald-200' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-200' },
  { value: 'advanced', label: 'Advanced', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200' },
  { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200' },
  { value: 'master', label: 'Master', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200' },
];

export function QuestFilters({ filters, onFiltersChange, className }: QuestFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchValue });
  };

  const handleCategoryToggle = (category: QuestCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleDifficultyToggle = (difficulty: Difficulty) => {
    const newDifficulties = filters.difficulties.includes(difficulty)
      ? filters.difficulties.filter(d => d !== difficulty)
      : [...filters.difficulties, difficulty];
    onFiltersChange({ ...filters, difficulties: newDifficulties });
  };

  const clearFilters = () => {
    setSearchValue('');
    onFiltersChange({
      categories: [],
      difficulties: [],
      search: '',
      showCompleted: false
    });
  };

  const hasActiveFilters = filters.categories.length > 0 || 
    filters.difficulties.length > 0 || 
    filters.search || 
    filters.showCompleted;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <Label htmlFor="search" className="text-sm font-medium mb-2 block">
            Search Quests
          </Label>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by title or description..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>
        </div>

        {/* Categories */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Categories</Label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <div key={category.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.value}`}
                  checked={filters.categories.includes(category.value)}
                  onCheckedChange={() => handleCategoryToggle(category.value)}
                />
                <Label
                  htmlFor={`category-${category.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {category.label}
                </Label>
              </div>
            ))}
          </div>
          {filters.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.categories.map((category) => {
                const categoryInfo = categories.find(c => c.value === category);
                return (
                  <Badge 
                    key={category} 
                    variant="secondary" 
                    className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {categoryInfo?.label} ×
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Difficulty */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Difficulty</Label>
          <div className="space-y-2">
            {difficulties.map((difficulty) => (
              <div key={difficulty.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`difficulty-${difficulty.value}`}
                  checked={filters.difficulties.includes(difficulty.value)}
                  onCheckedChange={() => handleDifficultyToggle(difficulty.value)}
                />
                <Label
                  htmlFor={`difficulty-${difficulty.value}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  <Badge className={cn('text-xs', difficulty.color)} variant="outline">
                    {difficulty.label}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Show Completed */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-completed"
            checked={filters.showCompleted}
            onCheckedChange={(checked) => 
              onFiltersChange({ ...filters, showCompleted: checked as boolean })
            }
          />
          <Label htmlFor="show-completed" className="text-sm font-normal cursor-pointer">
            Show completed quests
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}