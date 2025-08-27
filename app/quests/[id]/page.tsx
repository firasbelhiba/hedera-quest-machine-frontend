'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

import { Quest, User } from '@/lib/types';
import { QuestService } from '@/lib/services';
import { api } from '@/lib/api/client';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import {
  Clock,
  Users,
  Trophy,
  Star,
  CheckCircle,
  ExternalLink,
  ArrowLeft,
  AlertCircle,
  Target,
  BookOpen,
  Award,
  Calendar,
  UserCheck,
  Link as LinkIcon,
  Facebook,
  Twitter,
  Instagram,
  Eye,
  Shield,
  CheckSquare,
  Heart,
  MessageCircle,
  Share,
} from 'lucide-react';

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'development':
      return <BookOpen className="w-8 h-8" />;
    case 'social':
      return <Users className="w-8 h-8" />;
    case 'education':
      return <Award className="w-8 h-8" />;
    default:
      return <Trophy className="w-8 h-8" />;
  }
};

export default function QuestDetailPage() {
  const params = useParams();
  const questId = params?.id as string;

  const [quest, setQuest] = useState<Quest | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [questData, userData] = await Promise.all([
          QuestService.getQuest(questId),
          QuestService.getCurrentUser(),
        ]);

        const questDetails =
          questData && (questData as any).success ? (questData as any).data : questData;

        if (!questDetails) {
          throw new Error('Quest not found');
        }

        setQuest(questDetails);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quest data');
        console.error('Quest loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (questId) {
      loadData();
    }
  }, [questId]);

  const handleVerifyQuest = async () => {
    if (!quest) return;

    setVerifying(true);
    setVerifyMessage(null);
    setShowVerifyDialog(false);

    try {
      await api.post(`/quest-completions/quests/${quest.id}/verify`);
      setVerifyMessage('Quest verification successful!');
      // Refresh the page to update stats and hide action buttons
      setTimeout(() => {
        window.location.reload();
      }, 1500); // Wait 1.5 seconds to show success message
    } catch (error: any) {
      console.error('Verification failed:', error);
      setVerifyMessage(error?.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyClick = () => {
    setShowVerifyDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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

  const isCompleted = user?.completedQuests?.includes(String(quest.id)) || false;

  const difficultyStars: Record<string, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
    master: 5,
  };

  return (
    <main className="max-w-6xl mx-auto space-y-6" role="main" aria-label="Quest Details">
      {/* Back Button */}
      <Link href="/quests">
        <Button
          variant="ghost"
          size="sm"
          className="border-2 border-dashed border-gray-400 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 font-mono text-sm transition-all duration-200 shadow-sm hover:shadow-md gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          ← Back to Quests
        </Button>
      </Link>

      {/* Quest Header */}
      <header aria-label="Quest Information">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            <Card className="overflow-hidden border-4 border-dashed border-gray-400 dark:border-gray-600 shadow-lg bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-950/30 dark:to-purple-950/30">
              <CardHeader className="bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700 p-8">
                <div className="max-w-7xl mx-auto">
                  {/* Quest Title and Category */}
                  <div className="mb-8">
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl shadow-lg flex-shrink-0">
                          {getCategoryIcon(quest.category as any)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h1
                          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 leading-tight"
                          id="quest-title"
                        >
                          {quest.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge className="px-4 py-2 text-sm font-semibold rounded-full border-0 shadow-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            {(quest.category || 'general')
                              .replace('-', ' ')
                              .replace(/^./, (c) => c.toUpperCase())}
                          </Badge>
                          <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-full shadow-sm">
                            {Array.from({ length: 4 }, (_, i) => (
                              <span
                                key={i}
                                className={cn(
                                  'text-lg',
                                  i < (difficultyStars[quest.difficulty as any] || 0)
                                    ? 'text-yellow-500'
                                    : 'text-gray-300 dark:text-gray-600'
                                )}
                              >
                                {i < (difficultyStars[quest.difficulty as any] || 0) ? '★' : '☆'}
                              </span>
                            ))}
                            <span className="ml-2 text-sm font-semibold text-yellow-700 dark:text-yellow-300 capitalize">
                              {quest.difficulty || 'unknown'}
                            </span>
                          </div>
                          {isCompleted && (
                            <Badge className="px-4 py-2 text-sm font-semibold rounded-full border-0 shadow-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center gap-2">
                              <Trophy className="w-4 h-4" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quest Stats Grid */}
                  <div
                    className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
                    role="group"
                    aria-label="Quest Statistics"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {quest.estimatedTime || 0}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Minutes</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Estimated time</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {quest.completions || 0}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completions</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Total completed</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {quest.reward || (quest as any).points}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Points</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Reward value</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {quest.endDate
                            ? formatDistanceToNow(new Date(quest.endDate), { addSuffix: true })
                            : 'No limit'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Deadline</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Time remaining</p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-8">
                {/* Quest Description */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Description
                  </h2>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300" aria-describedby="quest-title">
                    {quest.description}
                  </p>
                </div>

                {/* Quest Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        {quest.platform_type === 'facebook' ? (
                          <Facebook className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        ) : quest.platform_type === 'twitter' ? (
                          <Twitter className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        ) : quest.platform_type === 'instagram' ? (
                          <Instagram className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <LinkIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                          {quest.platform_type || 'Web Platform'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Platform</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                        {(quest as any).action_type === 'like' ? (
                          <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                        ) : (quest as any).action_type === 'comment' ? (
                          <MessageCircle className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                        ) : (quest as any).action_type === 'share' ? (
                          <Share className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                        ) : (
                          <Eye className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                          {(quest as any).action_type || 'View Content'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Required action</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {(quest as any).currentParticipants || 0} / {(quest as any).maxParticipants || '∞'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Participants</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {quest.startDate
                            ? formatDistanceToNow(new Date(quest.startDate), { addSuffix: true })
                            : 'Available now'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Started</p>
                      </div>
                    </div>
                  </div>
                </div>



                {/* Action Buttons */}
                <section
                  className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 mt-8"
                  aria-label="Quest Actions"
                >
                  <div className="flex flex-col gap-4">
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-0 text-sm sm:text-base"
                      asChild
                      aria-label="Start quest on external platform"
                    >
                      <a href={(quest as any).externalUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                        <ExternalLink className="w-5 h-5" />
                        Start Quest
                      </a>
                    </Button>

                    <AlertDialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="lg"
                          variant="outline"
                          className="w-full border-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                          disabled={verifying || isCompleted}
                          aria-label={
                            verifying
                              ? 'Verifying quest completion'
                              : isCompleted
                                ? 'Quest already completed'
                                : 'Verify quest completion'
                          }
                        >
                          {verifying ? (
                            <span className="flex items-center gap-2 sm:gap-3">
                              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600" />
                              Verifying...
                            </span>
                          ) : isCompleted ? (
                            <span className="flex items-center gap-2 sm:gap-3">
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                              Completed
                            </span>
                          ) : (
                            <span className="flex items-center gap-3">
                              <CheckSquare className="w-5 h-5" />
                              Verify Completion
                            </span>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="sm:max-w-md" aria-labelledby="verify-dialog-title" aria-describedby="verify-dialog-description">
                        <AlertDialogHeader>
                          <AlertDialogTitle id="verify-dialog-title" className="flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-green-600" />
                            Verify Quest Completion
                          </AlertDialogTitle>
                          <AlertDialogDescription id="verify-dialog-description" className="text-base leading-relaxed">
                            Please confirm that you have completed all quest requirements. This action will submit your completion for verification.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="px-6" aria-label="Cancel verification">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={handleVerifyQuest} className="px-6 bg-green-600 hover:bg-green-700" aria-label="Confirm quest verification">
                            Verify Now
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {verifyMessage && (
                    <Alert
                      className={cn(
                        'mt-4',
                        verifyMessage.includes('successful')
                          ? 'border-green-200 bg-green-50 dark:bg-green-950/20'
                          : 'border-red-200 bg-red-50 dark:bg-red-950/20'
                      )}
                    >
                      {verifyMessage.includes('successful') ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription
                        className={cn(
                          verifyMessage.includes('successful')
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                        )}
                      >
                        {verifyMessage}
                      </AlertDescription>
                    </Alert>
                  )}
                </section>
              </CardContent>
            </Card>

            {/* Quest Details */}
            <section aria-label="Quest Details">
              <Tabs defaultValue="requirements" className="space-y-6" aria-label="Quest Information Tabs">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden" role="tablist">
                  <TabsTrigger
                    value="requirements"
                    className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400 text-xs sm:text-sm"
                    role="tab"
                    aria-controls="requirements-panel"
                  >
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Requirements</span>
                    <span className="sm:hidden">Req</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="resources"
                    className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400 text-xs sm:text-sm"
                    role="tab"
                    aria-controls="resources-panel"
                  >
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Resources</span>
                    <span className="sm:hidden">Res</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="badges"
                    className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400 text-xs sm:text-sm"
                    role="tab"
                    aria-controls="badges-panel"
                  >
                    <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Badges</span>
                    <span className="sm:hidden">Bad</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="requirements" role="tabpanel" id="requirements-panel" aria-labelledby="requirements-tab">
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-200 dark:border-gray-700 p-6">
                      <CardTitle id="status-card-title" className="flex items-center gap-3 text-gray-900 dark:text-white">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Quest Requirements</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Complete these tasks to finish the quest</p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="space-y-3 sm:space-y-4">
                        {(quest.requirements || []).map((requirement: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                          >
                            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full mt-0.5 flex-shrink-0">
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{requirement}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="resources" role="tabpanel" id="resources-panel" aria-labelledby="resources-tab">
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700 p-6">
                      <CardTitle id="prerequisites-card-title" className="flex items-center gap-3 text-gray-900 dark:text-white">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Quest Resources</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Helpful links and materials</p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <a
                          href="https://docs.hedera.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                              Hedera Documentation
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Official development documentation
                            </p>
                          </div>
                        </a>
                        <a
                          href="https://portal.hedera.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                            <ExternalLink className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors">
                              Hedera Portal
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Developer portal and tools
                            </p>
                          </div>
                        </a>
                        <a
                          href="https://hashscan.io/testnet"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex-shrink-0">
                            <Eye className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors">
                              HashScan Explorer
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Blockchain explorer for Hedera
                            </p>
                          </div>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="badges" role="tabpanel" id="badges-panel" aria-labelledby="badges-tab">
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 p-6">
                      <CardTitle id="progress-stats-title" className="flex items-center gap-3 text-gray-900 dark:text-white">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                          <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Quest Badges</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Achievements you can earn</p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(quest.badges || []).map((badge: any, index: number) => (
                          <div
                            key={badge.id || index}
                            className="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                          >
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex-shrink-0">
                              <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                {badge.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {badge.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {badge.points || 0} points
                                  </span>
                                </div>
                                <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs">
                                  {badge.rarity || 'common'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}

                        {(!quest.badges || quest.badges.length === 0) && (
                          <div className="col-span-full text-center py-12">
                            <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                              <Award className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                              No badges available for this quest
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                              Complete the quest to see if any badges are earned
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:space-y-6" aria-label="Quest Information Sidebar">
            {/* Quest Status Card */}
            <Card
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden"
              role="region"
              aria-labelledby="status-card-title"
            >
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700 p-6">
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                  {isCompleted ? (
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  ) : (
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">
                      {isCompleted ? 'Quest Completed' : 'Quest Status'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isCompleted ? 'Well done!' : 'Ready to start'}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isCompleted ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="font-medium text-green-700 dark:text-green-300">Points Earned</span>
                      </div>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {quest.reward || (quest as any).points || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Completion verified ✓</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-blue-700 dark:text-blue-300">Potential Reward</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {quest.reward || (quest as any).points || 0}
                      </span>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Complete quest to earn reward</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prerequisites */}
            {(quest.prerequisites || []).length > 0 && (
              <Card
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden"
                role="region"
                aria-labelledby="prerequisites-card-title"
              >
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-b border-gray-200 dark:border-gray-700 p-6">
                  <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Prerequisites</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Required quests</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {(quest.prerequisites || []).map((prereqId: string | number) => (
                      <div
                        key={prereqId}
                        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Quest #{prereqId}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Stats */}
            <Card
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden"
              role="region"
              aria-labelledby="progress-stats-title"
            >
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700 p-6">
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Progress Stats</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Community metrics</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                        Completion Rate
                      </span>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">
                      {(quest as any).completionRate || 67}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                        Total Completions
                      </span>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-green-600 dark:text-green-400">
                      {quest.completions || 0}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-3">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                        Average Rating
                      </span>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-yellow-600 dark:text-yellow-400">
                      {(quest as any).averageRating || 4.8}/5
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </header>
    </main>
  );
}