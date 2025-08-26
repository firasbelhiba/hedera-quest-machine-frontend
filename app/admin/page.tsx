// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { DashboardStats } from '@/lib/types';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const RC: any = ResponsiveContainer as any;

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
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

  // Chart data derived from API stats
  const categoryData = stats?.popularCategories.map(cat => ({
    name: cat.category.replace('-', ' '),
    value: cat.count
  })) || [];

  const submissionData = [
    { name: 'Approved', value: stats?.totalSubmissions || 0, color: '#10b981' },
    { name: 'Pending', value: 0, color: '#f59e0b' },
    { name: 'Needs Revision', value: 0, color: '#ef4444' },
    { name: 'Rejected', value: 0, color: '#6b7280' }
  ];

  // Activity data will be populated from API when available
  const activityData: { date: string; users: number; submissions: number; }[] = [];

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
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-lg" />
        <div className="relative bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary/20 rounded-lg p-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg border-2 border-dashed border-primary/30" />
              <div className="relative p-3 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-red-500 to-orange-500 bg-clip-text text-transparent font-mono">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground font-mono text-sm mt-2">
                {'>'} PLATFORM_MANAGEMENT_AND_ANALYTICS
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-dashed border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 hover:border-solid transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-mono uppercase tracking-wider">TOTAL_USERS</p>
                <p className="text-2xl font-bold font-mono bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  {stats?.totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg border border-dashed border-blue-500/30">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground font-mono">+12% FROM_LAST_MONTH</div>
              <div className="relative mt-2">
                <div className="h-2 bg-muted rounded-lg border border-dashed border-blue-500/20" />
                <div className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg transition-all duration-500" style={{width: '75%'}} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 hover:border-solid transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-mono uppercase tracking-wider">ACTIVE_QUESTS</p>
                <p className="text-2xl font-bold font-mono bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  {stats?.activeQuests}
                </p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg border border-dashed border-green-500/30">
                <Target className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground font-mono">+3 NEW_THIS_WEEK</div>
              <div className="relative mt-2">
                <div className="h-2 bg-muted rounded-lg border border-dashed border-green-500/20" />
                <div className="absolute top-0 left-0 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg transition-all duration-500" style={{width: '65%'}} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 hover:border-solid transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-mono uppercase tracking-wider">SUBMISSIONS</p>
                <p className="text-2xl font-bold font-mono bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  {stats?.totalSubmissions}
                </p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg border border-dashed border-purple-500/30">
                <FileText className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground font-mono">87 PENDING_REVIEW</div>
              <div className="relative mt-2">
                <div className="h-2 bg-muted rounded-lg border border-dashed border-purple-500/20" />
                <div className="absolute top-0 left-0 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg transition-all duration-500" style={{width: '90%'}} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 hover:border-solid transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-mono uppercase tracking-wider">APPROVAL_RATE</p>
                <p className="text-2xl font-bold font-mono bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  {stats?.approvalRate}%
                </p>
              </div>
              <div className="p-2 bg-yellow-500/10 rounded-lg border border-dashed border-yellow-500/30">
                <TrendingUp className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground font-mono">+2.5% THIS_WEEK</div>
              <div className="relative mt-2">
                <div className="h-2 bg-muted rounded-lg border border-dashed border-yellow-500/20" />
                <div className="absolute top-0 left-0 h-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg transition-all duration-500" style={{width: '87%'}} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-background/50 border-2 border-dashed border-primary/20 p-1">
          <TabsTrigger value="overview" className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-dashed data-[state=active]:border-primary/30">OVERVIEW</TabsTrigger>
          <TabsTrigger value="users" className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-dashed data-[state=active]:border-primary/30">USERS</TabsTrigger>
          <TabsTrigger value="quests" className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-dashed data-[state=active]:border-primary/30">QUESTS</TabsTrigger>
          <TabsTrigger value="submissions" className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-dashed data-[state=active]:border-primary/30">SUBMISSIONS</TabsTrigger>
          <TabsTrigger value="analytics" className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-dashed data-[state=active]:border-primary/30">ANALYTICS</TabsTrigger>
          <TabsTrigger value="reports" className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-dashed data-[state=active]:border-primary/30">REPORTS</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-dashed border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-mono">
                  <div className="p-1 bg-yellow-500/10 rounded border border-dashed border-yellow-500/30">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  </div>
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    PENDING_ACTIONS
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 border-t-2 border-dashed border-yellow-500/10">
                <div className="flex items-center justify-between p-2 rounded border border-dashed border-yellow-500/20 bg-yellow-500/5">
                  <span className="text-sm font-mono">SUBMISSIONS_TO_REVIEW</span>
                  <Badge variant="outline" className="border-dashed border-yellow-500/30 bg-yellow-500/10 text-yellow-600 font-mono">67</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded border border-dashed border-blue-500/20 bg-blue-500/5">
                  <span className="text-sm font-mono">NEW_QUEST_PROPOSALS</span>
                  <Badge variant="outline" className="border-dashed border-blue-500/30 bg-blue-500/10 text-blue-600 font-mono">3</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded border border-dashed border-red-500/20 bg-red-500/5">
                  <span className="text-sm font-mono">USER_REPORTS</span>
                  <Badge variant="outline" className="border-dashed border-red-500/30 bg-red-500/10 text-red-600 font-mono">2</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded border border-dashed border-purple-500/20 bg-purple-500/5">
                  <span className="text-sm font-mono">SYSTEM_ALERTS</span>
                  <Badge variant="outline" className="border-dashed border-purple-500/30 bg-purple-500/10 text-purple-600 font-mono">1</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
              <CardHeader>
                <CardTitle className="font-mono bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  SYSTEM_HEALTH
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 border-t-2 border-dashed border-green-500/10">
                <div className="space-y-2 p-3 rounded border border-dashed border-green-500/20 bg-green-500/5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono">API_RESPONSE_TIME</span>
                    <span className="text-green-600 font-mono font-bold">245ms</span>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-muted rounded-lg border border-dashed border-green-500/20" />
                    <div className="absolute top-0 left-0 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg transition-all duration-500" style={{width: '85%'}} />
                  </div>
                </div>
                <div className="space-y-2 p-3 rounded border border-dashed border-green-500/20 bg-green-500/5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono">DATABASE_PERFORMANCE</span>
                    <span className="text-green-600 font-mono font-bold">GOOD</span>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-muted rounded-lg border border-dashed border-green-500/20" />
                    <div className="absolute top-0 left-0 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg transition-all duration-500" style={{width: '92%'}} />
                  </div>
                </div>
                <div className="space-y-2 p-3 rounded border border-dashed border-green-500/20 bg-green-500/5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono">SERVER_UPTIME</span>
                    <span className="text-green-600 font-mono font-bold">99.9%</span>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-muted rounded-lg border border-dashed border-green-500/20" />
                    <div className="absolute top-0 left-0 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg transition-all duration-500" style={{width: '99%'}} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="quests" className="space-y-6">
          <QuestManagement />
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
  );
}