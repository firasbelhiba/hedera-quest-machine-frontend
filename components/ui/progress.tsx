'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: number | null;
  max?: number;
};

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const clamped = Math.max(0, Math.min(max, value || 0));
    const widthPercent = (clamped / max) * 100;
    return (
      <div
        ref={ref}
        className={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.round(clamped)}
        {...props}
      >
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

