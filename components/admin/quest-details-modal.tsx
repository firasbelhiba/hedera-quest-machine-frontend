'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, Users, Award, ExternalLink, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface QuestCompletion {
  id: number;
  questId: number;
  userId: number;
  status: 'pending' | 'approved' | 'rejected';
  completedAt: string;
  validatedAt: string | null;
  rejectedAt: string | null;
  validatedBy: number | null;
  rejectionReason: string | null;
  evidence: string | null;
  rewardEarned: number | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    facebookProfile?: {
      id: number;
      facebook_id: string;
      firstname: string;
      lastname: string;
      email: string;
    };
    twitterProfile?: {
      id: number;
      twitter_id: string;
      twitter_username: string;
      twitter_profile_picture: string;
    };
    discordProfile?: {
      id: number;
      discord_id: string;
      discord_username: string;
      discord_picture: string | null;
    };
  };
}

interface QuestDetails {
  id: number;
  title: string;
  description: string;
  reward: string;
  difficulty: string;
  status: string;
  startDate: string;
  endDate: string;
  maxParticipants: number | null;
  currentParticipants: number;
  platform_type: string;
  interaction_type: string;
  quest_link: string;
  createdBy: number;
  added_by: number;
  event_id: number | null;
  progress_to_add: number;
  created_at: string;
  updated_at: string;
  completions: QuestCompletion[];
}

interface QuestDetailsModalProps {
  quest: QuestDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  active: 'bg-blue-100 text-blue-800 border-blue-300',
  completed: 'bg-green-100 text-green-800 border-green-300',
  expired: 'bg-gray-100 text-gray-800 border-gray-300',
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  hard: 'bg-red-100 text-red-800 border-red-300',
  beginner: 'bg-green-100 text-green-800 border-green-300',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  advanced: 'bg-orange-100 text-orange-800 border-orange-300',
  expert: 'bg-red-100 text-red-800 border-red-300',
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'rejected':
      return <XCircle className="w-4 h-4 text-red-600" />;
    case 'pending':
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-600" />;
  }
};

export default function QuestDetailsModal({ quest, isOpen, onClose }: QuestDetailsModalProps) {
  if (!quest) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return '🐦';
      case 'facebook':
        return '📘';
      case 'discord':
        return '💬';
      default:
        return '🌐';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-mono flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            QUEST DETAILS
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Quest Header */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-mono mb-2">{quest.title}</CardTitle>
                    <p className="text-muted-foreground mb-4">{quest.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${statusColors[quest.status as keyof typeof statusColors]} font-mono`}>
                        {quest.status.toUpperCase()}
                      </Badge>
                      <Badge className={`${difficultyColors[quest.difficulty as keyof typeof difficultyColors]} font-mono`}>
                        {quest.difficulty.toUpperCase()}
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-mono">
                        {quest.reward} PTS
                      </Badge>
                    </div>
                  </div>
                  {quest.quest_link && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(quest.quest_link.trim(), '_blank')}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Quest
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Quest Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-mono flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    TIMELINE
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Start Date:</span>
                    <span className="text-sm font-mono">
                      {format(new Date(quest.startDate), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">End Date:</span>
                    <span className="text-sm font-mono">
                      {format(new Date(quest.endDate), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <span className="text-sm font-mono">
                      {formatDistanceToNow(new Date(quest.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-mono flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    PARTICIPATION
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Participants:</span>
                    <span className="text-sm font-mono font-bold">{quest.currentParticipants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Max Participants:</span>
                    <span className="text-sm font-mono">
                      {quest.maxParticipants || 'Unlimited'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Platform:</span>
                    <span className="text-sm font-mono flex items-center gap-1">
                      {getPlatformIcon(quest.platform_type)}
                      {quest.platform_type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Interaction:</span>
                    <span className="text-sm font-mono">{quest.interaction_type.toUpperCase()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quest Completions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-mono flex items-center gap-2">
                  <User className="w-4 h-4" />
                  COMPLETIONS ({quest.completions?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!quest.completions || quest.completions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-mono">No completions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quest.completions.map((completion) => (
                      <Card key={completion.id} className="border border-muted">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage 
                                  src={completion.user.twitterProfile?.twitter_profile_picture?.trim()} 
                                  alt={completion.user.username}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary font-mono text-xs">
                                  {getInitials(completion.user.firstName, completion.user.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-sm">
                                  {completion.user.firstName} {completion.user.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">
                                  @{completion.user.username}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusIcon status={completion.status} />
                              <Badge className={`${statusColors[completion.status]} font-mono text-xs`}>
                                {completion.status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          
                          <Separator className="my-3" />
                          
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-muted-foreground">Completed:</span>
                              <div className="font-mono">
                                {format(new Date(completion.completedAt), 'MMM dd, yyyy HH:mm')}
                              </div>
                            </div>
                            {completion.validatedAt && (
                              <div>
                                <span className="text-muted-foreground">Validated:</span>
                                <div className="font-mono">
                                  {format(new Date(completion.validatedAt), 'MMM dd, yyyy HH:mm')}
                                </div>
                              </div>
                            )}
                            {completion.rewardEarned && (
                              <div>
                                <span className="text-muted-foreground">Reward:</span>
                                <div className="font-mono font-bold text-green-600">
                                  {completion.rewardEarned} PTS
                                </div>
                              </div>
                            )}
                            {completion.rejectionReason && (
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Rejection Reason:</span>
                                <div className="text-red-600 text-xs mt-1">
                                  {completion.rejectionReason}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Social Media Profiles */}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {completion.user.twitterProfile && (
                              <Badge variant="outline" className="text-xs">
                                🐦 @{completion.user.twitterProfile.twitter_username}
                              </Badge>
                            )}
                            {completion.user.facebookProfile && (
                              <Badge variant="outline" className="text-xs">
                                📘 {completion.user.facebookProfile.firstname} {completion.user.facebookProfile.lastname}
                              </Badge>
                            )}
                            {completion.user.discordProfile && (
                              <Badge variant="outline" className="text-xs">
                                💬 {completion.user.discordProfile.discord_username}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}