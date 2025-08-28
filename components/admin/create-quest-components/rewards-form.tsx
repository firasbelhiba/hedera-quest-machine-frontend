'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge as BadgeUI } from '@/components/ui/badge';
import { UseFormRegister } from 'react-hook-form';
import { Badge } from '@/lib/types';

interface RewardsFormProps {
  register: UseFormRegister<any>;
  selectedBadges: number[];
  setSelectedBadges: (badges: number[]) => void;
  badges: Badge[];
  loadingBadges: boolean;
}

export function RewardsForm({ register, selectedBadges, setSelectedBadges, badges, loadingBadges }: RewardsFormProps) {
  const toggleBadgeSelection = (badgeId: number) => {
    setSelectedBadges(
      selectedBadges.includes(badgeId)
        ? selectedBadges.filter((id) => id !== badgeId)
        : [...selectedBadges, badgeId]
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">Rewards</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="reward">Points Reward</Label>
          <Input
            id="reward"
            type="number"
            placeholder="Enter points (e.g., 100)"
            className="max-w-md"
            {...register('reward', { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label>Badges (Optional)</Label>
          <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
            {loadingBadges ? (
              <p>Loading badges...</p>
            ) : (
              badges.map((badge) => (
                <BadgeUI
                  key={badge.id}
                  variant={selectedBadges.includes(Number(badge.id)) ? 'default' : 'secondary'}
                  onClick={() => toggleBadgeSelection(Number(badge.id))}
                  className="cursor-pointer"
                >
                  {badge.name}
                </BadgeUI>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}