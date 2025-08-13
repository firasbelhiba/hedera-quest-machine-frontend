'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Quest, User, Submission } from '@/lib/types';
import { QuestService } from '@/lib/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SubmissionForm } from '@/components/submissions/submission-form';
import { 
  Clock, 
  Users, 
  Trophy, 
  Star, 
  CheckCircle, 
  ExternalLink,
  ArrowLeft,
  AlertCircle,
  FileText,
  Link as LinkIcon,
  User as UserIcon,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export default function QuestDetailPage() {
  const params = useParams();
  const questId = params.id as string;
  
  const [quest, setQuest] = useState<Quest | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [questData, userData] = await Promise.all([
          QuestService.getQuest(questId),
          QuestService.getCurrentUser()
        ]);
        
        if (!questData) {
          setError('Quest not found');
          return;
        }
        
        setQuest(questData);
        setUser(userData);
        
        if (userData) {
          const submissionsData = await QuestService.getSubmissions(questId, userData.id);
          setSubmissions(submissionsData);
        }
      } catch (err) {
        setError('Failed to load quest data');
        console.error('Quest loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (questId) {
      loadData();
    }
  }, [questId]);

  const handleSubmissionComplete = () => {
    setShowSubmissionForm(false);
    // Reload submissions
    if (user) {
      QuestService.getSubmissions(questId, user.id).then(setSubmissions);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !quest) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Quest not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isCompleted = user?.completedQuests?.includes(quest.id) || false;
  const latestSubmission = submissions[0]; // Assuming most recent first
  const canSubmit = !isCompleted && (!latestSubmission || latestSubmission.status === 'needs-revision');

  const difficultyStars = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4
  };

  const getSubmissionIcon = (type: string) => {
    switch (type) {
      case 'url': return LinkIcon;
      case 'text': return FileText;
      case 'account-id': return UserIcon;
      case 'transaction-id': return Hash;
      default: return FileText;
    }
  };

  const SubmissionIcon = getSubmissionIcon(quest.submissionType);

  if (showSubmissionForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <SubmissionForm
          quest={quest}
          onSubmit={handleSubmissionComplete}
          onCancel={() => setShowSubmissionForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/quests">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Quests
        </Button>
      </Link>

      {/* Quest Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="relative">
              <Image
                src={quest.thumbnail}
                alt={quest.title}
                width={800}
                height={400}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              {isCompleted && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Completed
                </div>
              )}
            </div>
            
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {quest.category.replace('-', ' ')}
                    </Badge>
                    <div className="flex items-center">
                      {Array.from({ length: 4 }, (_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-4 h-4',
                            i < difficultyStars[quest.difficulty]
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground capitalize">
                        {quest.difficulty}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{quest.title}</CardTitle>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-2xl font-bold text-primary">
                    <Trophy className="w-6 h-6 mr-1" />
                    {quest.points}
                  </div>
                  <div className="text-sm text-muted-foreground">points</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-lg text-muted-foreground mb-4">
                {quest.description}
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{quest.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{quest.completions} completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <SubmissionIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="capitalize">{quest.submissionType.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  <span>{quest.requirements.length} requirements</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quest Details */}
          <Tabs defaultValue="requirements" className="space-y-4">
            <TabsList>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="requirements">
              <Card>
                <CardHeader>
                  <CardTitle>What you need to complete</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quest.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{requirement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructions">
              <Card>
                <CardHeader>
                  <CardTitle>Submission Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                    <p>{quest.submissionInstructions}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources">
              <Card>
                <CardHeader>
                  <CardTitle>Helpful Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <a
                      href="https://docs.hedera.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Hedera Documentation
                    </a>
                    <a
                      href="https://portal.hedera.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Hedera Portal
                    </a>
                    <a
                      href="https://hashscan.io/testnet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      HashScan Explorer
                    </a>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quest Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isCompleted ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-green-600 dark:text-green-400 mb-1">
                    Quest Completed!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You've earned {quest.points} points
                  </p>
                </div>
              ) : latestSubmission ? (
                <div className="space-y-3">
                  <div className={cn(
                    'p-3 rounded-lg text-center',
                    latestSubmission.status === 'pending' && 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-300',
                    latestSubmission.status === 'needs-revision' && 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300',
                    latestSubmission.status === 'approved' && 'bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300'
                  )}>
                    <h4 className="font-semibold capitalize mb-1">
                      {latestSubmission.status.replace('-', ' ')}
                    </h4>
                    <p className="text-sm">
                      {latestSubmission.status === 'pending' && 'Your submission is being reviewed'}
                      {latestSubmission.status === 'needs-revision' && 'Please revise and resubmit'}
                      {latestSubmission.status === 'approved' && 'Congratulations! Quest completed'}
                    </p>
                  </div>
                  
                  {latestSubmission.feedback && (
                    <div className="bg-muted p-3 rounded-lg">
                      <h5 className="font-medium mb-1">Reviewer Feedback:</h5>
                      <p className="text-sm">{latestSubmission.feedback}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-muted-foreground mb-3">Ready to start this quest?</p>
                </div>
              )}

              {canSubmit && (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => setShowSubmissionForm(true)}
                >
                  {latestSubmission?.status === 'needs-revision' ? 'Resubmit Quest' : 'Submit Quest'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Prerequisites */}
          {quest.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quest.prerequisites.map((prereqId) => (
                    <div key={prereqId} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Quest #{prereqId}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quest Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completion Rate</span>
                  <span>67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{quest.completions}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-muted-foreground">4.8</div>
                  <div className="text-xs text-muted-foreground">Avg Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}