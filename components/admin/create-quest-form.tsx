'use client';

import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BasicInformationForm } from './create-quest-components/basic-information-form';
import { QuestDetailsForm } from './create-quest-components/quest-details-form';
import { RewardsForm } from './create-quest-components/rewards-form';
import { SchedulingStatusForm } from './create-quest-components/scheduling-status-form';
import { useCreateQuestForm } from './create-quest-components/use-create-quest-form';

interface CreateQuestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateQuestForm({ onSuccess, onCancel }: CreateQuestFormProps) {
  const {
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
  } = useCreateQuestForm(onSuccess);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Create New Quest</h2>
        <p className="text-muted-foreground">Fill in the details below to create a new quest</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <BasicInformationForm register={register} />
        <QuestDetailsForm
          register={register}
          platform={platform}
          setPlatform={setPlatform}
          platformInteractions={platformInteractions}
          events={events}
          loadingEvents={loadingEvents}
        />
        <RewardsForm
          register={register}
          selectedBadges={selectedBadges}
          setSelectedBadges={setSelectedBadges}
          badges={badges}
          loadingBadges={loadingBadges}
        />
        <SchedulingStatusForm
          status={status}
          setStatus={setStatus}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Quest'
            )}
          </Button>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}
