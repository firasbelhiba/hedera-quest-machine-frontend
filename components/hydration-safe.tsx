'use client';

import { ReactNode } from 'react';
import { useHydration } from '@/hooks/use-hydration';

interface HydrationSafeProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that only renders its children after hydration is complete.
 * This prevents hydration errors by ensuring client-side components
 * only render after the client has taken over.
 */
export function HydrationSafe({ children, fallback = null }: HydrationSafeProps) {
  const isHydrated = useHydration();

  if (!isHydrated) {
    return fallback;
  }

  return <>{children}</>;
}