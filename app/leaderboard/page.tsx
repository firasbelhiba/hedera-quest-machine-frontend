'use client';

import { useState, useEffect } from 'react';
import { LeaderboardEntry, LeaderboardResponse } from '@/lib/types';

// Local interface for component usage
interface LeaderboardDisplayEntry {
  rank: number;
  user: {
    id: number;
    name: string;
    username: string;
    email: string;
    avatar: string;
    level: number;
    completedQuests: any[];
  };
  totalPoints: number;
  recentPoints: number;
  previousRank: number | null;
}
import { QuestService } from '@/lib/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Star,
  Users,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LEADERBOARD_PERIODS = [
  { value: 'all-time', label: 'All Time' },
  { value: 'this-month', label: 'This Month' },
  { value: 'this-week', label: 'This Week' },
  { value: 'today', label: 'Today' }
];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardDisplayEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await QuestService.getLeaderboard();
        // Transform API response to match component expectations
        const transformedData: LeaderboardDisplayEntry[] = response.data.users.map((user, index) => ({
          rank: index + 1,
          user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            username: user.username,
            email: user.email,
            avatar: '', // API doesn't provide avatar
            level: 1, // Default level since API doesn't provide it
            completedQuests: [] // Default empty array since API doesn't provide it
          },
          totalPoints: user.total_points,
          recentPoints: 0, // API doesn't provide recent points
          previousRank: null // API doesn't provide previous rank
        }));
        setLeaderboard(transformedData);
        setUserRank(response.data.rank);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, [selectedPeriod]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Trophy className="w-6 h-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">#{rank}</div>;
    }
  };

  const getRankChange = (entry: LeaderboardDisplayEntry) => {
    if (!entry.previousRank) return null;
    
    const change = entry.previousRank - entry.rank;
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (change < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground">
          Compete with other players and climb the ranks!
        </p>
        {userRank && (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2">
                <span className="font-semibold">Your Rank:</span>
                <span className="text-xl font-bold">#{userRank}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Period Selection */}
      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {LEADERBOARD_PERIODS.map((period) => (
            <TabsTrigger key={period.value} value={period.value}>
              {period.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {LEADERBOARD_PERIODS.map((period) => (
          <TabsContent key={period.value} value={period.value} className="space-y-6">
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {/* 2nd Place */}
                <div className="md:order-1 md:mt-8">
                  <Card className="text-center border-2 border-dashed border-gray-400 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:border-solid transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/25">
                    <CardContent className="p-6">
                      <div className="relative mb-4">
                        <Avatar className="w-16 h-16 mx-auto border-2 border-dashed border-gray-400">
                          <AvatarImage src={leaderboard[1].user.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-gray-500 to-gray-600 text-white font-mono">{getInitials(leaderboard[1].user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 border-2 border-dashed border-gray-400 rounded flex items-center justify-center text-sm font-bold text-white">
                          2
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg font-mono tracking-wide text-gray-700 dark:text-gray-300">{leaderboard[1].user.name}</h3>
                      <p className="text-2xl font-bold font-mono bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent">{leaderboard[1].totalPoints.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">SILVER_MEDAL</p>
                      {leaderboard[1].recentPoints > 0 && (
                        <Badge variant="outline" className="mt-2 border-2 border-dashed border-gray-400 bg-gray-100 text-gray-700 font-mono">
                          +{leaderboard[1].recentPoints} recent
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* 1st Place */}
                <div className="md:order-2">
                  <Card className="text-center border-4 border-dashed border-yellow-400 bg-gradient-to-br from-yellow-100 via-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:via-yellow-800/20 dark:to-orange-900/30 hover:border-solid transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/50 hover:scale-105">
                    <CardContent className="p-6">
                      <div className="relative mb-4">
                        <Avatar className="w-20 h-20 mx-auto border-4 border-dashed border-yellow-400">
                          <AvatarImage src={leaderboard[0].user.avatar} />
                          <AvatarFallback className="text-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-mono">{getInitials(leaderboard[0].user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 border-4 border-dashed border-yellow-400 rounded flex items-center justify-center animate-pulse">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <h3 className="font-bold text-xl font-mono tracking-wide bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{leaderboard[0].user.name}</h3>
                      <p className="text-3xl font-bold font-mono bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">{leaderboard[0].totalPoints.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">CHAMPION</p>
                      {leaderboard[0].recentPoints > 0 && (
                        <Badge className="mt-2 bg-gradient-to-r from-yellow-500 to-orange-500 border-2 border-dashed border-yellow-400 text-white font-mono">
                          +{leaderboard[0].recentPoints} recent
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* 3rd Place */}
                <div className="md:order-3 md:mt-8">
                  <Card className="text-center border-2 border-dashed border-amber-600 bg-gradient-to-br from-amber-100 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 hover:border-solid transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25">
                    <CardContent className="p-6">
                      <div className="relative mb-4">
                        <Avatar className="w-16 h-16 mx-auto border-2 border-dashed border-amber-600">
                          <AvatarImage src={leaderboard[2].user.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-mono">{getInitials(leaderboard[2].user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-600 to-orange-600 border-2 border-dashed border-amber-600 rounded flex items-center justify-center text-sm font-bold text-white">
                          3
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg font-mono tracking-wide text-amber-700 dark:text-amber-300">{leaderboard[2].user.name}</h3>
                      <p className="text-2xl font-bold font-mono bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{leaderboard[2].totalPoints.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">BRONZE_MEDAL</p>
                      {leaderboard[2].recentPoints > 0 && (
                        <Badge variant="outline" className="mt-2 border-2 border-dashed border-amber-600 bg-amber-100 text-amber-700 font-mono">
                          +{leaderboard[2].recentPoints} recent
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Full Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  All Rankings - {period.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.user.id}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-lg hover:bg-muted border',
                        entry.rank <= 3 && 'bg-muted/50'
                      )}
                    >
                      {/* Rank */}
                      <div className="flex items-center gap-2 w-12">
                        {getRankIcon(entry.rank)}
                        {getRankChange(entry)}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar>
                          <AvatarImage src={entry.user.avatar} />
                          <AvatarFallback>{getInitials(entry.user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{entry.user.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {entry.user.completedQuests.length} Quests Completed
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="font-bold text-lg">{entry.totalPoints.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Points</div>
                      </div>

                      {/* Recent Activity */}
                      {entry.recentPoints > 0 && (
                        <Badge variant="outline">
                          +{entry.recentPoints}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{leaderboard.length}</div>
                  <div className="text-sm text-muted-foreground">Players</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {Math.round(leaderboard.reduce((sum, entry) => sum + entry.totalPoints, 0) / leaderboard.length).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Points</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {leaderboard.filter(entry => entry.recentPoints > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Players</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}