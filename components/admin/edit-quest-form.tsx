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
import { AlertCircle, CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge, Quest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const editQuestSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  reward: z.number().min(0, 'Reward must be positive').optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  status: z.enum(['draft', 'active', 'completed', 'expired']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxParticipants: z.number().min(1, 'Max participants must be at least 1').optional(),
  badgeIds: z.array(z.number()).optional(),
});

type EditQuestFormData = z.infer<typeof editQuestSchema>;

interface EditQuestFormProps {
  quest: Quest;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditQuestForm({ quest, onSuccess, onCancel }: EditQuestFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'draft' | 'active' | 'completed' | 'expired'>(quest.status as any || 'draft');
  const [startDate, setStartDate] = useState<Date | undefined>(
    quest.startDate ? new Date(quest.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    quest.endDate ? new Date(quest.endDate) : undefined
  );
  const [startTime, setStartTime] = useState(() => {
    if (quest.startDate) {
      const date = new Date(quest.startDate);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    return '12:00';
  });
  const [endTime, setEndTime] = useState(() => {
    if (quest.endDate) {
      const date = new Date(quest.endDate);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    return '18:00';
  });
  const [selectedBadges, setSelectedBadges] = useState<number[]>(
    quest.badges?.map(badge => typeof badge === 'object' ? badge.id : badge) || []
  );
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<EditQuestFormData>({
    resolver: zodResolver(editQuestSchema),
    defaultValues: {
      title: quest.title,
      description: quest.description,
      reward: typeof quest.reward === 'string' ? parseFloat(quest.reward) : quest.reward,
      difficulty: quest.difficulty as any,
      status: quest.status as any,
      maxParticipants: quest.maxParticipants,
    }
  });

  // Fetch badges when component mounts
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoadingBadges(true);
        const badgesList = await QuestService.getAllBadges();
        setBadges(badgesList);
      } catch (err) {
        console.error('Error fetching badges:', err);
      } finally {
        setLoadingBadges(false);
      }
    };

    fetchBadges();
  }, []);

  const onSubmit = async (data: EditQuestFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Updating quest data:', data);
      
      // Format dates with times
      const formatDateTime = (date: Date | undefined, time: string) => {
        if (!date) return undefined;
        const [hours, minutes] = time.split(':');
        const dateWithTime = new Date(date);
        dateWithTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return dateWithTime.toISOString();
      };

      // Only include fields that have been modified
      const updateData: any = {};
      
      if (data.title !== undefined && data.title !== quest.title) {
        updateData.title = data.title;
      }
      if (data.description !== undefined && data.description !== quest.description) {
        updateData.description = data.description;
      }
      if (data.reward !== undefined && data.reward !== (typeof quest.reward === 'string' ? parseFloat(quest.reward) : quest.reward)) {
        updateData.reward = data.reward;
      }
      if (data.difficulty !== undefined && data.difficulty !== quest.difficulty) {
        updateData.difficulty = data.difficulty;
      }
      if (status !== quest.status) {
        updateData.status = status;
      }
      if (data.maxParticipants !== undefined && data.maxParticipants !== quest.maxParticipants) {
        updateData.maxParticipants = data.maxParticipants;
      }
      
      const formattedStartDate = formatDateTime(startDate, startTime);
      const formattedEndDate = formatDateTime(endDate, endTime);
      
      if (formattedStartDate !== quest.startDate) {
        updateData.startDate = formattedStartDate;
      }
      if (formattedEndDate !== quest.endDate) {
        updateData.endDate = formattedEndDate;
      }
      
      const currentBadgeIds = quest.badges?.map(badge => typeof badge === 'object' ? badge.id : badge) || [];
      if (JSON.stringify(selectedBadges.sort()) !== JSON.stringify(currentBadgeIds.sort())) {
        updateData.badgeIds = selectedBadges.length > 0 ? selectedBadges : [];
      }
      
      if (Object.keys(updateData).length === 0) {
        toast({
          title: 'No Changes',
          description: 'No changes were made to the quest.',
        });
        onSuccess?.();
        return;
      }
      
      await QuestService.updateQuest(String(quest.id), updateData);
      console.log('Quest updated successfully');
      toast({
        title: 'Quest Updated',
        description: `The quest "${data.title || quest.title}" has been successfully updated.`,
      });
      onSuccess?.();
    } catch (err) {
      console.error('Error updating quest:', err);
      setError(err instanceof Error ? err.message : 'Failed to update quest. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBadge = (badgeId: number) => {
    setSelectedBadges(prev => 
      prev.includes(badgeId) 
        ? prev.filter(id => id !== badgeId)
        : [...prev, badgeId]
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Edit Quest</h2>
        <p className="text-muted-foreground">Update the quest details below</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quest Title</Label>
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
              <Label htmlFor="description">Description</Label>
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
              <Label htmlFor="reward">Reward (points)</Label>
              <Input
                id="reward"
                type="number"
                placeholder="150"
                className="max-w-xs"
                {...register('reward', { valueAsNumber: true })}
              />
              {errors.reward && (
                <p className="text-sm text-destructive">{errors.reward.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                placeholder="50"
                className="max-w-xs"
                {...register('maxParticipants', { valueAsNumber: true })}
              />
              {errors.maxParticipants && (
                <p className="text-sm text-destructive">{errors.maxParticipants.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={watch('difficulty') || quest.difficulty}
                onValueChange={(value) => setValue('difficulty', value as any)}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">Schedule</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label>Start Date & Time</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-32"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>End Date & Time</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-32"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Associated Badges */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">Associated Badges</h3>
          
          {loadingBadges ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading badges...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-colors",
                    selectedBadges.includes(Number(badge.id))
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => toggleBadge(Number(badge.id))}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{badge.icon}</div>
                    <div>
                      <h4 className="font-medium">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6 border-t">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Quest
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}