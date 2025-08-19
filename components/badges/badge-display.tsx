'use client';

import { Badge as BadgeType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BadgeDisplayProps {
  badge: BadgeType;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
  showImage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDate?: boolean;
}

const rarityColors = {
  common: 'bg-gray-100 text-gray-800 border-gray-200',
  rare: 'bg-blue-100 text-blue-800 border-blue-200',
  epic: 'bg-purple-100 text-purple-800 border-purple-200',
  legendary: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const rarityGradients = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-yellow-600',
};

export function BadgeDisplay({ 
  badge, 
  variant = 'default', 
  className,
  showImage = true,
  size = 'md',
  showDate = false
}: BadgeDisplayProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {showImage && badge.image && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r overflow-hidden">
            <img 
              src={badge.image} 
              alt={badge.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{badge.name}</p>
          <Badge 
            className={cn('text-xs', rarityColors[badge.rarity])}
            variant="outline"
          >
            {badge.rarity}
          </Badge>
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className={cn('hover:shadow-md transition-shadow', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {showImage && (
              <div className={cn(
                'w-12 h-12 rounded-full bg-gradient-to-r flex items-center justify-center text-white font-bold text-lg',
                rarityGradients[badge.rarity]
              )}>
                {badge.image ? (
                  <img 
                    src={badge.image} 
                    alt={badge.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  badge.name.charAt(0).toUpperCase()
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">{badge.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {badge.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={rarityColors[badge.rarity]}>
              {badge.rarity}
            </Badge>
            {badge.points && (
              <Badge variant="secondary">
                {badge.points} pts
              </Badge>
            )}
            {badge.maxToObtain && (
              <Badge variant="outline">
                Max: {badge.maxToObtain}
              </Badge>
            )}
          </div>
          {badge.earnedAt && (
            <p className="text-sm text-muted-foreground">
              Earned: {new Date(badge.earnedAt).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {showImage && (
            <div className={cn(
              'w-10 h-10 rounded-full bg-gradient-to-r flex items-center justify-center text-white font-bold',
              rarityGradients[badge.rarity]
            )}>
              {badge.image ? (
                <img 
                  src={badge.image} 
                  alt={badge.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                badge.name.charAt(0).toUpperCase()
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">{badge.name}</CardTitle>
            <CardDescription className="line-clamp-1">
              {badge.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          <Badge className={rarityColors[badge.rarity]}>
            {badge.rarity}
          </Badge>
          {badge.points && (
            <Badge variant="secondary">
              {badge.points} pts
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Collection component for displaying multiple badges
interface BadgeCollectionProps {
  badges: BadgeType[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  showDate?: boolean;
}

export function BadgeCollection({ badges, maxDisplay = 12, size = 'md', showDate = false }: BadgeCollectionProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayBadges.map((badge) => (
          <BadgeDisplay 
            key={badge.id} 
            badge={badge} 
            size={size}
            showDate={showDate}
          />
        ))}
      </div>

      {remainingCount > 0 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            +{remainingCount} more badges
          </p>
        </div>
      )}
    </div>
  );
}