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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

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

  // Mock data for charts
  const categoryData = stats?.popularCategories.map(cat => ({
    name: cat.category.replace('-', ' '),
    value: cat.count
  })) || [];

  const submissionData = [
    { name: 'Approved', value: 245, color: '#10b981' },
    { name: 'Pending', value: 67, color: '#f59e0b' },
    { name: 'Needs Revision', value: 23, color: '#ef4444' },
    { name: 'Rejected', value: 12, color: '#6b7280' }
  ];

  const activityData = [
    { date: 'Jan 1', users: 120, submissions: 45 },
    { date: 'Jan 2', users: 145, submissions: 52 },
    { date: 'Jan 3', users: 167, submissions: 61 },
    { date: 'Jan 4', users: 198, submissions: 78 },
    { date: 'Jan 5', users: 234, submissions: 89 },
    { date: 'Jan 6', users: 267, submissions: 95 },
    { date: 'Jan 7', users: 289, submissions: 102 }
  ];

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
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform management and analytics</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground">+12% from last month</div>
              <Progress value={75} className="h-2 mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Quests</p>
                <p className="text-2xl font-bold">{stats?.activeQuests}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground">+3 new this week</div>
              <Progress value={65} className="h-2 mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submissions</p>
                <p className="text-2xl font-bold">{stats?.totalSubmissions}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground">87 pending review</div>
              <Progress value={90} className="h-2 mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approval Rate</p>
                <p className="text-2xl font-bold">{stats?.approvalRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground">+2.5% this week</div>
              <Progress value={87} className="h-2 mt-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="submissions" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  Pending Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Submissions to review</span>
                  <Badge variant="outline">67</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">New quest proposals</span>
                  <Badge variant="outline">3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">User reports</span>
                  <Badge variant="outline">2</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">System alerts</span>
                  <Badge variant="outline">1</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>API Response Time</span>
                    <span className="text-green-600">245ms</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Database Performance</span>
                    <span className="text-green-600">Good</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Server Uptime</span>
                    <span className="text-green-600">99.9%</span>
                  </div>
                  <Progress value={99} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Submission Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Submission Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
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
                    >
                      {submissionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Submission Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Review Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <div className="font-medium">Approved</div>
                    <div className="text-sm text-muted-foreground">245 submissions</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">70%</div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <div className="flex-1">
                    <div className="font-medium">Pending Review</div>
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
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