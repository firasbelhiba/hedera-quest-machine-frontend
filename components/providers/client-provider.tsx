'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/lib/store';
import ErrorBoundary from '@/components/error-boundary';

interface ClientProviderProps {
  children: ReactNode;
}

/**
 * ClientProvider ensures consistent client-side authentication state
 * and prevents hydration errors by handling authentication state in a client component
 */
export function ClientProvider({ children }: ClientProviderProps) {
  const [mounted, setMounted] = useState(false);
  const { loadCurrentUser } = useStore();
  
  // Only run on client-side to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Check if we have a token before making the API call
    const hasToken = typeof window !== 'undefined' && 
      (!!localStorage.getItem('auth_token') || 
       !!document.cookie.includes('hq_access_token'));
    
    if (hasToken) {
      // Only load user data if we have a token
      loadCurrentUser();
    }
  }, [loadCurrentUser]);

  // Return null during SSR to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
}