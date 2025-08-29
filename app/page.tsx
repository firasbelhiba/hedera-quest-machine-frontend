'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QuestService } from '@/lib/services';
import { DashboardStats, Quest, User, Badge as BadgeType, Submission } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users, TrendingUp, Clock, Zap, ArrowRight, Award, CheckCircle, XCircle, AlertCircle, Calendar, BookOpen, Sparkles } from 'lucide-react';
import { QuestCard } from '@/components/quests/quest-card';
import { FeaturedQuestsSection } from '@/components/quests/featured-quests-section';
import { HeroCarousel } from '@/components/landing/hero-carousel';
import { FeatureHighlights } from '@/components/landing/feature-highlights';
import { StatsOverview } from '@/components/landing/stats-overview';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [featuredQuests, setFeaturedQuests] = useState<Quest[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  const handleQuestSelect = (questId: string) => {
    router.push(`/quests/${questId}`);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check for any existing tokens first
        let hasTokens = false;
        if (typeof window !== 'undefined') {
          const authToken = localStorage.getItem('auth_token');
          const accessToken = localStorage.getItem('access_token');
          const cookieToken = document.cookie.includes('hq_access_token') || document.cookie.includes('access_token');
          hasTokens = !!(authToken || accessToken || cookieToken);
          console.log('Has tokens:', hasTokens, 'Auth token:', !!authToken, 'Access token:', !!accessToken, 'Cookie token:', cookieToken);
        }
        
        // First check if user is authenticated
         let userData = null;
         if (hasTokens) {
           try {
             const response = await QuestService.getCurrentUser();
             // Only set userData if we get a valid response with required fields
             if (response && response.id && response.email) {
               userData = response;
               console.log('Valid user data from API:', userData);
             } else {
               console.log('Invalid user data received:', response);
               userData = null;
             }
           } catch (error) {
             console.log('Authentication failed:', error);
             userData = null;
           }
           
           // If authentication failed but we have tokens, clear them
           if (!userData && typeof window !== 'undefined') {
             localStorage.removeItem('auth_token');
             localStorage.removeItem('access_token');
             localStorage.removeItem('refresh_token');
             document.cookie = 'hq_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
             document.cookie = 'hq_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
             document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
             document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
             console.log('Cleared invalid cached tokens');
           }
         }
        
        // Redirect admin users to admin dashboard
        if (userData?.role === 'admin') {
          router.push('/admin');
          return;
        }
        
        // Load basic data for both authenticated and non-authenticated users
        const [statsData, questsData, completionsData] = await Promise.all([
          QuestService.getDashboardStats().catch(() => null),
          QuestService.getQuests().catch(() => []),
          QuestService.getQuestCompletions().catch(() => ({ quests: [] })) // Fallback if API fails
        ]);
        
        // Create a map of quest completions for quick lookup
        const completionsMap = new Map();
        if (completionsData.quests) {
          completionsData.quests.forEach((quest: any) => {
            completionsMap.set(String(quest.id), quest.completions?.length || 0);
          });
        }

        // Enhance quests with real completion data
        const enhancedQuests = questsData.map(quest => ({
          ...quest,
          completions: completionsMap.get(String(quest.id)) || quest.completions || 0
        }));
        
        setStats(statsData);
        // Filter featured quests to only show active ones
        const activeQuests = enhancedQuests.filter(quest => quest.status === 'active' || quest.status === 'published');
        setFeaturedQuests(activeQuests.slice(0, 6));
        setQuests(enhancedQuests);
        setUser(userData);
        
        // Only load user-specific data if user is authenticated
        if (userData) {
          try {
            const [badgesData, submissionsData] = await Promise.all([
              QuestService.getUserBadges(String(userData.id)).catch(() => []),
              QuestService.getSubmissions(undefined, String(userData.id)).catch(() => [])
            ]);
            setBadges(badgesData || []);
            setSubmissions(submissionsData || []);
          } catch (error) {
            console.error('Failed to load user data:', error);
            setBadges([]);
            setSubmissions([]);
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Ensure user is set to null on error
        setUser(null);
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

  // Debug logging
  console.log('Dashboard render - User state:', user);
  console.log('Dashboard render - Is loading:', isLoading);
  console.log('Dashboard render - Has tokens:', typeof window !== 'undefined' && (
    localStorage.getItem('auth_token') || 
    localStorage.getItem('access_token') || 
    document.cookie.includes('access_token')
  ));

  if (!user) {
    return (
      <div className="space-y-12">
        {/* Hero Carousel for Non-Authenticated Users */}
        <HeroCarousel />
        
        {/* Platform Statistics */}
        <StatsOverview />
        
        {/* Feature Highlights */}
        <FeatureHighlights />
        
        {/* Call to Action */}
        <div className="text-center py-12 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl border-2 border-dashed border-primary/20">
          <div className="space-y-6">
            <div className="text-6xl mb-4">ROCKET</div>
            <h2 className="text-3xl font-bold font-mono bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto">
              {'>'} Join thousands of developers mastering Hedera blockchain development through interactive quests.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="font-mono border-dashed hover:border-solid transition-all duration-200 group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="font-mono border-dashed hover:border-solid transition-all duration-200">
                  Sign In
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => {
                  // Clear any cached tokens
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    document.cookie = 'hq_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    document.cookie = 'hq_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    window.location.reload();
                  }
                }}
                className="font-mono border-dashed hover:border-solid transition-all duration-200"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quest filtering logic for authenticated users
  const completedQuestIds = submissions
    .filter(s => s.status === 'approved')
    .map(s => s.questId);

  const filteredQuests = quests.filter(quest => {
    const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || quest.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || quest.difficulty === selectedDifficulty;
    const isActive = quest.status === 'active' || quest.status === 'published';
    
    return matchesSearch && matchesCategory && matchesDifficulty && isActive;
  });

  const recentActivity = submissions
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  const categories = Array.from(new Set(quests.map(q => q.category).filter(Boolean))) as string[];
  const difficulties = ['beginner', 'intermediate', 'advanced', 'expert', 'master'];

  return (
    <div className="space-y-8">
      {/* Hero Carousel for All Users */}
      <HeroCarousel />
      
      {/* Personalized Welcome Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-blue-500/10 rounded-lg" />
        <div className="relative bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent font-mono">
                  Welcome back, {user?.name}!
                </h1>
              </div>
              <p className="text-muted-foreground font-mono text-sm">
                {'>'} Continue your quest journey • Streak: {user?.streak || 0} days
              </p>
            </div>
            <div className="text-right bg-gradient-to-br from-primary/5 to-cyan-500/5 p-4 rounded-lg border border-dashed border-primary/20">
              <div className="text-3xl font-bold font-mono bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                {user?.total_points?.toLocaleString() || 0}
              </div>
              <div className="text-muted-foreground text-sm font-mono">TOTAL_POINTS</div>
            </div>
          </div>
        </div>
      </div>



      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-lg p-1">
          <TabsTrigger 
            value="overview" 
            className="text-sm font-mono data-[state=active]:bg-background data-[state=active]:text-primary"
          >
            OVERVIEW
          </TabsTrigger>
          <TabsTrigger 
            value="quests" 
            className="text-sm font-mono data-[state=active]:bg-background data-[state=active]:text-primary"
          >
            QUESTS ({filteredQuests.length})
          </TabsTrigger>
          <TabsTrigger 
            value="progress" 
            className="text-sm font-mono data-[state=active]:bg-background data-[state=active]:text-primary"
          >
            PROGRESS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Level Progress - Commented out */}
          {/* <Card className="border-2 border-dashed border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 hover:border-solid transition-all duration-200">
            <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
              <CardTitle className="flex items-center gap-2 font-mono">
                <div className="p-1 bg-yellow-500/20 rounded border border-dashed border-yellow-500/40">
                  <Zap className="w-4 h-4 text-yellow-500" />
                </div>
                LEVEL_PROGRESS
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
              </div>
            </CardContent>
          </Card> */}

          {/* Featured Quests */}
          <FeaturedQuestsSection
            quests={featuredQuests}
            completedQuestIds={completedQuestIds}
            onQuestSelect={(questId) => router.push(`/quests/${questId}`)}
          />


        </TabsContent>

        <TabsContent value="quests" className="space-y-6">
          {/* Quest Filters */}
          <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 hover:border-solid transition-all duration-200">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10">
              <CardTitle className="flex items-center gap-2 font-mono">
                <BookOpen className="w-5 h-5 text-primary" />
                QUEST_EXPLORER
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">SEARCH</label>
                  <Input
                    placeholder="Search quests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="font-mono border-dashed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">CATEGORY</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="font-mono border-dashed">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="capitalize">
                          {category?.replace('-', ' ') || category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">DIFFICULTY</label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="font-mono border-dashed">
                      <SelectValue placeholder="All difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      {difficulties.map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty} className="capitalize">
                          {difficulty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quest Grid */}
          {filteredQuests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuests.map((quest) => (
                <QuestCard 
                  key={quest.id} 
                  quest={quest} 
                  isCompleted={completedQuestIds.includes(String(quest.id))}
                  onSelect={() => handleQuestSelect(String(quest.id))}
                />
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">TARGET</div>
                <h3 className="text-lg font-semibold mb-2 font-mono text-primary">NO_QUESTS_FOUND</h3>
                <p className="text-muted-foreground font-mono text-sm">
                  {'>'} Try adjusting your filters or check back later for new quests.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">CHART</div>
            <h3 className="text-lg font-semibold mb-2 font-mono text-primary">PROGRESS_TRACKING</h3>
            <p className="text-muted-foreground font-mono text-sm">
              {'>'} Detailed progress analytics coming soon.
            </p>
            <Link href="/progress">
              <Button className="mt-4 font-mono border-dashed hover:border-solid transition-all duration-200">
                View Full Progress <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}