'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { AuthPage } from '@/components/auth/auth-page';
import { User } from '@/lib/types';
import { QuestService } from '@/lib/services';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthSuccess = async (authenticatedUser: User) => {
    setIsAuthenticated(true);
    setUser(authenticatedUser);
    setIsLoading(false);
  };

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await QuestService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log('No existing session');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider defaultTheme="dark" attribute="class">
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </ThemeProvider>
        </body>
      </html>
    );
  }

  if (!isAuthenticated) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider defaultTheme="dark" attribute="class">
            <AuthPage onAuthSuccess={handleAuthSuccess} />
          </ThemeProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="dark" attribute="class">
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
        </ThemeProvider>
      </body>
    </html>
  );
}