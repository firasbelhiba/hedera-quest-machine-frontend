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
  { value: 'getting-started', label: 'Getting Startedddd' },
  { value: 'defi', label: 'DeFi' },
  { value: 'nfts', label: 'NFTs' },
  { value: 'development', label: 'Development' },
  { value: 'consensus', label: 'Consensus' },
  { value: 'smart-contracts', label: 'Smart Contracts' },
  { value: 'token-service', label: 'Token Service' },
  { value: 'file-service', label: 'File Service' },
];

const difficulties: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
  { value: 'master', label: 'Master' },
];

export function QuestFilters({ filters, onFiltersChange, className }: QuestFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchValue });
  };

  const handleCategoryToggle = (category: QuestCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleDifficultyToggle = (difficulty: Difficulty) => {
    const newDifficulties = filters.difficulties.includes(difficulty)
      ? filters.difficulties.filter((d) => d !== difficulty)
      : [...filters.difficulties, difficulty];
    onFiltersChange({ ...filters, difficulties: newDifficulties });
  };

  const clearFilters = () => {
    setSearchValue('');
    onFiltersChange({
      categories: [],
      difficulties: [],
      search: '',
      showCompleted: false,
    });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.difficulties.length > 0 || // ✅ ajouté
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

        {/* Difficulties */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Difficulties</Label>
          <div className="grid grid-cols-2 gap-2">
            {difficulties.map((difficulty) => (
              <div key={difficulty.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`difficulty-${difficulty.value}`}
                  checked={filters.difficulties.includes(difficulty.value)}
                  onCheckedChange={() => handleDifficultyToggle(difficulty.value)}
                />
                <Label
                  htmlFor={`difficulty-${difficulty.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {difficulty.label}
                </Label>
              </div>
            ))}
          </div>
          {filters.difficulties.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.difficulties.map((difficulty) => {
                const difficultyInfo = difficulties.find((d) => d.value === difficulty);
                return (
                  <Badge
                    key={difficulty}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDifficultyToggle(difficulty)}
                  >
                    {difficultyInfo?.label} ×
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Show Completed */}
        {/* <div className="flex items-center space-x-2">
          <Checkbox
            id="show-completed"
            checked={filters.showCompleted}
            onCheckedChange={(checked) =>
              onFiltersChange({ ...filters, showCompleted: checked as boolean })
            }
          />
          <Label
            htmlFor="show-completed"
            className="text-sm font-normal cursor-pointer"
          >
            Show completed quests
          </Label>
        </div> */}
      </CardContent>
    </Card>
  );
}
