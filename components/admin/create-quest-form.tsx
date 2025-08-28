'use client';

import { useCallback, useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { CalendarIcon, CheckCircle, XCircle, Loader2, Clock, AlertCircle, EyeOff, Eye } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { QuestService } from '@/lib/services'
import { Badge, Event } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import DOMPurify from 'dompurify'



// Input sanitization helper
const sanitizeInput = (input: string) => {
  if (typeof window !== 'undefined' && DOMPurify) {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }
  return input.replace(/<[^>]*>/g, '').replace(/[<>"'&]/g, '');
};

// URL validation regex
const urlRegex = /^(https?:\/\/)?(([\da-z\.-]+)\.([a-z\.]{2,6})|localhost)(:[0-9]{1,5})?([\/?#][^\s]*)?$/i;

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
  const [platform, setPlatform] = useState<string>('');

  const { toast } = useToast();

  // Add ref to track focused input field to prevent cursor jumping
  const inputFocusRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const platformInteractions: { [key: string]: string[] } = {
    twitter: ['follow', 'like', 'comment', 'tweet'],
    facebook: ['follow', 'like', 'comment', 'share'],
    discord: ['join', 'message', 'react'],
    other: ['visit', 'signup', 'complete', 'submit', 'participate'],
  };

  const { register, handleSubmit, setValue, watch } = useForm<CreateQuestFormData>();

  // Watch form values for real-time validation
  const watchedValues = watch();



  // Fetch badges and events when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingBadges(true);
        setLoadingEvents(true);

        const [badgesList, eventsList] = await Promise.all([
          QuestService.getAllBadges(),
          QuestService.getEvents()
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
      // Final validation before submission
      const dateErrors = validateDates();
      if (dateErrors.length > 0) {
        setError(`Validation errors: ${dateErrors.join(', ')}`);
        setIsLoading(false);
        return;
      }

      // Additional business logic validation
      if (selectedBadges.length > 10) {
        setError('Cannot assign more than 10 badges to a single quest');
        setIsLoading(false);
        return;
      }

      if (data.reward && data.reward > 0 && selectedBadges.length === 0 && status === 'active') {
        const confirmProceed = window.confirm(
          'This quest offers points but no badges. Are you sure you want to proceed?'
        );
        if (!confirmProceed) {
          setIsLoading(false);
          return;
        }
      }

      console.log('Submitting quest data:', data);

      // Format dates with times
      const formatDateTime = (date: Date | undefined, time: string) => {
        if (!date) return '';
        const [hours, minutes] = time.split(':');
        const dateWithTime = new Date(date);
        dateWithTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return dateWithTime.toISOString().slice(0, 19);
      };

      // Update form values for validation
      setValue('startDate', formatDateTime(startDate, startTime));
      setValue('endDate', formatDateTime(endDate, endTime));

      // Sanitize and validate final data
      const questData = {
        ...data,
        title: sanitizeInput(data.title.trim()),
        description: sanitizeInput(data.description.trim()),
        status,
        startDate: formatDateTime(startDate, startTime),
        endDate: formatDateTime(endDate, endTime),
        badgeIds: selectedBadges.length > 0 ? selectedBadges : undefined,
        quest_link: data.quest_link ? sanitizeInput(data.quest_link.trim()) : undefined
      };

      await QuestService.createQuest(questData);
      console.log('Quest created successfully');
      toast({
        title: 'Quest Created Successfully',
        description: `The quest "${questData.title}" has been created with ${status} status.`,
      });
      onSuccess?.();
    } catch (err) {
      console.error('Error creating quest:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create quest. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Error Creating Quest',
        description: errorMessage,
        variant: 'destructive'
      });
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
            <div>
              <Label htmlFor="title">Quest Title *</Label>
              <Input
                id="title"
                placeholder="Enter quest title (max 100 characters)"
                className="max-w-md pr-8"
                {...register('title')}
                maxLength={100}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Required field</span>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Enter detailed quest description (10-2000 characters)"
                rows={4}
                className="max-w-2xl"
                {...register('description')}
                maxLength={2000}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Minimum 10 characters required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quest Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">Quest Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="reward">Reward (points) *</Label>
              <Input
                id="reward"
                type="number"
                placeholder="0-10,000 points"
                className="max-w-xs"
                min="0"
                max="10000"
                step="1"
                {...register('reward', { valueAsNumber: true })}
              />
              <span className="text-xs text-muted-foreground">Whole numbers only, max 10,000</span>
            </div>

            <div>
              <Label htmlFor="maxParticipants">Max Participants *</Label>
              <Input
                id="maxParticipants"
                type="number"
                placeholder="1-100,000 participants"
                className="max-w-xs"
                min="1"
                max="100000"
                step="1"
                {...register('maxParticipants', { valueAsNumber: true })}
              />
              <span className="text-xs text-muted-foreground">Minimum 1, maximum 100,000</span>
            </div>

            <div>
              <Label htmlFor="platform_type">Platform Type *</Label>
              <Select onValueChange={(value) => {
                setPlatform(value);
                setValue('platform_type', value);
                setValue('interaction_type', '');
              }}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">Choose the social media platform</span>
            </div>

            <div>
              <Label htmlFor="quest_link">Quest Link *</Label>
              <Input
                id="quest_link"
                type="url"
                placeholder="https://example.com (max 500 characters)"
                className="max-w-md"
                maxLength={500}
                {...register('quest_link')}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Must be a valid URL</span>
              </div>
            </div>

            <div>
              <Label htmlFor="interaction_type">Interaction Type *</Label>
              <Select onValueChange={(value) => {
                setValue('interaction_type', value);
              }}>
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
              <span className="text-xs text-muted-foreground">
                {!platform ? 'Select a platform first' : 'Choose the required user action'}
              </span>
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

              <p className="text-xs text-muted-foreground">
                Associate this quest with a specific event
              </p>
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty *</Label>
              <Select onValueChange={(value) => {
                setValue('difficulty', value as any);
              }} defaultValue="medium">
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">Quest complexity level</span>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant={status === 'draft' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatus('draft');
                    setValue('status', 'draft');
                  }}
                  className="flex items-center space-x-2"
                >
                  <EyeOff className="h-4 w-4" />
                  <span>Draft</span>
                </Button>
                <Button
                  type="button"
                  variant={status === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatus('active');
                    setValue('status', 'active');
                  }}
                  className="flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Active</span>
                </Button>
                <Button
                  type="button"
                  variant={status === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatus('completed');
                    setValue('status', 'completed');
                  }}
                  className="flex items-center space-x-2"
                >
                  <span>Completed</span>
                </Button>
                <Button
                  type="button"
                  variant={status === 'expired' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatus('expired');
                    setValue('status', 'expired');
                  }}
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
                <Label>Start Date & Time *</Label>
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
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
                        onSelect={(date) => {
                          console.log('Start date selected:', date);
                          setTouchedDateFields(prev => ({ ...prev, startDate: true }));
                          if (date) {
                            setStartDate(date);
                            setValue('startDate', date.toISOString().split('T')[0]);
                          } else {
                            setStartDate(undefined);
                            setValue('startDate', '');
                          }
                        }}
                        initialFocus
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value);
                        setTouchedDateFields(prev => ({ ...prev, startDate: true }));
                      }}
                      className="w-[120px]"
                      ref={inputFocusRef}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">Cannot be in the past</span>
            </div>

            <div className="space-y-4">
                <Label>End Date & Time *</Label>
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
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
                        onSelect={(date) => {
                          console.log('End date selected:', date);
                          setTouchedDateFields(prev => ({ ...prev, endDate: true }));
                          if (date) {
                            setEndDate(date);
                            setValue('endDate', date.toISOString().split('T')[0]);
                          } else {
                            setEndDate(undefined);
                            setValue('endDate', '');
                          }
                        }}
                        initialFocus
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today || (startDate ? date < startDate : false);
                        }}
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => {
                        setEndTime(e.target.value);
                        setTouchedDateFields(prev => ({ ...prev, endDate: true }));
                      }}
                      className="w-[120px]"
                      ref={inputFocusRef}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">Must be after start date and time</span>
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
