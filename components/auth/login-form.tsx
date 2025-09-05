'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import type { User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useStore from '@/lib/store';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { HydrationSafe } from '@/components/hydration-safe';
import ErrorBoundary from '@/components/error-boundary';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess: (user: User, isAdmin: boolean) => void;
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const { login } = useStore();
  // const { toast } = useToast(); // ✅ toast hook

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    // Client-side validation feedback
    if (!data.email || !data.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // Show loading toast
    const loadingToast = toast({
      title: "Signing you in...",
      description: "Please wait while we verify your credentials.",
      variant: "default"
    });

    try {
      await login(data.email, data.password);
      const { user } = useStore.getState();

      if (user) {
        toast({
          title: "✅ Login successful",
          description: `Welcome back, ${user.email}`,
        });
        onSuccess(user, user.role === 'admin');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setError(msg);

      toast({
        variant: "destructive",
        title: "❌ Invalid credentials",
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <HydrationSafe fallback={
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center p-4">
            <div className="mx-auto mb-6 w-24 h-24 relative">
              <Image src="/logo.png" alt="Hedera Quest" fill className="object-contain scale-[2.5]" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <p className="text-muted-foreground">Sign in to continue your Hedera journey</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  onClick={onSwitchToRegister}
                  className="text-primary hover:underline font-medium"
                >
                  Create one here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </HydrationSafe>
    </ErrorBoundary>
  );
}
