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
import { Trophy, Target, Calendar, TrendingUp, Star, Siren as Fire, Award, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
            QuestService.getUserBadges(userData.id),
            QuestService.getSubmissions(undefined, userData.id)
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
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full mx-auto flex items-center justify-center">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">Hedera ID: {user.hederaAccountId}</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{user.level}</div>
            <div className="text-sm text-muted-foreground">Level</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{user.points.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Fire className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{user.streak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{badges.length}</div>
            <div className="text-sm text-muted-foreground">Badges Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-semibold">Level {user.level}</div>
                <div className="text-sm text-muted-foreground">
                  {user.points.toLocaleString()} / {pointsForNextLevel.toLocaleString()} points
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">Level {nextLevel}</div>
                <div className="text-sm text-muted-foreground">
                  {pointsForNextLevel - user.points} points to go
                </div>
              </div>
            </div>
            <Progress value={Math.max(0, Math.min(100, progressToNext))} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="badges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="badges">Badges ({badges.length})</TabsTrigger>
          <TabsTrigger value="submissions">Submissions ({submissions.length})</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Badge Collection</CardTitle>
            </CardHeader>
            <CardContent>
              {badges.length > 0 ? (
                <BadgeCollection badges={badges} size="md" showDate={true} />
              ) : (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No badges yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete quests to earn your first badge!
                  </p>
                  <Button>Discover Quests</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          {/* Submission Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{submissionStats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{submissionStats.approved}</div>
                <div className="text-xs text-muted-foreground">Approved</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{submissionStats.pending}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{submissionStats.needsRevision}</div>
                <div className="text-xs text-muted-foreground">Needs Revision</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{submissionStats.rejected}</div>
                <div className="text-xs text-muted-foreground">Rejected</div>
              </CardContent>
            </Card>
          </div>

          {/* Submissions List */}
          <Card>
            <CardHeader>
              <CardTitle>All Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">Quest #{submission.questId}</div>
                        <Badge 
                          variant="outline"
                          className={cn(
                            submission.status === 'approved' && 'border-green-500 text-green-700',
                            submission.status === 'pending' && 'border-yellow-500 text-yellow-700',
                            submission.status === 'needs-revision' && 'border-orange-500 text-orange-700',
                            submission.status === 'rejected' && 'border-red-500 text-red-700'
                          )}
                        >
                          {submission.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                        {submission.reviewedAt && (
                          <> • Reviewed {new Date(submission.reviewedAt).toLocaleDateString()}</>
                        )}
                      </div>
                      
                      {submission.feedback && (
                        <div className="bg-muted p-3 rounded text-sm">
                          <strong>Feedback:</strong> {submission.feedback}
                        </div>
                      )}
                      
                      {submission.points && (
                        <div className="text-sm font-medium text-green-600 mt-2">
                          +{submission.points} points earned
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start completing quests to see your submissions here.
                  </p>
                  <Button>Browse Quests</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((submission) => (
                    <div key={submission.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        submission.status === 'approved' && 'bg-green-100 dark:bg-green-900',
                        submission.status === 'pending' && 'bg-yellow-100 dark:bg-yellow-900',
                        submission.status === 'needs-revision' && 'bg-orange-100 dark:bg-orange-900',
                        submission.status === 'rejected' && 'bg-red-100 dark:bg-red-900'
                      )}>
                        {submission.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {submission.status === 'pending' && <Clock className="w-4 h-4 text-yellow-600" />}
                        {submission.status === 'needs-revision' && <AlertCircle className="w-4 h-4 text-orange-600" />}
                        {submission.status === 'rejected' && <XCircle className="w-4 h-4 text-red-600" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium">
                          {submission.status === 'approved' && 'Quest completed'}
                          {submission.status === 'pending' && 'Quest submitted'}
                          {submission.status === 'needs-revision' && 'Revision requested'}
                          {submission.status === 'rejected' && 'Submission rejected'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Quest #{submission.questId} • {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {submission.points && (
                        <div className="text-sm font-medium text-green-600">
                          +{submission.points}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
                  <p className="text-muted-foreground">
                    Your quest submissions and achievements will appear here.
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