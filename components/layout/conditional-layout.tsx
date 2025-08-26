'use client';

import { ReactNode, useEffect, useState } from 'react';
import { UserLayout } from './user-layout';
import useStore from '@/lib/store';

interface ConditionalLayoutProps {
  children: ReactNode;
  className?: string;
}

export function ConditionalLayout({ children, className }: ConditionalLayoutProps) {
  const { user } = useStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background font-mono flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // For admin users, render children without UserLayout (they use the existing sidebar layout)
  if (user?.role === 'admin') {
    return <>{children}</>;
  }

  // For regular users, wrap with UserLayout
  return (
    <UserLayout className={className}>
      {children}
    </UserLayout>
  );
}