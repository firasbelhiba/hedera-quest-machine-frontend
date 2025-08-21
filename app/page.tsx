'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QuestService } from '@/lib/services';
import { DashboardStats, Quest, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Users, TrendingUp, Clock, Zap, Star, ArrowRight, Siren as Fire } from 'lucide-react';
import { QuestCard } from '@/components/quests/quest-card';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [featuredQuests, setFeaturedQuests] = useState<Quest[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, questsData, userData] = await Promise.all([
          QuestService.getDashboardStats(),
          QuestService.getQuests(),
          QuestService.getCurrentUser()
        ]);
        
        // Redirect admin users to admin dashboard
        if (userData?.role === 'admin') {
          router.push('/admin');
          return;
        }
        
        setStats(statsData);
        setFeaturedQuests(questsData.slice(0, 4));
        setUser(userData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-blue-500/10 rounded-lg" />
        <div className="relative bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent font-mono">
                🚀 Welcome back!
              </h1>
              <p className="text-muted-foreground font-mono text-sm mt-2">
                {'>'} Ready to continue your Hedera journey? Streak: {user?.streak || 0} days
              </p>
            </div>
            {user?.role !== 'admin' && (
              <div className="text-right bg-gradient-to-br from-primary/5 to-cyan-500/5 p-4 rounded-lg border border-dashed border-primary/20">
                <div className="text-3xl font-bold font-mono bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  {user?.points?.toLocaleString() || 0}
                </div>
                <div className="text-muted-foreground text-sm font-mono">TOTAL_POINTS</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-dashed border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 hover:border-solid transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500/10 rounded-lg border border-dashed border-yellow-500/30">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">LEVEL</p>
                <p className="text-2xl font-bold font-mono">{user?.userLevel?.level || user?.level || 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-red-500/20 bg-gradient-to-br from-red-500/5 to-pink-500/5 hover:border-solid transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-500/10 rounded-lg border border-dashed border-red-500/30">
                <Fire className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">STREAK</p>
                <p className="text-2xl font-bold font-mono">{user?.streak || 0}<span className="text-sm ml-1">days</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 hover:border-solid transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/10 rounded-lg border border-dashed border-green-500/30">
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">COMPLETED</p>
                <p className="text-2xl font-bold font-mono">{user?.completedQuests?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 hover:border-solid transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/10 rounded-lg border border-dashed border-purple-500/30">
                <Star className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">BADGES</p>
                <p className="text-2xl font-bold font-mono">{user?.badges?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Next Level */}
      <Card className="border-2 border-dashed border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 hover:border-solid transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
          <CardTitle className="flex items-center gap-2 font-mono">
            <div className="p-1 bg-yellow-500/20 rounded border border-dashed border-yellow-500/40">
              <Zap className="w-4 h-4 text-yellow-500" />
            </div>
            ⚡ LEVEL_PROGRESS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 mt-2">
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-mono">
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent font-bold">
                LVL_{user?.userLevel?.level || user?.level || 1}
              </span>
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent font-bold">
                LVL_{(user?.userLevel?.level || user?.level || 1) + 1}
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={user?.userLevel ? (user.userLevel.progress / user.userLevel.max_progress) * 100 : 0} 
                className="h-4 border border-dashed border-primary/20" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full" />
            </div>
            <div className="flex justify-between text-xs font-mono text-muted-foreground">
              <span>{user?.userLevel?.progress || 0} XP</span>
              <span>{user?.userLevel?.max_progress || 100} XP</span>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              {'>'} Earn {(user?.userLevel?.max_progress || 100) - (user?.userLevel?.progress || 0)} more XP to reach the next level
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Featured Quests */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent font-mono">
            🎮 Featured Quests
          </h2>
          <Link href="/quests">
            <Button 
              variant="outline" 
              className="gap-2 border-2 border-dashed hover:border-solid transition-all duration-200 font-mono bg-gradient-to-r from-primary/5 to-blue-500/5 hover:shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)]"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {featuredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              isCompleted={user?.completedQuests?.includes(String(quest.id))}
              onSelect={() => {
                // Navigate to quest details
                router.push(`/quests/${quest.id}`);
              }}
            />
          ))}
        </div>
      </div>

      {/* Platform Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-dashed border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 hover:border-solid transition-all duration-200">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
              <CardTitle className="flex items-center gap-2 font-mono">
                <div className="p-1 bg-blue-500/20 rounded border border-dashed border-blue-500/40">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                👥 COMMUNITY
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold font-mono bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  {stats.totalUsers.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground font-mono">Active learners</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 hover:border-solid transition-all duration-200">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
              <CardTitle className="flex items-center gap-2 font-mono">
                <div className="p-1 bg-green-500/20 rounded border border-dashed border-green-500/40">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                📈 SUCCESS_RATE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold font-mono bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  {stats.approvalRate}%
                </div>
                <p className="text-sm text-muted-foreground font-mono">Quest completion rate</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 hover:border-solid transition-all duration-200">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
              <CardTitle className="flex items-center gap-2 font-mono">
                <div className="p-1 bg-purple-500/20 rounded border border-dashed border-purple-500/40">
                  <Clock className="w-4 h-4 text-purple-500" />
                </div>
                ⏱️ AVG_TIME
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold font-mono bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  {stats.avgCompletionTime}h
                </div>
                <p className="text-sm text-muted-foreground font-mono">Per quest completion</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Popular Categories */}
      {stats && (
        <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 hover:border-solid transition-all duration-200">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10">
            <CardTitle className="font-mono bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              📊 POPULAR_CATEGORIES
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularCategories.map((category) => (
                <div key={category.category} className="flex items-center justify-between p-3 bg-gradient-to-r from-background/50 to-muted/20 rounded-lg border border-dashed border-primary/10 hover:border-solid transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className="capitalize font-mono border-dashed bg-gradient-to-r from-primary/10 to-blue-500/10 hover:border-solid transition-all duration-200"
                    >
                      {category.category.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {category.count} quests
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}