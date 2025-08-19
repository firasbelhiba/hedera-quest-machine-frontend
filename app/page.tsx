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
      <div className="bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name}! 🚀</h1>
            <p className="text-purple-100 mt-1">
              Ready to continue your Hedera journey? You're on a {user?.streak || 0} day streak!
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{user?.points?.toLocaleString() || 0}</div>
            <div className="text-purple-200 text-sm">Total Points</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Level</p>
                <p className="text-2xl font-bold">{user?.level || 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Fire className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">{user?.streak || 0} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{user?.completedQuests?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Badges</p>
                <p className="text-2xl font-bold">{user?.badges?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Next Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Level {user?.level || 1}</span>
              <span>Level {(user?.level || 1) + 1}</span>
            </div>
            <Progress value={75} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Earn 150 more points to reach the next level
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Featured Quests */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Quests</h2>
          <Link href="/quests">
            <Button variant="outline" className="gap-2">
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
                window.location.href = `/quests/${quest.id}`;
              }}
            />
          ))}
        </div>
      </div>

      {/* Platform Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Active learners</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{stats.approvalRate}%</div>
                <p className="text-sm text-muted-foreground">Quest completion rate</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                Avg. Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{stats.avgCompletionTime}h</div>
                <p className="text-sm text-muted-foreground">Per quest completion</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Popular Categories */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularCategories.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="capitalize">
                      {category.category.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
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