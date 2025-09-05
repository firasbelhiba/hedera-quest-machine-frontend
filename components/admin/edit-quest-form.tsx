"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { QuestService } from "@/lib/services";
import { AlertCircle, CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge, Quest, Event } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { EventsApi } from "@/lib/api/events";

const editQuestSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .optional(),
  reward: z.number().min(0, "Reward must be positive").optional(),
  difficulty: z.enum(["easy", "medium", "hard", "expert"]).optional(),
  status: z.enum(["draft", "active", "completed", "expired"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxParticipants: z
    .number()
    .min(0, "Max participants cannot be negative")
    .optional()
    .nullable(),
  badgeIds: z.array(z.number()).optional(),
  platform_type: z.string().optional(),
  interaction_type: z.string().optional(),
  quest_link: z.string().optional(),
  event_id: z.number().optional(),
});

type EditQuestFormData = z.infer<typeof editQuestSchema>;

interface EditQuestFormProps {
  quest: Quest;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditQuestForm({
  quest,
  onSuccess,
  onCancel,
}: EditQuestFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "draft" | "active" | "completed" | "expired"
  >((quest.status as any) || "draft");
  const [startDate, setStartDate] = useState<Date | undefined>(
    quest.startDate ? new Date(quest.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    quest.endDate ? new Date(quest.endDate) : undefined
  );
  const [startTime, setStartTime] = useState(() => {
    if (quest.startDate) {
      const date = new Date(quest.startDate);
      return `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    }
    return "12:00";
  });
  const [endTime, setEndTime] = useState(() => {
    if (quest.endDate) {
      const date = new Date(quest.endDate);
      return `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    }
    return "18:00";
  });
  const [selectedBadges, setSelectedBadges] = useState<number[]>(
    quest.badges?.map((badge) =>
      typeof badge === "object" ? badge.id : badge
    ) || []
  );
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EditQuestFormData>({
    resolver: zodResolver(editQuestSchema),
    defaultValues: {
      title: quest.title,
      description: quest.description,
      reward:
        typeof quest.reward === "string"
          ? parseFloat(quest.reward)
          : quest.reward,
      difficulty: quest.difficulty as any,
      status: quest.status as any,
      maxParticipants: quest.maxParticipants,
    },
  });

  // Fetch badges and events when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingBadges(true);
        setLoadingEvents(true);

        const [badgesList, eventsList] = await Promise.all([
          QuestService.getAllBadges(),
          EventsApi.list(),
        ]);

        setBadges(badgesList);
        setEvents(eventsList);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoadingBadges(false);
        setLoadingEvents(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: EditQuestFormData) => {
    setIsLoading(true);
    setError(null);

    // Show loading toast
    const loadingToast = toast({
      title: "Updating Quest...",
      description: "Please wait while we save your changes.",
      variant: "default"
    });

    try {
      console.log("Updating quest data:", data);

      // Format dates with times
      const formatDateTime = (date: Date | undefined, time: string) => {
        if (!date) return undefined;
        const [hours, minutes] = time.split(":");
        const dateWithTime = new Date(date);
        dateWithTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return dateWithTime.toISOString();
      };

      // Only include fields that have been modified
      const updateData: any = {};

      if (data.title !== undefined && data.title !== quest.title) {
        updateData.title = data.title;
      }
      if (
        data.description !== undefined &&
        data.description !== quest.description
      ) {
        updateData.description = data.description;
      }
      if (
        data.reward !== undefined &&
        data.reward !==
          (typeof quest.reward === "string"
            ? parseFloat(quest.reward)
            : quest.reward)
      ) {
        updateData.reward = data.reward;
      }
      if (
        data.difficulty !== undefined &&
        data.difficulty !== quest.difficulty
      ) {
        updateData.difficulty = data.difficulty;
      }
      if (status !== quest.status) {
        updateData.status = status;
      }
      if (
        data.maxParticipants !== undefined &&
        data.maxParticipants !== quest.maxParticipants
      ) {
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

      const currentBadgeIds =
        quest.badges?.map((badge) =>
          typeof badge === "object" ? badge.id : badge
        ) || [];
      if (
        JSON.stringify(selectedBadges.sort()) !==
        JSON.stringify(currentBadgeIds.sort())
      ) {
        updateData.badgeIds = selectedBadges.length > 0 ? selectedBadges : [];
      }

      if (data.event_id !== quest.event_id) {
        updateData.event_id = data.event_id;
      }
      if (data.platform_type !== quest.platform_type) {
        updateData.platform_type = data.platform_type;
      }
      if (data.interaction_type !== quest.interaction_type) {
        updateData.interaction_type = data.interaction_type;
      }
      if (data.quest_link !== quest.quest_link) {
        updateData.quest_link = data.quest_link;
      }

      if (Object.keys(updateData).length === 0) {
        // Dismiss loading toast
        loadingToast.dismiss();
        
        toast({
          title: "No Changes Detected",
          description: "No modifications were made to the quest.",
          variant: "default"
        });
        onSuccess?.();
        return;
      }

      await QuestService.updateQuest(String(quest.id), updateData);
      
      // Dismiss loading toast
      loadingToast.dismiss();
      
      console.log("Quest updated successfully");
      
      // Show success toast with details about what was updated
      const updatedFields = Object.keys(updateData);
      let successDescription = `"${data.title || quest.title}" has been successfully updated.`;
      
      if (updatedFields.includes('status')) {
        if (updateData.status === 'active') {
          successDescription += " The quest is now live and available to users.";
        } else if (updateData.status === 'draft') {
          successDescription += " The quest has been saved as a draft.";
        }
      }
      
      if (updatedFields.includes('reward')) {
        successDescription += ` Reward updated to ${updateData.reward} points.`;
      }
      
      toast({
        title: "Quest Updated Successfully! ✅",
        description: successDescription,
        variant: "default"
      });
      
      onSuccess?.();
    } catch (err) {
      // Dismiss loading toast
      loadingToast.dismiss();
      
      console.error("Error updating quest:", err);
      const errorMessage = err instanceof Error
        ? err.message
        : "Failed to update quest. Please try again.";
      setError(errorMessage);
      
      // Show appropriate error toast
      let toastTitle = "Quest Update Failed";
      let toastDescription = errorMessage;
      
      if (errorMessage.toLowerCase().includes('title') && errorMessage.toLowerCase().includes('already')) {
        toastTitle = "Duplicate Quest Title";
        toastDescription = "A quest with this title already exists. Please choose a different title.";
      } else if (errorMessage.toLowerCase().includes('validation')) {
        toastTitle = "Validation Error";
        toastDescription = "Please check all fields and ensure they meet the requirements.";
      } else if (errorMessage.toLowerCase().includes('permission') || errorMessage.toLowerCase().includes('unauthorized')) {
        toastTitle = "Permission Denied";
        toastDescription = "You don't have permission to update this quest.";
      } else if (errorMessage.toLowerCase().includes('not found')) {
        toastTitle = "Quest Not Found";
        toastDescription = "The quest could not be found. It may have been deleted.";
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
        toastTitle = "Connection Error";
        toastDescription = "Unable to update quest due to connection issues. Please check your internet and try again.";
      }
      
      toast({
        title: toastTitle,
        description: toastDescription,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBadge = (badgeId: number) => {
    setSelectedBadges((prev) =>
      prev.includes(badgeId)
        ? prev.filter((id) => id !== badgeId)
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
          <h3 className="text-lg font-semibold border-b pb-2">
            Basic Information
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quest Title</Label>
              <Input
                id="title"
                placeholder="Enter quest title"
                className="max-w-md"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter detailed quest description"
                rows={4}
                className="max-w-2xl"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quest Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">
            Quest Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="reward">Reward (points)</Label>
              <Input
                id="reward"
                type="number"
                placeholder="Enter reward points"
                className="max-w-xs"
                {...register("reward", { valueAsNumber: true })}
              />
              {errors.reward && (
                <p className="text-sm text-destructive">
                  {errors.reward.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                placeholder="Enter max participants"
                className="max-w-xs"
                {...register("maxParticipants", {
                  setValueAs: (value) => {
                    if (value === "" || value === null || value === undefined) {
                      return undefined;
                    }
                    const num = Number(value);
                    return isNaN(num) ? undefined : num;
                  },
                })}
              />
              {errors.maxParticipants && (
                <p className="text-sm text-destructive">
                  {errors.maxParticipants.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={watch("difficulty") || quest.difficulty}
                onValueChange={(value) => setValue("difficulty", value as any)}
              >
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as any)}
              >
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

        {/* Event Association */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">
            Event Association
          </h3>

          <div className="space-y-2">
            <Label htmlFor="event_id">Associated Event (Optional)</Label>
            {loadingEvents ? (
              <div className="flex items-center space-x-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading events...
                </span>
              </div>
            ) : (
              <Select
                value={
                  watch("event_id")
                    ? String(watch("event_id"))
                    : quest.event_id
                    ? String(quest.event_id)
                    : "none"
                }
                onValueChange={(value) =>
                  setValue(
                    "event_id",
                    value === "none" ? undefined : Number(value)
                  )
                }
              >
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
              <p className="text-sm text-destructive">
                {errors.event_id.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Associate this quest with a specific event
            </p>
          </div>
        </div>

        {/* Platform & Interaction */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">
            Platform & Interaction
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="platform_type">Platform Type</Label>
              <Select
                value={watch("platform_type") || quest.platform_type || "none"}
                onValueChange={(value) =>
                  setValue(
                    "platform_type",
                    value === "none" ? undefined : value
                  )
                }
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.platform_type && (
                <p className="text-sm text-destructive">
                  {errors.platform_type.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="interaction_type">Interaction Type</Label>
              <Select
                value={
                  watch("interaction_type") || quest.interaction_type || "none"
                }
                onValueChange={(value) =>
                  setValue(
                    "interaction_type",
                    value === "none" ? undefined : value
                  )
                }
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Select interaction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="like">Like</SelectItem>
                  <SelectItem value="share">Share</SelectItem>
                  <SelectItem value="comment">Comment</SelectItem>
                  <SelectItem value="follow">Follow</SelectItem>
                  <SelectItem value="join">Join</SelectItem>
                  <SelectItem value="visit">Visit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.interaction_type && (
                <p className="text-sm text-destructive">
                  {errors.interaction_type.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quest_link">Quest Link (Optional)</Label>
            <Input
              id="quest_link"
              type="url"
              placeholder="https://example.com/quest-target"
              className="max-w-md"
              {...register("quest_link")}
            />
            {errors.quest_link && (
              <p className="text-sm text-destructive">
                {errors.quest_link.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Link to the content or page users need to interact with
            </p>
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
          <h3 className="text-lg font-semibold border-b pb-2">
            Associated Badges
          </h3>

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
                      <p className="text-sm text-muted-foreground">
                        {badge.description}
                      </p>
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
