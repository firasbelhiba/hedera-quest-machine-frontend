// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
// Removed DashboardStats import as we're using the new API structure
import { QuestService } from '@/lib/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Target, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  XCircle,
  Shield
} from 'lucide-react';
import UserManagement from '@/components/admin/user-management';
import QuestManagement from '@/components/admin/quest-management';
import SubmissionReview from '@/components/admin/submission-review';
import AnalyticsDashboard from '@/components/admin/analytics-dashboard';
import EventManagement from '@/components/admin/event-management';
import BadgeManagement from '@/components/admin/badge-management';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const RC: any = ResponsiveContainer as any;

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const data = await QuestService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  // Extract data from new API response structure
  const dashboardData = stats?.success ? stats.data : null;
  const userData = dashboardData?.userData || { count: 0, lastWeek: 0 };
  const approvalData = dashboardData?.approvalRate || { count: 0, lastWeek: 0 };
  const questSubmissionData = dashboardData?.questSubmissionData || { count: 0, lastWeek: 0 };

  // Create submission data for PieChart
  const submissionData = [
    { name: 'Approved', value: approvalData.count, color: '#10b981' },
    { name: 'Pending', value: Math.max(0, questSubmissionData.count - approvalData.count), color: '#f59e0b' },
    { name: 'Rejected', value: Math.floor(questSubmissionData.count * 0.1), color: '#ef4444' }
  ];

  // Create category data for BarChart
  const categoryData = [
    { name: 'Social Media', value: 45 },
    { name: 'Development', value: 32 },
    { name: 'Community', value: 28 },
    { name: 'Education', value: 21 },
    { name: 'Gaming', value: 18 }
  ];

  // Calculate percentage changes for display
  const userGrowth = userData.count > 0 ? Math.round((userData.lastWeek / userData.count) * 100) : 0;
  const approvalRate = questSubmissionData.count > 0 ? Math.round((approvalData.count / questSubmissionData.count) * 100) : 0;
  const submissionGrowth = questSubmissionData.count > 0 ? Math.round((questSubmissionData.lastWeek / questSubmissionData.count) * 100) : 0;

  // Activity data for charts (placeholder data)
  const activityData: { date: string; users: number; submissions: number; }[] = [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Breadcrumb Navigation */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
            <Shield className="w-4 h-4" />
            <span>ADMIN</span>
            <span>/</span>
            <span className="text-foreground">DASHBOARD</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">


        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/5" />
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-mono text-xs">
                  +{userData.lastWeek}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-blue-600/80 font-mono uppercase tracking-wide">Total Users</h3>
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 font-mono">{userData.count.toLocaleString()}</div>
                <p className="text-xs text-blue-600/60 font-mono">{userData.lastWeek} new this week</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5" />
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 font-mono text-xs">
                  ACTIVE
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-green-600/80 font-mono uppercase tracking-wide">Quest Submissions</h3>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300 font-mono">{questSubmissionData.count}</div>
                <p className="text-xs text-green-600/60 font-mono">{questSubmissionData.lastWeek} this week</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/5" />
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 font-mono text-xs">
                  +{approvalData.lastWeek}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-purple-600/80 font-mono uppercase tracking-wide">Approvals</h3>
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 font-mono">{approvalData.count}</div>
                <p className="text-xs text-purple-600/60 font-mono">{approvalData.lastWeek} this week</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/5" />
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 font-mono text-xs">
                  {approvalRate}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-orange-600/80 font-mono uppercase tracking-wide">Approval Rate</h3>
                <div className="text-3xl font-bold text-orange-700 dark:text-orange-300 font-mono">{approvalRate}%</div>
                <p className="text-xs text-orange-600/60 font-mono">overall rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          {/* Enhanced Tab Navigation */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 rounded-xl" />
            <div className="relative p-2 bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-1 sm:gap-2 bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="overview" 
                  className="relative font-mono text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                    <span className="hidden sm:inline">Overview</span>
                    <span className="sm:hidden">Over</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="relative font-mono text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Users</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="quests" 
                  className="relative font-mono text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Quests</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="badges" 
                  className="relative font-mono text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                    <span>Badges</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="events" 
                  className="relative font-mono text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                    <span>Events</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="submissions" 
                  className="relative font-mono text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Submissions</span>
                    <span className="sm:hidden">Subs</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="relative font-mono text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Analytics</span>
                    <span className="sm:hidden">Stats</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className="relative font-mono text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                    <span className="hidden sm:inline">Reports</span>
                    <span className="sm:hidden">Rep</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          {/* Recent Activity */}
          <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5">
            <CardHeader>
              <CardTitle className="font-mono text-xl bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                RECENT_ACTIVITY
              </CardTitle>
            </CardHeader>
            <CardContent className="border-t-2 border-dashed border-primary/10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-lg border border-dashed border-primary/10" />
                <div className="relative p-4">
                  <RC width="100%" height={300}>
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.2)" />
                      <XAxis dataKey="date" className="font-mono" />
                      <YAxis className="font-mono" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '2px dashed hsl(var(--primary) / 0.3)',
                          borderRadius: '8px',
                          fontFamily: 'monospace'
                        }}
                      />
                      <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={3} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="submissions" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" />
                    </LineChart>
                  </RC>
                </div>
              </div>
            </CardContent>
          </Card>


        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="quests" className="space-y-6">
          <QuestManagement />
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <BadgeManagement />
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <EventManagement />
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <SubmissionReview />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="legacy-submissions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Submission Status Distribution */}
            <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardHeader>
                <CardTitle className="font-mono bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  SUBMISSION_STATUS
                </CardTitle>
              </CardHeader>
              <CardContent className="border-t-2 border-dashed border-primary/10">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg border border-dashed border-primary/10" />
                  <div className="relative p-4">
                    <RC width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={submissionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        >
                          {submissionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '2px dashed hsl(var(--primary) / 0.3)',
                            borderRadius: '8px',
                            fontFamily: 'monospace'
                          }}
                        />
                      </PieChart>
                    </RC>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Stats */}
            <Card className="border-2 border-dashed border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
              <CardHeader>
                <CardTitle className="font-mono bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                  REVIEW_STATISTICS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 border-t-2 border-dashed border-blue-500/10">
                <div className="flex items-center gap-3 p-3 rounded border border-dashed border-green-500/20 bg-green-500/5">
                  <div className="p-1 bg-green-500/10 rounded border border-dashed border-green-500/30">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium font-mono">APPROVED</div>
                    <div className="text-sm text-muted-foreground font-mono">245 SUBMISSIONS</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600 font-mono">70%</div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded border border-dashed border-yellow-500/20 bg-yellow-500/5">
                  <div className="p-1 bg-yellow-500/10 rounded border border-dashed border-yellow-500/30">
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium font-mono">PENDING_REVIEW</div>
                    <div className="text-sm text-muted-foreground">67 submissions</div>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">19%</div>
                </div>

                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <div className="flex-1">
                    <div className="font-medium">Needs Revision</div>
                    <div className="text-sm text-muted-foreground">23 submissions</div>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">7%</div>
                </div>

                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <div className="flex-1">
                    <div className="font-medium">Rejected</div>
                    <div className="text-sm text-muted-foreground">12 submissions</div>
                  </div>
                  <div className="text-2xl font-bold text-red-600">4%</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Category Popularity */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <RC width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </RC>
            </CardContent>
          </Card>

          {/* Platform Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">78%</div>
                  <div className="text-sm text-muted-foreground">
                    Average quest completion rate
                  </div>
                  <Progress value={78} className="h-2 mt-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg. Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stats?.avgCompletionTime}h</div>
                  <div className="text-sm text-muted-foreground">
                    Per quest completion
                  </div>
                  <div className="text-xs text-green-600 mt-2">
                    -0.3h from last month
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">92%</div>
                  <div className="text-sm text-muted-foreground">
                    Weekly active users
                  </div>
                  <div className="text-xs text-green-600 mt-2">
                    +5% from last week
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}