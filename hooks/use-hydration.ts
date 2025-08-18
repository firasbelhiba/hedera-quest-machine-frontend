'use client';

import { useState, useEffect } from 'react';

/**
 * A hook that returns whether the component has been hydrated yet.
 * This is useful for preventing hydration errors by conditionally rendering
 * components that depend on browser APIs or client-side state.
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  // This effect runs only once on the client after hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}