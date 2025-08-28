'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UseFormRegister } from 'react-hook-form';
import { Event } from '@/lib/types';

interface QuestDetailsFormProps {
  register: UseFormRegister<any>;
  platform: string;
  setPlatform: (platform: string) => void;
  platformInteractions: { [key: string]: string[] };
  events: Event[];
  loadingEvents: boolean;
}

export function QuestDetailsForm({ register, platform, setPlatform, platformInteractions, events, loadingEvents }: QuestDetailsFormProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">Quest Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="platform_type">Platform *</Label>
          <Select onValueChange={(value) => setPlatform(value)} {...register('platform_type')}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Select a platform" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(platformInteractions).map((p) => (
                <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="interaction_type">Interaction Type *</Label>
          <Select {...register('interaction_type')}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Select an interaction type" />
            </SelectTrigger>
            <SelectContent>
              {platform && platformInteractions[platform] ? (
                platformInteractions[platform].map((interaction) => (
                  <SelectItem key={interaction} value={interaction}>
                    {interaction.charAt(0).toUpperCase() + interaction.slice(1)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>Select a platform first</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="quest_link">Quest Link</Label>
          <Input
            id="quest_link"
            placeholder="https://example.com/quest-details"
            className="max-w-md"
            {...register('quest_link')}
          />
        </div>
        <div>
          <Label htmlFor="event_id">Related Event (Optional)</Label>
          <Select {...register('event_id')}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {loadingEvents ? (
                <SelectItem value="loading" disabled>Loading events...</SelectItem>
              ) : (
                events.map((event) => (
                  <SelectItem key={event.id} value={String(event.id)}>
                    {event.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}