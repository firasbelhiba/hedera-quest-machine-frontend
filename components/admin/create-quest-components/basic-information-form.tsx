'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UseFormRegister } from 'react-hook-form';

interface BasicInformationFormProps {
  register: UseFormRegister<any>;
}

export function BasicInformationForm({ register }: BasicInformationFormProps) {
  return (
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
          <Label htmlFor="description">Quest Description *</Label>
          <Textarea
            id="description"
            placeholder="Provide a detailed description of the quest (max 500 characters)"
            className="max-w-md"
            {...register('description')}
            maxLength={500}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Required field</span>
          </div>
        </div>
      </div>
    </div>
  );
}