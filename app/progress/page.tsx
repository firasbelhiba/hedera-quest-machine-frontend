'use client';

import { useState, useEffect } from 'react';
import { User, Badge as BadgeType, Submission } from '@/lib/types';
import { QuestService } from '@/lib/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BadgeCollection } from '@/components/badges/badge-display';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Calendar, TrendingUp, Star, Siren as Fire, Award, Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProgressPage() {
  const [user, setUser] = useState<User | null>(null);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const userData = await QuestService.getCurrentUser();
        setUser(userData);
        
        if (userData) {
          const [badgesData, submissionsData] = await Promise.all([
            QuestService.getUserBadges(String(userData.id)),
            QuestService.getSubmissions(undefined, String(userData.id))
          ]);
          setBadges(badgesData);
          setSubmissions(submissionsData);
        }
      } catch (error) {
        console.error('Failed to load progress data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please log in to view your progress.</p>
      </div>
    );
  }

  const nextLevel = user.level + 1;
  const pointsForNextLevel = nextLevel * 200; // Example: 200 points per level
  const currentLevelPoints = user.level * 200;
  const progressToNext = ((user.points - currentLevelPoints) / (pointsForNextLevel - currentLevelPoints)) * 100;

  const submissionStats = {
    total: submissions.length,
    approved: submissions.filter(s => s.status === 'approved').length,
    pending: submissions.filter(s => s.status === 'pending').length,
    needsRevision: submissions.filter(s => s.status === 'needs-revision').length,
    rejected: submissions.filter(s => s.status === 'rejected').length
  };

  const recentActivity = submissions
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-blue-500/10 rounded-lg" />
        <div className="relative bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary/20 rounded-lg p-8">
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg border-2 border-dashed border-primary/30" />
              <div className="relative w-full h-full bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent font-mono">
                🏆 {user.name}
              </h1>
              <p className="text-muted-foreground font-mono text-sm mt-2">
                {'>'} HEDERA_ID: {user.hederaAccountId}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${user.role === 'admin' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
        <Card className="border-2 border-dashed border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 hover:border-solid transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-dashed border-yellow-500/30 w-fit mx-auto mb-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold font-mono bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              {user.level}
            </div>
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">LEVEL</div>
          </CardContent>
        </Card>

        {user.role !== 'admin' && (
          <Card className="border-2 border-dashed border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 hover:border-solid transition-all duration-200">
            <CardContent className="p-6 text-center">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-dashed border-blue-500/30 w-fit mx-auto mb-3">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-2xl font-bold font-mono bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                {user.points.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">TOTAL_POINTS</div>
            </CardContent>
          </Card>
        )}

        <Card className="border-2 border-dashed border-red-500/20 bg-gradient-to-br from-red-500/5 to-pink-500/5 hover:border-solid transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="p-2 bg-red-500/10 rounded-lg border border-dashed border-red-500/30 w-fit mx-auto mb-3">
              <Fire className="w-6 h-6 text-red-500" />
            </div>
            <div className="text-2xl font-bold font-mono bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              {user.streak}
            </div>
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">DAY_STREAK</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 hover:border-solid transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="p-2 bg-purple-500/10 rounded-lg border border-dashed border-purple-500/30 w-fit mx-auto mb-3">
              <Award className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-2xl font-bold font-mono bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              {badges.length}
            </div>
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">BADGES_EARNED</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress - Hidden for Admin Users */}
      {user.role !== 'admin' && (
        <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 hover:border-solid transition-all duration-200">
          <CardHeader className="border-b border-dashed border-primary/20">
            <CardTitle className="flex items-center gap-2 font-mono text-lg">
              <div className="p-1 bg-primary/10 rounded border border-dashed border-primary/30">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              {'>'} LEVEL_PROGRESS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-semibold font-mono bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">LEVEL_{user.level}</div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {user.points.toLocaleString()} / {pointsForNextLevel.toLocaleString()} points
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold font-mono bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">LEVEL_{nextLevel}</div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {'>'} {pointsForNextLevel - user.points} points to go
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="h-3 bg-muted rounded-lg border border-dashed border-primary/20" />
                <div 
                  className="absolute top-0 left-0 h-3 bg-gradient-to-r from-primary to-purple-500 rounded-lg transition-all duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, progressToNext))}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="badges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 border-2 border-dashed border-primary/20 rounded-lg p-1">
          <TabsTrigger 
            value="badges" 
            className="font-mono text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-purple-500/20 data-[state=active]:border data-[state=active]:border-dashed data-[state=active]:border-primary/30 data-[state=active]:text-primary transition-all duration-200"
          >
            🏆 BADGES ({badges.length})
          </TabsTrigger>
          <TabsTrigger 
            value="submissions" 
            className="font-mono text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-purple-500/20 data-[state=active]:border data-[state=active]:border-dashed data-[state=active]:border-primary/30 data-[state=active]:text-primary transition-all duration-200"
          >
            📝 SUBMISSIONS ({submissions.length})
          </TabsTrigger>
          <TabsTrigger 
            value="activity" 
            className="font-mono text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-purple-500/20 data-[state=active]:border data-[state=active]:border-dashed data-[state=active]:border-primary/30 data-[state=active]:text-primary transition-all duration-200"
          >
            📊 RECENT_ACTIVITY
          </TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-6">
          <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 hover:border-solid transition-all duration-200">
            <CardHeader className="border-b border-dashed border-primary/20">
              <CardTitle className="flex items-center gap-2 font-mono text-lg">
                <div className="p-1 bg-primary/10 rounded border border-dashed border-primary/30">
                  <Award className="w-4 h-4 text-primary" />
                </div>
                {'>'} BADGE_COLLECTION
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {badges.length > 0 ? (
                <BadgeCollection badges={badges} size="md" showDate={true} />
              ) : (
                <div className="text-center py-12">
                  <div className="relative mx-auto w-16 h-16 mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg border-2 border-dashed border-primary/30" />
                    <div className="relative w-full h-full bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg flex items-center justify-center">
                      <Award className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-mono text-primary">NO_BADGES_YET</h3>
                  <p className="text-muted-foreground mb-4 font-mono text-sm">
                    {'>'} Complete quests to earn your first badge!
                  </p>
                  <Button className="font-mono">DISCOVER_QUESTS</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          {/* Submission Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 hover:border-solid transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="p-2 bg-primary/10 rounded-lg border border-dashed border-primary/30 w-fit mx-auto mb-2">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-bold font-mono bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">{submissionStats.total}</div>
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">TOTAL</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-dashed border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 hover:border-solid transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="p-2 bg-green-500/10 rounded-lg border border-dashed border-green-500/30 w-fit mx-auto mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold font-mono bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">{submissionStats.approved}</div>
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">APPROVED</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-dashed border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 hover:border-solid transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="p-2 bg-yellow-500/10 rounded-lg border border-dashed border-yellow-500/30 w-fit mx-auto mb-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold font-mono bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">{submissionStats.pending}</div>
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">PENDING</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-dashed border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-red-500/5 hover:border-solid transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="p-2 bg-orange-500/10 rounded-lg border border-dashed border-orange-500/30 w-fit mx-auto mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-2xl font-bold font-mono bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">{submissionStats.needsRevision}</div>
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">NEEDS_REVISION</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-dashed border-red-500/20 bg-gradient-to-br from-red-500/5 to-pink-500/5 hover:border-solid transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="p-2 bg-red-500/10 rounded-lg border border-dashed border-red-500/30 w-fit mx-auto mb-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-2xl font-bold font-mono bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">{submissionStats.rejected}</div>
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">REJECTED</div>
              </CardContent>
            </Card>
          </div>

          {/* Submissions List */}
          <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 hover:border-solid transition-all duration-200">
            <CardHeader className="border-b border-dashed border-primary/20">
              <CardTitle className="flex items-center gap-2 font-mono text-lg">
                <div className="p-1 bg-primary/10 rounded border border-dashed border-primary/30">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                {'>'} ALL_SUBMISSIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="border-2 border-dashed border-primary/10 rounded-lg p-4 bg-gradient-to-r from-background/50 to-muted/20 hover:border-solid transition-all duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium font-mono text-primary">QUEST_#{submission.questId}</div>
                        <Badge 
                          variant="outline"
                          className={cn(
                            'font-mono border-2 border-dashed',
                            submission.status === 'approved' && 'border-green-500/30 text-green-700 bg-green-500/10',
                            submission.status === 'pending' && 'border-yellow-500/30 text-yellow-700 bg-yellow-500/10',
                            submission.status === 'needs-revision' && 'border-orange-500/30 text-orange-700 bg-orange-500/10',
                            submission.status === 'rejected' && 'border-red-500/30 text-red-700 bg-red-500/10'
                          )}
                        >
                          {submission.status.replace('-', '_').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2 font-mono">
                        {'>'} SUBMITTED: {new Date(submission.submittedAt).toLocaleDateString()}
                        {submission.reviewedAt && (
                          <> • REVIEWED: {new Date(submission.reviewedAt).toLocaleDateString()}</>
                        )}
                      </div>
                      
                      {submission.feedback && (
                        <div className="bg-muted/50 p-3 rounded border border-dashed border-primary/20 text-sm font-mono">
                          <strong className="text-primary">FEEDBACK:</strong> {submission.feedback}
                        </div>
                      )}
                      
                      {submission.points && (
                        <div className="text-sm font-medium font-mono bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mt-2">
                          +{submission.points} POINTS_EARNED
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="relative mx-auto w-16 h-16 mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg border-2 border-dashed border-primary/30" />
                    <div className="relative w-full h-full bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-mono text-primary">NO_SUBMISSIONS_YET</h3>
                  <p className="text-muted-foreground mb-4 font-mono text-sm">
                    {'>'} Start completing quests to see your submissions here.
                  </p>
                  <Button className="font-mono">BROWSE_QUESTS</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 hover:border-solid transition-all duration-200">
            <CardHeader className="border-b border-dashed border-primary/20">
              <CardTitle className="flex items-center gap-2 font-mono text-lg">
                <div className="p-1 bg-primary/10 rounded border border-dashed border-primary/30">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                {'>'} RECENT_ACTIVITY
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((submission) => (
                    <div key={submission.id} className="flex items-center gap-4 p-3 border-2 border-dashed border-primary/10 rounded-lg bg-gradient-to-r from-background/50 to-muted/20 hover:border-solid transition-all duration-200">
                      <div className={cn(
                        'w-8 h-8 rounded-lg border-2 border-dashed flex items-center justify-center',
                        submission.status === 'approved' && 'bg-green-500/10 border-green-500/30',
                        submission.status === 'pending' && 'bg-yellow-500/10 border-yellow-500/30',
                        submission.status === 'needs-revision' && 'bg-orange-500/10 border-orange-500/30',
                        submission.status === 'rejected' && 'bg-red-500/10 border-red-500/30'
                      )}>
                        {submission.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {submission.status === 'pending' && <Clock className="w-4 h-4 text-yellow-600" />}
                        {submission.status === 'needs-revision' && <AlertCircle className="w-4 h-4 text-orange-600" />}
                        {submission.status === 'rejected' && <XCircle className="w-4 h-4 text-red-600" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium font-mono text-primary">
                          {submission.status === 'approved' && '✅ QUEST_COMPLETED'}
                          {submission.status === 'pending' && '⏳ QUEST_SUBMITTED'}
                          {submission.status === 'needs-revision' && '🔄 REVISION_REQUESTED'}
                          {submission.status === 'rejected' && '❌ SUBMISSION_REJECTED'}
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {'>'} QUEST_#{submission.questId} • {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {submission.points && (
                        <div className="text-sm font-medium font-mono bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                          +{submission.points} PTS
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="relative mx-auto w-16 h-16 mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg border-2 border-dashed border-primary/30" />
                    <div className="relative w-full h-full bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-mono text-primary">NO_RECENT_ACTIVITY</h3>
                  <p className="text-muted-foreground font-mono text-sm">
                    {'>'} Your quest submissions and achievements will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}