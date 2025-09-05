'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ConditionalLayout } from '@/components/layout/conditional-layout';
import { AuthPage } from '@/components/auth/auth-page';
import { SocialMediaPromptModal } from '@/components/admin/social-media-prompt-modal';
import { User } from '@/lib/types';
import useStore from '@/lib/store';
import { Suspense } from 'react';
import { ClientProvider } from '@/components/providers/client-provider';
import ErrorBoundary from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { BalanceWidget } from '@/components/ui/balance-widget';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSocialMediaPrompt, setShowSocialMediaPrompt] = useState(false);
  const [hasCheckedSocialMedia, setHasCheckedSocialMedia] = useState(false);
  const { user, isAuthenticated, isLoading, loadCurrentUser, setUser } = useStore();
  const router = useRouter();

    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const hideFooter = pathname === '/validate-user';

  const handleAuthSuccess = async (authenticatedUser: User, isAdmin: boolean) => {
    // User data is already set in store by login method
    // Just handle the redirect
    if (isAdmin) {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  // Check for missing social media connections for admin users
  useEffect(() => {
    if (user && user.role === 'admin' && isAuthenticated && !isLoading && !hasCheckedSocialMedia) {
      const hasMissingSocialMedia = !user.twitterProfile || !user.facebookProfile || !user.discordProfile;
      const isDismissed = localStorage.getItem('socialMediaPromptDismissed') === 'true';
      
      if (hasMissingSocialMedia && !isDismissed) {
        // Small delay to ensure the admin interface is fully loaded
        const timer = setTimeout(() => {
          setShowSocialMediaPrompt(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
      
      setHasCheckedSocialMedia(true);
    }
  }, [user, isAuthenticated, isLoading, hasCheckedSocialMedia]);

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
                    
                    {/* Social Media Prompt Modal */}
                    <SocialMediaPromptModal
                      user={user}
                      isOpen={showSocialMediaPrompt}
                      onClose={() => {
                        setShowSocialMediaPrompt(false);
                        setHasCheckedSocialMedia(true);
                      }}
                    />
                  </div>
                ) : (
                  <ConditionalLayout>
                    {children}
                  </ConditionalLayout>
                )}
                
                {/* Balance Widget - Shows for all authenticated users except loading states */}
                {isAuthenticated && user && !isLoading && !hideFooter && (
                  <BalanceWidget />
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