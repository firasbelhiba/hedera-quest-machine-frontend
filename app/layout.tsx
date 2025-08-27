'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ConditionalLayout } from '@/components/layout/conditional-layout';
import { AuthPage } from '@/components/auth/auth-page';
import { User } from '@/lib/types';
import useStore from '@/lib/store';
import { Suspense } from 'react';
import { ClientProvider } from '@/components/providers/client-provider';
import ErrorBoundary from '@/components/error-boundary';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, isAuthenticated, isLoading, loadCurrentUser, setUser } = useStore();
  const router = useRouter();

  const handleAuthSuccess = async (authenticatedUser: User, isAdmin: boolean) => {
    // User data is already set in store by login method
    // Just handle the redirect
    if (isAdmin) {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  // Authentication is now handled by ClientProvider

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" attribute="class" enableSystem disableTransitionOnChange>
          <ErrorBoundary>
            <ClientProvider>
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              }>
                {isLoading || (isAuthenticated && !user) ? (
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : !isAuthenticated || !user ? (
                  <AuthPage onAuthSuccess={handleAuthSuccess} />
                ) : user.role === 'admin' ? (
                  <div className="flex h-screen bg-background">
                    <Sidebar
                      isCollapsed={sidebarCollapsed}
                      onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                      userRole={user?.role || 'user'}
                    />
                    
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <Header onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
                      
                      <main className="flex-1 overflow-auto">
                        <div className="container mx-auto p-6">
                          {children}
                        </div>
                      </main>
                    </div>
                  </div>
                ) : (
                  <ConditionalLayout>
                    {children}
                  </ConditionalLayout>
                )}
              </Suspense>
            </ClientProvider>
          </ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}