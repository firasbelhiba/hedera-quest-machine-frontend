'use client';

import { Quest } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, Trophy, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface QuestCardProps {
  quest: Quest;
  isCompleted?: boolean;
  progress?: number;
  onSelect: () => void;
}

const categoryColors = {
  'getting-started': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300',
  'defi': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300',
  'nfts': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300',
  'development': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-300',
  'consensus': 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900 dark:text-cyan-300',
  'smart-contracts': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300',
  'token-service': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300',
  'file-service': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300',
  'community': 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-300',
};

const difficultyConfig = {
  beginner: { color: 'text-green-600', stars: 1 },
  easy: { color: 'text-green-600', stars: 1 },
  intermediate: { color: 'text-yellow-600', stars: 2 },
  medium: { color: 'text-yellow-600', stars: 2 },
  advanced: { color: 'text-orange-600', stars: 3 },
  hard: { color: 'text-orange-600', stars: 3 },
  expert: { color: 'text-red-600', stars: 4 },
};

export function QuestCard({ quest, isCompleted = false, progress = 0, onSelect }: QuestCardProps) {
  const categoryColor = quest.category ? categoryColors[quest.category] : '';
  const difficultyInfo = difficultyConfig[quest.difficulty] || { color: 'text-gray-600', stars: 1 };

  const handleQuestSelect = () => {
    onSelect();
  };

  return (
    <Card className={cn(
      'group cursor-pointer transition-all duration-200 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[-2px] hover:translate-y-[-2px] border-2 border-dashed hover:border-solid',
      'bg-gradient-to-br from-background via-background to-muted/20',
      isCompleted && 'ring-2 ring-green-500/20 bg-gradient-to-br from-green-50/50 via-background to-green-50/20 dark:from-green-950/20 dark:to-green-950/10 border-green-300 dark:border-green-700'
    )}>
      <div className="relative p-4">
        {isCompleted && (
          <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 border-2 border-green-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] flex items-center justify-center animate-pulse z-10">
            <Trophy className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      
      <CardContent className="p-4 relative bg-gradient-to-b from-transparent to-primary/5">
        
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors font-mono">
            {quest.title}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground ml-2 bg-muted/30 px-2 py-1 rounded border border-dashed font-mono">
            <Trophy className="w-4 h-4 mr-1" />
            {quest.points}pts
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
          {quest.description}
        </p>
        
        <div className="flex items-center justify-between text-sm bg-muted/20 p-2 rounded border border-dashed">
          <div className="flex items-center space-x-4 font-mono">
            <div className="flex items-center text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              {quest.estimatedTime}
            </div>
            <div className="flex items-center text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              {quest.completions}
            </div>
          </div>
          
          <div className="flex items-center space-x-1 bg-background/50 px-2 py-1 rounded border border-dashed">
            {Array.from({ length: 4 }, (_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-3 h-3 transition-all duration-200',
                  i < difficultyInfo.stars 
                    ? `${difficultyInfo.color} fill-current drop-shadow-sm` 
                    : 'text-muted-foreground'
                )}
              />
            ))}
          </div>
        </div>

        {progress > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          className={cn(
            "w-full font-mono border-2 border-dashed hover:border-solid transition-all duration-200",
            "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[-1px] hover:translate-y-[-1px]",
            isCompleted && "bg-gradient-to-r from-green-500/10 to-green-600/10 hover:from-green-500/20 hover:to-green-600/20"
          )}
          variant={isCompleted ? "outline" : "default"}
          onClick={onSelect}
        >
          {isCompleted ? '🏆 View Details' : '🚀 Start Quest'}
        </Button>
      </CardFooter>
    </Card>
  );
}