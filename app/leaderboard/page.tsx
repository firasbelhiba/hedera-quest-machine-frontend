'use client';

import { useState, useEffect } from 'react';
import { LeaderboardEntry } from '@/lib/types';
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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await QuestService.getLeaderboard();
        setLeaderboard(data);
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
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <Trophy className="w-8 h-8 text-yellow-500" />
        </div>
        <p className="text-muted-foreground">
          Compete with other learners and climb the ranks!
        </p>
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
                  <Card className="text-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-300">
                    <CardContent className="p-6">
                      <div className="relative mb-4">
                        <Avatar className="w-16 h-16 mx-auto border-4 border-gray-300">
                          <AvatarImage src={leaderboard[1].user.avatar} />
                          <AvatarFallback>{getInitials(leaderboard[1].user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                          2
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg">{leaderboard[1].user.name}</h3>
                      <p className="text-2xl font-bold text-gray-600">{leaderboard[1].totalPoints.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">points</p>
                      {leaderboard[1].recentPoints > 0 && (
                        <Badge variant="outline" className="mt-2">
                          +{leaderboard[1].recentPoints} recent
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* 1st Place */}
                <div className="md:order-2">
                  <Card className="text-center bg-gradient-to-b from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-300 shadow-lg">
                    <CardContent className="p-6">
                      <div className="relative mb-4">
                        <Avatar className="w-20 h-20 mx-auto border-4 border-yellow-400">
                          <AvatarImage src={leaderboard[0].user.avatar} />
                          <AvatarFallback>{getInitials(leaderboard[0].user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                          <Crown className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <h3 className="font-bold text-xl">{leaderboard[0].user.name}</h3>
                      <p className="text-3xl font-bold text-yellow-600">{leaderboard[0].totalPoints.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">points</p>
                      {leaderboard[0].recentPoints > 0 && (
                        <Badge className="mt-2 bg-yellow-500 hover:bg-yellow-600">
                          +{leaderboard[0].recentPoints} recent
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* 3rd Place */}
                <div className="md:order-3 md:mt-8">
                  <Card className="text-center bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-300">
                    <CardContent className="p-6">
                      <div className="relative mb-4">
                        <Avatar className="w-16 h-16 mx-auto border-4 border-amber-300">
                          <AvatarImage src={leaderboard[2].user.avatar} />
                          <AvatarFallback>{getInitials(leaderboard[2].user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                          3
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg">{leaderboard[2].user.name}</h3>
                      <p className="text-2xl font-bold text-amber-600">{leaderboard[2].totalPoints.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">points</p>
                      {leaderboard[2].recentPoints > 0 && (
                        <Badge variant="outline" className="mt-2">
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
                        'flex items-center gap-4 p-4 rounded-lg transition-colors hover:bg-muted',
                        entry.rank <= 3 && 'bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10'
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
                            Level {entry.user.level} • {entry.user.completedQuests.length} quests completed
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="font-bold text-lg">{entry.totalPoints.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">points</div>
                      </div>

                      {/* Recent Activity */}
                      {entry.recentPoints > 0 && (
                        <Badge variant="outline" className="text-green-600 border-green-300">
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
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{leaderboard.length}</div>
                  <div className="text-sm text-muted-foreground">Active Learners</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {Math.round(leaderboard.reduce((sum, entry) => sum + entry.totalPoints, 0) / leaderboard.length).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Points</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {leaderboard.filter(entry => entry.recentPoints > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Recently Active</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}