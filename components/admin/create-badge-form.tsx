'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BadgesApi } from '@/lib/api/badges';
import { BadgeRarity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { tokenStorage } from '@/lib/api/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const createBadgeSchema = z.object({
  name: z.string().min(1, 'Badge name is required').max(100, 'Badge name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  maxToObtain: z.number().min(1, 'Max to obtain must be at least 1').max(1000, 'Max to obtain must be less than 1000'),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary'] as const),
  points: z.number().min(0, 'Points must be at least 0').max(10000, 'Points must be less than 10000'),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

type CreateBadgeFormData = z.infer<typeof createBadgeSchema>;

const rarityOptions: { value: BadgeRarity; label: string; description: string }[] = [
  { value: 'common', label: 'Common', description: 'Easily obtainable badges' },
  { value: 'rare', label: 'Rare', description: 'Harder to obtain badges' },
  { value: 'epic', label: 'Epic', description: 'Very rare and valuable badges' },
  { value: 'legendary', label: 'Legendary', description: 'Extremely rare and prestigious badges' },
];

interface CreateBadgeFormProps {
  onBadgeCreated?: () => void;
}

export function CreateBadgeForm({ onBadgeCreated }: CreateBadgeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateBadgeFormData>({
    resolver: zodResolver(createBadgeSchema),
    defaultValues: {
      isActive: true,
      maxToObtain: 1,
      points: 10,
      rarity: 'common',
    },
  });

  const isActive = watch('isActive');

  const onSubmit = async (data: CreateBadgeFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if user is authenticated
      const token = tokenStorage.getAccessToken();
      if (!token) {
        throw new Error('Authentication required. Please log in to create badges.');
      }

      // Remove empty image field if not provided
      const payload = {
        ...data,
        image: data.image || undefined,
      };

      const response = await BadgesApi.create(payload);
      
      toast({
        title: 'Success!',
        description: response.message || 'Badge created successfully',
      });

      // Reset form
      reset();
      
      // Notify parent component to close dialog
      if (onBadgeCreated) {
        onBadgeCreated();
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create badge';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Badge</CardTitle>
        <CardDescription>
          Create a new badge that users can earn by completing quests and challenges.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Badge Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter badge name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe what this badge represents"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxToObtain">Max to Obtain *</Label>
              <Input
                id="maxToObtain"
                type="number"
                {...register('maxToObtain', { valueAsNumber: true })}
                min="1"
                max="1000"
                className={errors.maxToObtain ? 'border-red-500' : ''}
              />
              {errors.maxToObtain && (
                <p className="text-sm text-red-500">{errors.maxToObtain.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Points *</Label>
              <Input
                id="points"
                type="number"
                {...register('points', { valueAsNumber: true })}
                min="0"
                max="10000"
                className={errors.points ? 'border-red-500' : ''}
              />
              {errors.points && (
                <p className="text-sm text-red-500">{errors.points.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rarity">Rarity *</Label>
            <Select
              onValueChange={(value: BadgeRarity) => setValue('rarity', value)}
              defaultValue="common"
            >
              <SelectTrigger className={errors.rarity ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select rarity" />
              </SelectTrigger>
              <SelectContent>
                {rarityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rarity && (
              <p className="text-sm text-red-500">{errors.rarity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL (Optional)</Label>
            <Input
              id="image"
              type="url"
              {...register('image')}
              placeholder="https://example.com/badge-image.png"
              className={errors.image ? 'border-red-500' : ''}
            />
            {errors.image && (
              <p className="text-sm text-red-500">{errors.image.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">Active Badge</Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : 'Create Badge'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isLoading}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
