'use client';

import { Badge as BadgeType, BadgeRarity } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Crown, Gem, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeDisplayProps {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showDate?: boolean;
  className?: string;
}

const rarityConfig: Record<BadgeRarity, {
  color: string;
  icon: React.ComponentType<any>;
  gradient: string;
  glow: string;
}> = {
  common: {
    color: 'text-gray-600 dark:text-gray-400',
    icon: Trophy,
    gradient: 'from-gray-400 to-gray-600',
    glow: 'shadow-gray-500/20'
  },
  uncommon: {
    color: 'text-green-600 dark:text-green-400',
    icon: Star,
    gradient: 'from-green-400 to-green-600',
    glow: 'shadow-green-500/30'
  },
  rare: {
    color: 'text-blue-600 dark:text-blue-400',
    icon: Gem,
    gradient: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-500/30'
  },
  epic: {
    color: 'text-purple-600 dark:text-purple-400',
    icon: Crown,
    gradient: 'from-purple-400 to-purple-600',
    glow: 'shadow-purple-500/40'
  },
  legendary: {
    color: 'text-yellow-600 dark:text-yellow-400',
    icon: Zap,
    gradient: 'from-yellow-400 via-orange-500 to-red-500',
    glow: 'shadow-yellow-500/50'
  }
};

const sizeConfig = {
  sm: {
    container: 'w-16 h-16',
    icon: 'w-6 h-6',
    title: 'text-xs',
    description: 'text-xs',
    date: 'text-xs'
  },
  md: {
    container: 'w-20 h-20',
    icon: 'w-8 h-8',
    title: 'text-sm',
    description: 'text-xs',
    date: 'text-xs'
  },
  lg: {
    container: 'w-24 h-24',
    icon: 'w-10 h-10',
    title: 'text-base',
    description: 'text-sm',
    date: 'text-xs'
  }
};

export function BadgeDisplay({ badge, size = 'md', showDate = true, className }: BadgeDisplayProps) {
  const rarity = rarityConfig[badge.rarity];
  const sizeStyle = sizeConfig[size];
  const IconComponent = rarity.icon;

  return (
    <div className={cn('group relative', className)}>
      <Card className="transition-all duration-300 hover:scale-105 cursor-pointer">
        <CardContent className="p-4 text-center">
          {/* Badge Icon */}
          <div className={cn(
            'mx-auto rounded-full bg-gradient-to-br flex items-center justify-center mb-3 transition-all duration-300 group-hover:shadow-lg',
            sizeStyle.container,
            `bg-gradient-to-br ${rarity.gradient}`,
            `group-hover:${rarity.glow}`
          )}>
            <IconComponent className={cn(sizeStyle.icon, 'text-white')} />
          </div>

          {/* Badge Info */}
          <div className="space-y-1">
            <h3 className={cn('font-semibold', sizeStyle.title)}>
              {badge.name}
            </h3>
            
            <Badge 
              variant="outline" 
              className={cn('text-xs capitalize', rarity.color)}
            >
              {badge.rarity}
            </Badge>

            {size === 'lg' && (
              <p className={cn('text-muted-foreground', sizeStyle.description)}>
                {badge.description}
              </p>
            )}

            {showDate && (
              <p className={cn('text-muted-foreground', sizeStyle.date)}>
                Earned {new Date(badge.earnedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legendary glow effect */}
      {badge.rarity === 'legendary' && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-20 blur-xl animate-pulse -z-10" />
      )}
    </div>
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