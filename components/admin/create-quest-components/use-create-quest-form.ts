import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { QuestService } from "@/lib/services";
import { Badge, Event } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import DOMPurify from "dompurify";

interface CreateQuestFormData {
  title: string;
  description: string;
  reward: number;
  difficulty: "easy" | "medium" | "hard" | "expert";
  status: "draft" | "active" | "completed" | "expired";
  startDate: string;
  endDate: string;
  maxParticipants?: number;
  currentParticipants: number;
  badgeIds?: number[];
  platform_type?: string;
  interaction_type?: string;
  quest_link?: string;
  event_id?: number;
}

// Input sanitization helper
const sanitizeInput = (input: string) => {
  if (typeof window !== "undefined" && DOMPurify) {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }
  return input.replace(/<[^>]*>/g, "").replace(/[<>"'&]/g, "");
};

export const useCreateQuestForm = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "draft" | "active" | "completed" | "expired"
  >("draft");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("18:00");
  const [selectedBadges, setSelectedBadges] = useState<number[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [platform, setPlatform] = useState<string>("");

  const { toast } = useToast();

  const platformInteractions: { [key: string]: string[] } = {
    twitter: ["follow", "like", "comment", "tweet"],
    facebook: ["follow", "like", "comment", "share"],
    discord: ["join", "message", "react"],
    other: ["visit", "signup", "complete", "submit", "participate"],
  };

  const { register, handleSubmit, setValue } = useForm<CreateQuestFormData>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingBadges(true);
        setLoadingEvents(true);

        const [badgesList, eventsList] = await Promise.all([
          QuestService.getAllBadges(),
          QuestService.getEvents(),
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

  const onSubmit = async (data: CreateQuestFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (selectedBadges.length > 10) {
        setError("Cannot assign more than 10 badges to a single quest");
        setIsLoading(false);
        return;
      }

      if (
        data.reward &&
        data.reward > 0 &&
        selectedBadges.length === 0 &&
        status === "active"
      ) {
        const confirmProceed = window.confirm(
          "This quest offers points but no badges. Are you sure you want to proceed?"
        );
        if (!confirmProceed) {
          setIsLoading(false);
          return;
        }
      }

      const formatDateTime = (date: Date | undefined, time: string) => {
        if (!date) return "";
        const [hours, minutes] = time.split(":");
        const dateWithTime = new Date(date);
        dateWithTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return dateWithTime.toISOString().slice(0, 19);
      };

      setValue("startDate", formatDateTime(startDate, startTime));
      setValue("endDate", formatDateTime(endDate, endTime));

      const questData = {
        ...data,
        title: sanitizeInput(data.title.trim()),
        description: sanitizeInput(data.description.trim()),
        status,
        startDate: formatDateTime(startDate, startTime),
        endDate: formatDateTime(endDate, endTime),
        maxParticipants: data.maxParticipants || undefined,
        currentParticipants: 0, // New quests start with 0 participants
        badgeIds: selectedBadges.length > 0 ? selectedBadges : undefined,
        platform_type: data.platform_type,
        interaction_type: data.interaction_type,
        quest_link: data.quest_link
          ? sanitizeInput(data.quest_link.trim())
          : undefined,
        event_id: data.event_id ? Number(data.event_id) : undefined,
      };

      await QuestService.createQuest(questData);
      toast({
        title: "Quest Created Successfully",
        description: `The quest "${questData.title}" has been created with ${status} status.`,
      });
      onSuccess?.();
    } catch (err) {
      console.error("Error creating quest:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create quest. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error Creating Quest",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    status,
    setStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    selectedBadges,
    setSelectedBadges,
    badges,
    loadingBadges,
    events,
    loadingEvents,
    platform,
    setPlatform,
    platformInteractions,
    register,
    handleSubmit,
    onSubmit,
  };
};
