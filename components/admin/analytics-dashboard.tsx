'use client';

// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Trophy,
  Clock,
  Target,
  Activity,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AnalyticsDashboardProps {
  className?: string;
}

// Mock data - replace with actual API calls
const userGrowthData = [
  { month: 'Jan', users: 120, active: 95 },
  { month: 'Feb', users: 180, active: 142 },
  { month: 'Mar', users: 250, active: 198 },
  { month: 'Apr', users: 320, active: 256 },
  { month: 'May', users: 410, active: 328 },
  { month: 'Jun', users: 520, active: 416 },
  { month: 'Jul', users: 640, active: 512 },
  { month: 'Aug', users: 780, active: 624 },
  { month: 'Sep', users: 920, active: 736 },
  { month: 'Oct', users: 1100, active: 880 },
  { month: 'Nov', users: 1280, active: 1024 },
  { month: 'Dec', users: 1500, active: 1200 }
];

const questCompletionData = [
  { category: 'Smart Contracts', completed: 450, total: 600 },
  { category: 'Tokens', completed: 320, total: 400 },
  { category: 'NFTs', completed: 280, total: 350 },
  { category: 'DeFi', completed: 180, total: 250 },
  { category: 'Consensus', completed: 120, total: 180 },
  { category: 'Mirror Node', completed: 90, total: 120 }
];

const difficultyDistribution = [
  { name: 'Beginner', value: 45, color: '#10B981' },
  { name: 'Intermediate', value: 35, color: '#F59E0B' },
  { name: 'Advanced', value: 20, color: '#EF4444' }
];

const dailyActivityData = [
  { date: '2024-01-15', submissions: 25, completions: 18, newUsers: 12 },
  { date: '2024-01-16', submissions: 32, completions: 24, newUsers: 15 },
  { date: '2024-01-17', submissions: 28, completions: 21, newUsers: 8 },
  { date: '2024-01-18', submissions: 45, completions: 35, newUsers: 22 },
  { date: '2024-01-19', submissions: 38, completions: 29, newUsers: 18 },
  { date: '2024-01-20', submissions: 52, completions: 41, newUsers: 25 },
  { date: '2024-01-21', submissions: 41, completions: 32, newUsers: 19 }
];

const performanceMetrics = [
  { metric: 'Avg Completion Time', value: '45 min', change: -8, trend: 'down' },
  { metric: 'Success Rate', value: '78%', change: 12, trend: 'up' },
  { metric: 'User Retention', value: '65%', change: 5, trend: 'up' },
  { metric: 'Quest Rating', value: '4.6/5', change: 3, trend: 'up' }
];

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('line');
  const [selectedMetric, setSelectedMetric] = useState('users');

  const exportData = (format: 'csv' | 'json') => {
    // Mock export functionality
    console.log(`Exporting data as ${format}`);
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className={className}>
      <Card className="border-2 border-dashed border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
        <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <CardTitle className="flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-indigo-500/20 rounded border border-dashed border-indigo-500/40">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
              </div>
              ANALYTICS_DASHBOARD
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 font-mono border-dashed border-indigo-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-mono">
                  <SelectItem value="7d">[7_DAYS]</SelectItem>
                  <SelectItem value="30d">[30_DAYS]</SelectItem>
                  <SelectItem value="90d">[90_DAYS]</SelectItem>
                  <SelectItem value="1y">[1_YEAR]</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => exportData('csv')}
                className="font-mono border-dashed border-indigo-500/30"
              >
                <Download className="w-4 h-4 mr-1" />
                [EXPORT]
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-lg border border-dashed border-indigo-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold font-mono text-indigo-500">{metric.value}</div>
                    <div className="text-sm text-muted-foreground font-mono">{metric.metric}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-sm font-mono ${getTrendColor(metric.trend)}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* User Growth Chart */}
          <Card className="border-dashed border-indigo-500/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between font-mono">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  [USER_GROWTH]
                </div>
                <div className="flex items-center gap-2">
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-32 font-mono border-dashed">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="font-mono">
                      <SelectItem value="line">[LINE]</SelectItem>
                      <SelectItem value="area">[AREA]</SelectItem>
                      <SelectItem value="bar">[BAR]</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <>
                    {chartType === 'line' && (
                      <LineChart data={userGrowthData} key="line-chart">
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" className="font-mono" />
                        <YAxis className="font-mono" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '2px dashed hsl(var(--border))',
                            fontFamily: 'monospace'
                          }} 
                        />
                        <Line type="monotone" dataKey="users" stroke="#6366F1" strokeWidth={2} name="Total Users" />
                        <Line type="monotone" dataKey="active" stroke="#10B981" strokeWidth={2} name="Active Users" />
                      </LineChart>
                    )}
                    {chartType === 'area' && (
                      <AreaChart data={userGrowthData} key="area-chart">
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" className="font-mono" />
                        <YAxis className="font-mono" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '2px dashed hsl(var(--border))',
                            fontFamily: 'monospace'
                          }} 
                        />
                        <Area type="monotone" dataKey="users" stackId="1" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} name="Total Users" />
                        <Area type="monotone" dataKey="active" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Active Users" />
                      </AreaChart>
                    )}
                    {chartType === 'bar' && (
                      <BarChart data={userGrowthData} key="bar-chart">
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" className="font-mono" />
                        <YAxis className="font-mono" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '2px dashed hsl(var(--border))',
                            fontFamily: 'monospace'
                          }} 
                        />
                        <Bar dataKey="users" fill="#6366F1" name="Total Users" />
                        <Bar dataKey="active" fill="#10B981" name="Active Users" />
                      </BarChart>
                    )}
                  </>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quest Completion by Category */}
            <Card className="border-dashed border-indigo-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-mono">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  [QUEST_COMPLETION_BY_CATEGORY]
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={questCompletionData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" className="font-mono" />
                      <YAxis dataKey="category" type="category" className="font-mono" width={100} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '2px dashed hsl(var(--border))',
                          fontFamily: 'monospace'
                        }} 
                      />
                      <Bar dataKey="completed" fill="#10B981" name="Completed" />
                      <Bar dataKey="total" fill="#6B7280" fillOpacity={0.3} name="Total" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Difficulty Distribution */}
            <Card className="border-dashed border-indigo-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-mono">
                  <Target className="w-4 h-4 text-purple-500" />
                  [DIFFICULTY_DISTRIBUTION]
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={difficultyDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {difficultyDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '2px dashed hsl(var(--border))',
                          fontFamily: 'monospace'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {difficultyDistribution.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm font-mono">{entry.name}: {entry.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Activity */}
          <Card className="border-dashed border-indigo-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-mono">
                <Activity className="w-4 h-4 text-green-500" />
                [DAILY_ACTIVITY]
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      className="font-mono" 
                      tickFormatter={(value) => formatDistanceToNow(new Date(value), { addSuffix: true })}
                    />
                    <YAxis className="font-mono" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '2px dashed hsl(var(--border))',
                        fontFamily: 'monospace'
                      }}
                      labelFormatter={(value) => formatDistanceToNow(new Date(value), { addSuffix: true })}
                    />
                    <Area type="monotone" dataKey="submissions" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Submissions" />
                    <Area type="monotone" dataKey="completions" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Completions" />
                    <Area type="monotone" dataKey="newUsers" stackId="1" stroke="#6366F1" fill="#6366F1" fillOpacity={0.6} name="New Users" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-3 rounded-lg border border-dashed border-blue-500/20 text-center">
              <div className="text-lg font-bold font-mono text-blue-500">1,500</div>
              <div className="text-xs text-muted-foreground font-mono">TOTAL_USERS</div>
            </div>
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-3 rounded-lg border border-dashed border-green-500/20 text-center">
              <div className="text-lg font-bold font-mono text-green-500">1,200</div>
              <div className="text-xs text-muted-foreground font-mono">ACTIVE_USERS</div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-3 rounded-lg border border-dashed border-yellow-500/20 text-center">
              <div className="text-lg font-bold font-mono text-yellow-500">45</div>
              <div className="text-xs text-muted-foreground font-mono">TOTAL_QUESTS</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3 rounded-lg border border-dashed border-purple-500/20 text-center">
              <div className="text-lg font-bold font-mono text-purple-500">2,340</div>
              <div className="text-xs text-muted-foreground font-mono">COMPLETIONS</div>
            </div>
            <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 p-3 rounded-lg border border-dashed border-red-500/20 text-center">
              <div className="text-lg font-bold font-mono text-red-500">156</div>
              <div className="text-xs text-muted-foreground font-mono">SUBMISSIONS</div>
            </div>
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-3 rounded-lg border border-dashed border-indigo-500/20 text-center">
              <div className="text-lg font-bold font-mono text-indigo-500">4.6</div>
              <div className="text-xs text-muted-foreground font-mono">AVG_RATING</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsDashboard;