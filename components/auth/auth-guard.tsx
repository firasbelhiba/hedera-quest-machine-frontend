'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { tokenStorage } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from '@/components/error-boundary';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(false); // Start with false to prevent flash
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // Check authentication status immediately during component initialization
  // This prevents the login page flash by checking auth before rendering anything
  useEffect(() => {
    // Check if we already have auth state to avoid unnecessary processing
    const token = tokenStorage.getAccessToken();
    
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    // If we have a token, consider the user authenticated immediately
    setIsAuthenticated(true);
    
    // For now, we'll assume admin access if they can access the admin routes
    // In a real app, you'd verify the user's role from the token or API
    if (requireAdmin) {
      setIsAdmin(true);
    }
    
    setIsLoading(false);
  }, [requireAdmin]);

  // Wrap the content in an ErrorBoundary and Suspense to handle React errors including hydration errors
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      }>
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="text-muted-foreground">Checking authentication...</p>
              </CardContent>
            </Card>
          </div>
        ) : !isAuthenticated ? (
          <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Authentication Required</CardTitle>
                <CardDescription>
                  You need to be logged in to access this page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => router.push('/')} 
                  className="w-full"
                >
                  Go to Home
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/')} 
                  className="w-full"
                >
                  Go Home
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : requireAdmin && !isAdmin ? (
          <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>
                  You need administrator privileges to access this page.
                </CardDescription>
              </CardHeader>
              <CardContent>
              <Button 
                onClick={() => router.push('/')} 
                className="w-full"
              >
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
        ) : (
          <>{children}</>
        )}
      </Suspense>
    </ErrorBoundary>
  );
}
