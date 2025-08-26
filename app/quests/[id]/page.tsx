'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Quest, User } from '@/lib/types';
import { QuestService } from '@/lib/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

import { 
  Clock, 
  Users, 
  Trophy, 
  Star, 
  CheckCircle, 
  ExternalLink,
  ArrowLeft,
  AlertCircle,
  Zap,
  Target,
  BookOpen,
  Award,
  Sparkles,
  DollarSign,
  Calendar,
  UserCheck,
  Link as LinkIcon,
  Facebook,
  Twitter,
  Instagram,
  Heart,
  MessageCircle,
  Share,
  Eye,
  Crown,
  Shield,
  CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { formatDistanceToNow } from 'date-fns';

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
          QuestService.getCurrentUser()
        ]);

        // Handle the new API response format
        const questDetails = questData && (questData as any).success ? (questData as any).data : questData;
        
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
      const response = await api.post(`/quest-completions/quests/${quest.id}/verify`);
      setVerifyMessage('Quest verification successful!');
    } catch (error: any) {
      console.error('Verification failed:', error);
      setVerifyMessage(error.response?.data?.message || 'Verification failed. Please try again.');
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

  const isCompleted = user?.completedQuests?.includes(String(quest.id)) || false;

  const difficultyStars = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
    master: 5
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden border-4 border-dashed border-gray-400 dark:border-gray-600 shadow-lg bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-950/30 dark:to-purple-950/30">
            <CardHeader className="relative">
              {isCompleted && (
                <div className="absolute top-6 right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg z-20 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Completed
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className="border-2 border-dashed border-gray-400 bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200 font-mono text-xs px-3 py-1 capitalize">
                      {(quest.category || 'general').replace('-', ' ')}
                    </Badge>
                    <div className="flex items-center border-2 border-dashed border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-lg">
                      {Array.from({ length: 4 }, (_, i) => (
                        <span key={i} className={cn(
                          'text-lg',
                          i < difficultyStars[quest.difficulty]
                            ? 'text-yellow-500'
                            : 'text-gray-300 dark:text-gray-600'
                        )}>
                          {i < difficultyStars[quest.difficulty] ? '★' : '☆'}
                        </span>
                      ))}
                      <span className="ml-2 text-sm font-mono font-medium text-yellow-700 dark:text-yellow-300 capitalize">
                        {quest.difficulty}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-mono font-bold text-gray-900 dark:text-white leading-tight">
                    {quest.title}
                  </CardTitle>
                </div>
                <div className="text-right">
                  <div className="border-2 border-dashed border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center text-2xl font-mono font-bold">
                      {quest.reward || quest.points} points
                    </div>
                    <div className="text-xs font-mono font-medium">REWARD</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-950/20 p-6 rounded-lg">
                <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 font-mono">
                  {quest.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-950/20 p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {quest.platform_type === 'facebook' ? 'FB' :
                       quest.platform_type === 'twitter' ? 'TW' :
                       quest.platform_type === 'instagram' ? 'IG' :
                       'WEB'}
                    </div>
                    <div>
                      <div className="font-mono font-semibold text-gray-900 dark:text-white capitalize">{quest.platform_type}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">PLATFORM</div>
                    </div>
                  </div>
                </div>
                <div className="border-2 border-dashed border-pink-300 dark:border-pink-600 bg-pink-50 dark:bg-pink-950/20 p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {quest.platform_type === 'like' ? 'LIKE' :
                       quest.platform_type === 'comment' ? 'COMMENT' :
                       quest.platform_type === 'share' ? 'SHARE' :
                       'VIEW'}
                    </div>
                    <div>
                      <div className="font-mono font-semibold text-gray-900 dark:text-white capitalize">{quest.platform_type || 'Social'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">ACTION</div>
                    </div>
                  </div>
                </div>
                <div className="border-2 border-dashed border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-950/20 p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">USERS</div>
                    <div>
                      <div className="font-mono font-semibold text-gray-900 dark:text-white">{quest.currentParticipants}/{quest.maxParticipants}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">PARTICIPANTS</div>
                    </div>
                  </div>
                </div>
                <div className="border-2 border-dashed border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">START</div>
                    <div>
                      <div className="font-mono font-semibold text-gray-900 dark:text-white">{formatDistanceToNow(new Date(quest.startDate || Date.now()), { addSuffix: true })}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">START_DATE</div>
                    </div>
                  </div>
                </div>
                <div className="border-2 border-dashed border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-950/20 p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">END</div>
                    <div>
                      <div className="font-mono font-semibold text-gray-900 dark:text-white">{formatDistanceToNow(new Date(quest.endDate || Date.now()), { addSuffix: true })}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">END_DATE</div>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Quest Link Section */}
              {quest.quest_link && (
                <div className="mt-6 p-4 border-4 border-dashed border-green-400 dark:border-green-600 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">LINK</div>
                      <div>
                        <h3 className="font-mono font-semibold text-gray-900 dark:text-white">QUEST_LINK.exe</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">{'>>>'} Execute quest on external platform</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      {quest.user_status !== 'pending' && (
                        <>
                          <Button 
                            asChild 
                            size="lg"
                            className="border-4 border-dashed border-yellow-400 bg-gradient-to-r from-yellow-200 to-orange-200 dark:from-yellow-600/80 dark:to-orange-600/80 hover:from-yellow-300 hover:to-orange-300 dark:hover:from-yellow-500/90 dark:hover:to-orange-500/90 text-yellow-900 dark:text-yellow-100 font-mono font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse hover:animate-none px-8 py-4 text-lg"
                          >
                            <a href={quest.quest_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                              <span className="text-2xl">START</span>
                              <span className="tracking-wide">START_QUEST</span>
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          </Button>
                          <AlertDialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
                             <AlertDialogTrigger asChild>
                               <Button 
                                 onClick={handleVerifyClick}
                                 disabled={verifying}
                                 size="lg"
                                 className="border-4 border-dashed border-purple-400 bg-gradient-to-r from-purple-200 to-violet-200 dark:from-purple-600/80 dark:to-violet-600/80 hover:from-purple-300 hover:to-violet-300 dark:hover:from-purple-500/90 dark:hover:to-violet-500/90 text-purple-900 dark:text-purple-100 font-mono font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                               >
                                 <span className="text-2xl">VERIFY</span>
                                 <span className="tracking-wide">{verifying ? 'VERIFYING...' : 'VERIFY'}</span>
                                 <CheckSquare className="w-5 h-5" />
                               </Button>
                             </AlertDialogTrigger>
                         <AlertDialogContent className="border-4 border-dashed border-purple-400 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50">
                           <AlertDialogHeader>
                             <AlertDialogTitle className="font-mono text-xl text-purple-900 dark:text-purple-100 flex items-center gap-2">
                               <span className="text-2xl">WARNING</span>
                               VERIFY_QUEST.exe
                             </AlertDialogTitle>
                             <AlertDialogDescription className="font-mono text-purple-700 dark:text-purple-300">
                               Are you sure you want to verify this quest completion?
                               <br /><br />
                               This action will check if you have successfully completed all quest requirements.
                             </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter className="gap-3">
                             <AlertDialogCancel className="border-2 border-dashed border-gray-400 bg-gray-100 dark:bg-gray-800 font-mono hover:bg-gray-200 dark:hover:bg-gray-700">
                               CANCEL
                             </AlertDialogCancel>
                             <AlertDialogAction 
                               onClick={handleVerifyQuest}
                               className="border-2 border-dashed border-purple-400 bg-gradient-to-r from-purple-200 to-violet-200 dark:from-purple-600 dark:to-violet-600 text-purple-900 dark:text-purple-100 font-mono font-bold hover:from-purple-300 hover:to-violet-300 dark:hover:from-purple-500 dark:hover:to-violet-500"
                             >
                               YES, VERIFY
                             </AlertDialogAction>
                           </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                         </>
                       )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Verify Message */}
              {verifyMessage && (
                <Alert className={`mt-4 border-2 border-dashed font-mono ${
                  verifyMessage.includes('successful') 
                    ? 'border-green-400 bg-green-50 dark:bg-green-950/20' 
                    : 'border-red-400 bg-red-50 dark:bg-red-950/20'
                }`}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-mono">
                    {verifyMessage}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Quest Details */}
          <Tabs defaultValue="requirements" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-transparent">
              <TabsTrigger value="requirements" className="data-[state=active]:border-2 data-[state=active]:border-dashed data-[state=active]:border-green-400 data-[state=active]:bg-green-50 data-[state=active]:dark:bg-green-950/20 data-[state=active]:text-green-700 data-[state=active]:dark:text-green-300 font-mono font-medium rounded-lg transition-all">
                REQUIREMENTS
              </TabsTrigger>
              <TabsTrigger value="resources" className="data-[state=active]:border-2 data-[state=active]:border-dashed data-[state=active]:border-purple-400 data-[state=active]:bg-purple-50 data-[state=active]:dark:bg-purple-950/20 data-[state=active]:text-purple-700 data-[state=active]:dark:text-purple-300 font-mono font-medium rounded-lg transition-all">
                RESOURCES
              </TabsTrigger>
              <TabsTrigger value="badges" className="data-[state=active]:border-2 data-[state=active]:border-dashed data-[state=active]:border-yellow-400 data-[state=active]:bg-yellow-50 data-[state=active]:dark:bg-yellow-950/20 data-[state=active]:text-yellow-700 data-[state=active]:dark:text-yellow-300 font-mono font-medium rounded-lg transition-all">
                BADGES
              </TabsTrigger>
            </TabsList>

            <TabsContent value="requirements">
              <Card className="border-4 border-dashed border-green-400 dark:border-green-600 shadow-lg bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-gray-900">
                <CardHeader className="border-b-2 border-dashed border-green-300 dark:border-green-600 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-950/40 dark:to-green-950/20">
                  <CardTitle className="flex items-center gap-2 text-xl font-mono text-gray-900 dark:text-white">
                    <span className="text-2xl">REQ</span>
                    REQUIREMENTS.txt
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {(quest.requirements || []).map((requirement, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border-2 border-dashed border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-950/20 rounded-lg shadow-sm hover:shadow-md transition-all">
                        <div className="text-green-600 dark:text-green-400 text-xl mt-0.5">✓</div>
                        <span className="text-gray-700 dark:text-gray-300 leading-relaxed font-mono">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>



            <TabsContent value="resources">
              <Card className="border-4 border-dashed border-purple-400 dark:border-purple-600 shadow-lg bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-900">
                <CardHeader className="border-b-2 border-dashed border-purple-300 dark:border-purple-600 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-950/40 dark:to-purple-950/20">
                  <CardTitle className="flex items-center gap-2 text-xl font-mono text-gray-900 dark:text-white">
                    <span className="text-2xl">RES</span>
                    RESOURCES.db
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <a
                      href="https://docs.hedera.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-950/20 rounded-lg shadow-sm hover:shadow-md hover:border-gray-400 dark:hover:border-gray-500 transition-all"
                    >
                      <div className="text-2xl group-hover:scale-110 transition-transform">DOCS</div>
                      <div>
                        <div className="font-mono font-medium text-gray-900 dark:text-gray-100">HEDERA_DOCS.html</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{'>>>'} Official development documentation</div>
                      </div>
                    </a>
                    <a
                      href="https://portal.hedera.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 p-4 border-2 border-dashed border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-950/20 rounded-lg shadow-sm hover:shadow-md hover:border-green-400 dark:hover:border-green-500 transition-all"
                    >
                      <div className="text-2xl group-hover:scale-110 transition-transform">PORTAL</div>
                      <div>
                        <div className="font-mono font-medium text-gray-900 dark:text-gray-100">HEDERA_PORTAL.exe</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{'>>>'} Developer portal and tools</div>
                      </div>
                    </a>
                    <a
                      href="https://hashscan.io/testnet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 p-4 border-2 border-dashed border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-950/20 rounded-lg shadow-sm hover:shadow-md hover:border-orange-400 dark:hover:border-orange-500 transition-all"
                    >
                      <div className="text-2xl group-hover:scale-110 transition-transform">SCAN</div>
                      <div>
                        <div className="font-mono font-medium text-gray-900 dark:text-gray-100">HASHSCAN_EXPLORER.app</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{'>>>'} Blockchain explorer for Hedera</div>
                      </div>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="badges">
              <Card className="border-4 border-dashed border-yellow-400 dark:border-yellow-600 shadow-lg bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/30 dark:to-gray-900">
                <CardHeader className="border-b-2 border-dashed border-yellow-300 dark:border-yellow-600 bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-950/40 dark:to-yellow-950/20">
                  <CardTitle className="flex items-center gap-2 text-xl font-mono text-gray-900 dark:text-white">
                    <span className="text-2xl">BADGE</span>
                    BADGES.json
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(quest.badges || []).map((badge, index) => (
                      <div key={badge.id || index} className="group p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            {badge.image ? (
                              <Image
                                src={badge.image}
                                alt={badge.name}
                                width={64}
                                height={64}
                                className="rounded-lg object-cover border-2 border-dashed border-gray-400"
                              />
                            ) : (
                              <div className="w-16 h-16 border-2 border-dashed border-yellow-400 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center">
                                <span className="text-3xl">
                                  {badge.rarity === 'legendary' ? 'LEG' :
                                   badge.rarity === 'epic' ? 'EPIC' :
                                   'COMM'}
                                </span>
                              </div>
                            )}
                            <Badge 
                              className={cn(
                                "absolute -top-2 -right-2 text-xs px-2 py-0.5 font-mono border-2 border-dashed",
                                badge.rarity === 'legendary' && "border-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
                                badge.rarity === 'epic' && "border-purple-400 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200",
                                badge.rarity === 'rare' && "border-blue-400 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
                                badge.rarity === 'common' && "border-gray-400 bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200"
                              )}
                            >
                              {badge.rarity.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-mono font-semibold text-gray-900 dark:text-white mb-1">{badge.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 font-mono">{badge.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <span className="text-yellow-500 text-lg">★</span>
                                  <span className="text-sm font-mono font-medium text-gray-700 dark:text-gray-300">{badge.points} PTS</span>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                MAX: {badge.maxToObtain}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!quest.badges || quest.badges.length === 0) && (
                      <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                        <span className="text-6xl mb-3 block">BADGE</span>
                        <p className="font-mono">{'>>>'} NO BADGES FOUND</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card className="border-4 border-dashed border-green-400 dark:border-green-600 shadow-lg bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-gray-900 overflow-hidden">
            <CardHeader className="border-b-2 border-dashed border-green-300 dark:border-green-600 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-950/40 dark:to-green-950/20">
              <CardTitle className="flex items-center gap-2 font-mono text-gray-900 dark:text-white">
                <span className="text-2xl">STATUS</span>
                STATUS.log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {isCompleted ? (
                <div className="text-center py-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-dashed border-green-400 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-4xl">DONE</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-2 border-dashed border-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-lg">★</span>
                    </div>
                  </div>
                  <h3 className="font-mono font-bold text-lg text-green-600 dark:text-green-400 mb-2">
                    {'>>>'} QUEST_COMPLETED!
                  </h3>
                  <div className="border-2 border-dashed border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <p className="text-sm font-mono font-medium text-green-700 dark:text-green-300">
                      EARNED: {quest.points} POINTS
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 border-4 border-dashed border-blue-400 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">READY</span>
                  </div>
                  <h3 className="font-mono font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {'>>>'} READY_TO_START?
                  </h3>
                  <div className="border-2 border-dashed border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <p className="text-sm font-mono text-blue-700 dark:text-blue-300">
                      REWARD: <span className="font-bold">{quest.points} POINTS</span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prerequisites */}
          {(quest.prerequisites || []).length > 0 && (
            <Card className="border-4 border-dashed border-orange-400 dark:border-orange-600 shadow-lg bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-gray-900">
              <CardHeader className="border-b-2 border-dashed border-orange-300 dark:border-orange-600 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-950/40 dark:to-orange-950/20">
                <CardTitle className="flex items-center gap-2 font-mono text-gray-900 dark:text-white">
                  <span className="text-2xl">PREREQ</span>
                  PREREQUISITES.txt
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {(quest.prerequisites || []).map((prereqId) => (
                    <div key={prereqId} className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-sm">
                      <div className="p-1 border-2 border-dashed border-green-400 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
                      </div>
                      <span className="text-sm font-mono font-medium text-gray-700 dark:text-gray-300">QUEST_#{prereqId}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Stats */}
          <Card className="border-4 border-dashed border-indigo-400 dark:border-indigo-600 shadow-lg bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-gray-900">
            <CardHeader className="border-b-2 border-dashed border-indigo-300 dark:border-indigo-600 bg-gradient-to-r from-indigo-100 to-indigo-50 dark:from-indigo-950/40 dark:to-indigo-950/20">
              <CardTitle className="flex items-center gap-2 font-mono text-gray-900 dark:text-white">
                <span className="text-2xl">STATS</span>
                STATS.json
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-mono font-medium text-gray-700 dark:text-gray-300">COMPLETION_RATE</span>
                  <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">67%</span>
                </div>
                <Progress value={67} className="h-4 bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-400 rounded-lg" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-4 text-center">
                  <div className="text-3xl font-mono font-bold text-indigo-600 dark:text-indigo-400">{quest.completions}</div>
                  <div className="text-xs font-mono font-medium text-gray-600 dark:text-gray-400 mt-1">COMPLETED</div>
                </div>
                <div className="border-2 border-dashed border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 text-center">
                  <div className="text-3xl font-mono font-bold text-yellow-600 dark:text-yellow-400">4.8</div>
                  <div className="text-xs font-mono font-medium text-gray-600 dark:text-gray-400 mt-1">AVG_RATING</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}