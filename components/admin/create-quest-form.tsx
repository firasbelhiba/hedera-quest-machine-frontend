'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { QuestService } from '@/lib/services';
import { AlertCircle, CalendarIcon, Loader2, EyeOff, Eye, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge, Event } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { EventsApi } from '@/lib/api/events';

const createQuestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  reward: z.number().min(0, 'Reward must be positive'),
  difficulty: z.enum(['easy', 'medium', 'hard', 'beginner', 'intermediate', 'advanced', 'expert']),
  status: z.enum(['draft', 'active', 'completed', 'expired']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxParticipants: z.number().min(1, 'Max participants must be at least 1').optional(),
  badgeIds: z.array(z.number()).optional(),
  platform_type: z.string().optional(),
  interaction_type: z.string().optional(),
  quest_link: z.string().optional(),
  event_id: z.number().optional(),
});

type CreateQuestFormData = z.infer<typeof createQuestSchema>;

interface CreateQuestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateQuestForm({ onSuccess, onCancel }: CreateQuestFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'draft' | 'active' | 'completed' | 'expired'>('draft');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('18:00');
  const [selectedBadges, setSelectedBadges] = useState<number[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [platform, setPlatform] = useState('');
  const { toast } = useToast();

  const platformInteractions: { [key: string]: string[] } = {
    twitter: ['follow', 'like', 'comment', 'tweet'],
    facebook: ['follow', 'like', 'comment', 'share'],
    discord: ['join', 'message', 'react'],
  };

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateQuestFormData>({
    resolver: zodResolver(createQuestSchema),
    defaultValues: {
      status: 'draft',
      difficulty: 'intermediate',
      maxParticipants: 50,
    }
  });

  // Fetch badges and events when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingBadges(true);
        setLoadingEvents(true);
        
        const [badgesList, eventsList] = await Promise.all([
          QuestService.getAllBadges(),
          EventsApi.list()
        ]);
        
        setBadges(badgesList);
        setEvents(eventsList);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoadingBadges(false);
        setLoadingEvents(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: CreateQuestFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Submitting quest data:', data);
      
      // Format dates with times
      const formatDateTime = (date: Date | undefined, time: string) => {
        if (!date) return '';
        const [hours, minutes] = time.split(':');
        const dateWithTime = new Date(date);
        dateWithTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return dateWithTime.toISOString().slice(0, 19);
      };

      const questData = { 
        ...data, 
        status,
        startDate: formatDateTime(startDate, startTime),
        endDate: formatDateTime(endDate, endTime),
        badgeIds: selectedBadges.length > 0 ? selectedBadges : undefined
      };
      
      await QuestService.createQuest(questData);
      console.log('Quest created successfully');
      toast({
        title: 'Quest Created',
        description: `The quest "${data.title}" has been successfully created.`,
      });
      onSuccess?.();
    } catch (err) {
      console.error('Error creating quest:', err);
      setError(err instanceof Error ? err.message : 'Failed to create quest. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Create New Quest</h2>
        <p className="text-muted-foreground">Fill in the details below to create a new quest</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quest Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter quest title"
                  className="max-w-md"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter detailed quest description"
                  rows={4}
                  className="max-w-2xl"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Quest Settings */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Quest Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="reward">Reward (points) *</Label>
                <Input
                  id="reward"
                  type="number"
                  placeholder="Enter reward points"
                  className="max-w-xs"
                  {...register('reward', { valueAsNumber: true })}
                />
                {errors.reward && (
                  <p className="text-sm text-destructive">{errors.reward.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max Participants *</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  placeholder="Enter max participants"
                  className="max-w-xs"
                  {...register('maxParticipants', { valueAsNumber: true })}
                />
                {errors.maxParticipants && (
                  <p className="text-sm text-destructive">{errors.maxParticipants.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform_type">Platform Type</Label>
                <Select onValueChange={(value) => {
                  setPlatform(value);
                  setValue('platform_type', value);
                }}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="discord">Discord</SelectItem>
                  </SelectContent>
                </Select>
                {errors.platform_type && (
                  <p className="text-sm text-destructive">{errors.platform_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quest_link">Quest Link</Label>
                <Input
                  id="quest_link"
                  placeholder="Enter quest link"
                  className="max-w-xs"
                  {...register('quest_link')}
                />
                {errors.quest_link && (
                  <p className="text-sm text-destructive">{errors.quest_link.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="interaction_type">Interaction Type</Label>
                <Select onValueChange={(value) => setValue('interaction_type', value)} disabled={!platform}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Select an interaction" />
                  </SelectTrigger>
                  <SelectContent>
                    {platform && platformInteractions[platform]?.map((interaction) => (
                      <SelectItem key={interaction} value={interaction}>
                        {interaction.charAt(0).toUpperCase() + interaction.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.interaction_type && (
                  <p className="text-sm text-destructive">{errors.interaction_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_id">Associated Event (Optional)</Label>
                {loadingEvents ? (
                  <div className="flex items-center space-x-2 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading events...</span>
                  </div>
                ) : (
                  <Select onValueChange={(value) => setValue('event_id', value === 'none' ? undefined : Number(value))}>
                    <SelectTrigger className="max-w-xs">
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No event</SelectItem>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={String(event.id)}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.event_id && (
                  <p className="text-sm text-destructive">{errors.event_id.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Associate this quest with a specific event
                </p>
              </div>

                             <div className="space-y-2">
                 <Label htmlFor="difficulty">Difficulty *</Label>
                 <Select onValueChange={(value) => setValue('difficulty', value as any)} defaultValue="medium">
                   <SelectTrigger className="max-w-xs">
                     <SelectValue placeholder="Select difficulty" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="easy">Easy</SelectItem>
                     <SelectItem value="medium">Medium</SelectItem>
                     <SelectItem value="hard">Hard</SelectItem>
                     <SelectItem value="beginner">Beginner</SelectItem>
                     <SelectItem value="intermediate">Intermediate</SelectItem>
                     <SelectItem value="advanced">Advanced</SelectItem>
                     <SelectItem value="expert">Expert</SelectItem>
                   </SelectContent>
                 </Select>
                 {errors.difficulty && (
                   <p className="text-sm text-destructive">{errors.difficulty.message}</p>
                 )}
               </div>

                             <div className="space-y-2">
                 <Label htmlFor="status">Status *</Label>
                 <div className="flex flex-wrap items-center gap-2">
                   <Button
                     type="button"
                     variant={status === 'draft' ? 'default' : 'outline'}
                     size="sm"
                     onClick={() => setStatus('draft')}
                     className="flex items-center space-x-2"
                   >
                     <EyeOff className="h-4 w-4" />
                     <span>Draft</span>
                   </Button>
                   <Button
                     type="button"
                     variant={status === 'active' ? 'default' : 'outline'}
                     size="sm"
                     onClick={() => setStatus('active')}
                     className="flex items-center space-x-2"
                   >
                     <Eye className="h-4 w-4" />
                     <span>Active</span>
                   </Button>
                   <Button
                     type="button"
                     variant={status === 'completed' ? 'default' : 'outline'}
                     size="sm"
                     onClick={() => setStatus('completed')}
                     className="flex items-center space-x-2"
                   >
                     <span>Completed</span>
                   </Button>
                   <Button
                     type="button"
                     variant={status === 'expired' ? 'default' : 'outline'}
                     size="sm"
                     onClick={() => setStatus('expired')}
                     className="flex items-center space-x-2"
                   >
                     <span>Expired</span>
                   </Button>
                 </div>
                 <p className="text-xs text-muted-foreground">
                   {status === 'draft' ? 'Quest will be saved as draft and not visible to users' : 
                    status === 'active' ? 'Quest will be published and visible to users' : 
                    status === 'completed' ? 'Quest will be marked as completed' : 
                    'Quest will be marked as expired'}
                 </p>
               </div>
               
               <div className="space-y-2 col-span-1 md:col-span-2">
                 <Label htmlFor="badgeIds">Badge Rewards (Optional)</Label>
                 <div className="max-w-2xl">
                   {loadingBadges ? (
                     <div className="flex items-center space-x-2 py-2">
                       <Loader2 className="h-4 w-4 animate-spin" />
                       <span className="text-sm text-muted-foreground">Loading badges...</span>
                     </div>
                   ) : badges.length > 0 ? (
                     <div>
                       <Select
                         onValueChange={(value) => {
                           const badgeId = Number(value);
                           if (!selectedBadges.includes(badgeId)) {
                             setSelectedBadges([...selectedBadges, badgeId]);
                           }
                         }}
                       >
                         <SelectTrigger className="w-full">
                           <SelectValue placeholder="Select badges to award" />
                         </SelectTrigger>
                         <SelectContent>
                           {badges.map((badge) => (
                             <SelectItem key={badge.id} value={String(badge.id)}>
                               {badge.name}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                       
                       {selectedBadges.length > 0 && (
                         <div className="mt-2 flex flex-wrap gap-2">
                           {selectedBadges.map(badgeId => {
                             const badge = badges.find(b => Number(b.id) === badgeId);
                             return badge ? (
                               <div key={badgeId} className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
                                 {badge.name}
                                 <Button 
                                   type="button" 
                                   variant="ghost" 
                                   size="sm" 
                                   className="h-4 w-4 p-0 ml-1"
                                   onClick={() => setSelectedBadges(selectedBadges.filter(id => id !== badgeId))}
                                 >
                                   ×
                                 </Button>
                               </div>
                             ) : null;
                           })}
                         </div>
                       )}
                     </div>
                   ) : (
                     <p className="text-sm text-muted-foreground py-2">No badges available</p>
                   )}
                 </div>
                 <p className="text-xs text-muted-foreground">
                   Select badges that will be awarded to users who complete this quest
                 </p>
               </div>
            </div>
          </div>

                     {/* Schedule */}
           <div className="space-y-6">
             <h3 className="text-lg font-semibold border-b pb-2">Schedule</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                 <div className="space-y-2">
                   <Label>Start Date & Time *</Label>
                   <div className="flex space-x-2">
                     <Popover>
                       <PopoverTrigger asChild>
                         <Button
                           variant="outline"
                           className={cn(
                             "w-[200px] justify-start text-left font-normal",
                             !startDate && "text-muted-foreground"
                           )}
                         >
                           <CalendarIcon className="mr-2 h-4 w-4" />
                           {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                         </Button>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0" align="start">
                         <Calendar
                           mode="single"
                           selected={startDate}
                           onSelect={setStartDate}
                           initialFocus
                           disabled={(date) => {
                             const today = new Date();
                             today.setHours(0, 0, 0, 0);
                             return date < today;
                           }}
                         />
                       </PopoverContent>
                     </Popover>
                     <div className="flex items-center space-x-2">
                       <Clock className="h-4 w-4 text-muted-foreground" />
                       <Input
                         type="time"
                         value={startTime}
                         onChange={(e) => setStartTime(e.target.value)}
                         className="w-[120px]"
                       />
                     </div>
                   </div>
                   {!startDate && (
                     <p className="text-sm text-destructive">Start date is required</p>
                   )}
                 </div>
               </div>

               <div className="space-y-4">
                 <div className="space-y-2">
                   <Label>End Date & Time *</Label>
                   <div className="flex space-x-2">
                     <Popover>
                       <PopoverTrigger asChild>
                         <Button
                           variant="outline"
                           className={cn(
                             "w-[200px] justify-start text-left font-normal",
                             !endDate && "text-muted-foreground"
                           )}
                         >
                           <CalendarIcon className="mr-2 h-4 w-4" />
                           {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                         </Button>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0" align="start">
                         <Calendar
                           mode="single"
                           selected={endDate}
                           onSelect={setEndDate}
                           initialFocus
                           disabled={(date) => {
                             const today = new Date();
                             today.setHours(0, 0, 0, 0);
                             return date < today || (startDate ? date < startDate : false);
                           }}
                         />
                       </PopoverContent>
                     </Popover>
                     <div className="flex items-center space-x-2">
                       <Clock className="h-4 w-4 text-muted-foreground" />
                       <Input
                         type="time"
                         value={endTime}
                         onChange={(e) => setEndTime(e.target.value)}
                         className="w-[120px]"
                       />
                     </div>
                   </div>
                   {!endDate && (
                     <p className="text-sm text-destructive">End date is required</p>
                   )}
                 </div>
               </div>
             </div>
           </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading} className="min-w-[120px]">
              {isLoading ? 'Creating...' : 'Create Quest'}
            </Button>
          </div>
        </form>
      </div>
  );
}
