'use client';

import { useState, useEffect } from 'react';
import { LeaderboardEntry, LeaderboardResponse } from '@/lib/types';
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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await QuestService.getLeaderboard();
        // Transform API response to match component expectations
        const transformedData: LeaderboardEntry[] = response.data.users.map((user, index) => ({
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

  const getRankChange = (entry: LeaderboardEntry) => {
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
          <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent drop-shadow-sm" style={{fontFamily: 'monospace', letterSpacing: '2px'}}>LEADERBOARD</h1>
          <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
        </div>
        <p className="text-muted-foreground font-mono text-sm tracking-wide">
          🎮 COMPETE WITH OTHER PLAYERS AND CLIMB THE RANKS! 🎮
        </p>
        {userRank && (
          <Card className="max-w-md mx-auto bg-gradient-to-r from-cyan-100 via-blue-100 to-purple-100 dark:from-cyan-900/30 dark:via-blue-900/30 dark:to-purple-900/30 border-2 border-dashed border-blue-300 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span className="font-mono font-semibold text-sm tracking-wider">YOUR RANK:</span>
                <span className="text-xl font-bold text-blue-600 font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border-2 border-blue-300">#{userRank}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Period Selection */}
      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="space-y-6">
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            {LEADERBOARD_PERIODS.map((period) => (
              <TabsTrigger key={period.value} value={period.value} className="text-xs">
                {period.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {LEADERBOARD_PERIODS.map((period) => (
          <TabsContent key={period.value} value={period.value} className="space-y-6">
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {/* 2nd Place */}
                <div className="md:order-1 md:mt-8">
                  <Card className="text-center bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border-2 border-slate-400 shadow-lg transform hover:scale-105 transition-transform">
                    <CardContent className="p-6">
                      <div className="relative mb-4">
                        <Avatar className="w-16 h-16 mx-auto border-4 border-slate-400 shadow-md">
                          <AvatarImage src={leaderboard[1].user.avatar} />
                          <AvatarFallback className="font-mono font-bold">{getInitials(leaderboard[1].user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-500 border-2 border-white rounded-sm flex items-center justify-center text-white font-bold font-mono shadow-md">
                          2
                        </div>
                      </div>
                      <h3 className="font-mono font-semibold text-lg tracking-wide">{leaderboard[1].user.name}</h3>
                      <p className="text-2xl font-bold text-slate-600 font-mono">{leaderboard[1].totalPoints.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">POINTS</p>
                      {leaderboard[1].recentPoints > 0 && (
                        <Badge variant="outline" className="mt-2 font-mono border-2 border-dashed">
                          +{leaderboard[1].recentPoints} recent
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* 1st Place */}
                <div className="md:order-2">
                  <Card className="text-center bg-gradient-to-b from-yellow-100 via-yellow-200 to-orange-200 dark:from-yellow-900/40 dark:via-yellow-800/40 dark:to-orange-800/40 border-4 border-yellow-400 shadow-2xl transform hover:scale-110 transition-transform">
                    <CardContent className="p-6">
                      <div className="relative mb-4">
                        <Avatar className="w-20 h-20 mx-auto border-4 border-yellow-500 shadow-lg">
                          <AvatarImage src={leaderboard[0].user.avatar} />
                          <AvatarFallback className="font-mono font-bold text-lg">{getInitials(leaderboard[0].user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 border-2 border-white rounded-sm flex items-center justify-center shadow-lg">
                          <Crown className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      </div>
                      <h3 className="font-mono font-bold text-xl tracking-wide bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{leaderboard[0].user.name}</h3>
                      <p className="text-3xl font-bold text-yellow-600 font-mono drop-shadow-sm">{leaderboard[0].totalPoints.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">👑 CHAMPION 👑</p>
                      {leaderboard[0].recentPoints > 0 && (
                        <Badge className="mt-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 font-mono border-2 border-yellow-300 shadow-md">
                          +{leaderboard[0].recentPoints} recent
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* 3rd Place */}
                <div className="md:order-3 md:mt-8">
                  <Card className="text-center bg-gradient-to-b from-orange-100 to-amber-200 dark:from-orange-900/30 dark:to-amber-800/30 border-2 border-amber-400 shadow-lg transform hover:scale-105 transition-transform">
                    <CardContent className="p-6">
                      <div className="relative mb-4">
                        <Avatar className="w-16 h-16 mx-auto border-4 border-amber-400 shadow-md">
                          <AvatarImage src={leaderboard[2].user.avatar} />
                          <AvatarFallback className="font-mono font-bold">{getInitials(leaderboard[2].user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-600 border-2 border-white rounded-sm flex items-center justify-center text-white font-bold font-mono shadow-md">
                          3
                        </div>
                      </div>
                      <h3 className="font-mono font-semibold text-lg tracking-wide">{leaderboard[2].user.name}</h3>
                      <p className="text-2xl font-bold text-amber-600 font-mono">{leaderboard[2].totalPoints.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">POINTS</p>
                      {leaderboard[2].recentPoints > 0 && (
                        <Badge variant="outline" className="mt-2 font-mono border-2 border-dashed">
                          +{leaderboard[2].recentPoints} recent
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Full Leaderboard */}
            <Card className="border-2 border-dashed border-gray-300 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800">
                <CardTitle className="flex items-center gap-2 font-mono tracking-wide">
                  <Users className="w-5 h-5 text-blue-500" />
                  🏆 ALL RANKINGS - {period.label.toUpperCase()} 🏆
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.user.id}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-lg transition-all hover:bg-muted hover:scale-[1.02] border border-transparent hover:border-dashed hover:border-gray-300',
                        entry.rank <= 3 && 'bg-gradient-to-r from-yellow-50/70 via-orange-50/50 to-transparent dark:from-yellow-900/20 dark:via-orange-900/10 border-yellow-200 dark:border-yellow-800'
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
                          <h4 className="font-mono font-semibold tracking-wide">{entry.user.name}</h4>
                          <p className="text-sm text-muted-foreground font-mono">
                            LVL {entry.user.level} • {entry.user.completedQuests.length} QUESTS ✓
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="font-bold text-lg font-mono bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{entry.totalPoints.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground font-mono uppercase tracking-wider">PTS</div>
                      </div>

                      {/* Recent Activity */}
                      {entry.recentPoints > 0 && (
                        <Badge variant="outline" className="text-green-600 border-green-300 font-mono border-2 border-dashed animate-pulse">
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
              <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 transform hover:scale-105 transition-transform">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-2 drop-shadow-md" />
                  <div className="text-2xl font-bold font-mono text-blue-600">{leaderboard.length}</div>
                  <div className="text-sm text-muted-foreground font-mono uppercase tracking-wider">🎮 PLAYERS</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-dashed border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 transform hover:scale-105 transition-transform">
                <CardContent className="p-6 text-center">
                  <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2 drop-shadow-md animate-pulse" />
                  <div className="text-2xl font-bold font-mono text-yellow-600">
                    {Math.round(leaderboard.reduce((sum, entry) => sum + entry.totalPoints, 0) / leaderboard.length).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono uppercase tracking-wider">⭐ AVG PTS</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-dashed border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 transform hover:scale-105 transition-transform">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2 drop-shadow-md" />
                  <div className="text-2xl font-bold font-mono text-green-600">
                    {leaderboard.filter(entry => entry.recentPoints > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono uppercase tracking-wider">🔥 ACTIVE</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}