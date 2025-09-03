'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthService } from '@/lib/api/auth';
import type { User } from '@/lib/types';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { HydrationSafe } from '@/components/hydration-safe';
import ErrorBoundary from '@/components/error-boundary';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .refine((val) => val.trim().length >= 2, 'Name must contain at least 2 non-space characters')
    .refine((val) => !/^[\s\-']+$/.test(val), 'Name must contain at least one letter')
    .refine((val) => !val.includes('  '), 'Name cannot contain consecutive spaces'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    // Client-side validation feedback
    if (!data.name || !data.email || !data.password || !data.confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please check and try again.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // Show loading toast
    const loadingToast = toast({
      title: "Creating your account...",
      description: "Please wait while we set up your account.",
      variant: "default"
    });

    try {
      await AuthService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword
      });
      
      // Dismiss loading toast
      loadingToast.dismiss();
      
      // Show success toast
      toast({
        title: "Account Created Successfully!",
        description: "Welcome to Hedera Quest! Please sign in to continue your journey.",
        variant: "default"
      });
      
      // Registration successful - redirect to login
      onSwitchToLogin();
    } catch (err) {
      // Dismiss loading toast
      loadingToast.dismiss();
      
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
      
      // Show appropriate error toast based on error type
      let toastTitle = "Registration Failed";
      let toastDescription = errorMessage;
      
      if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('already')) {
        toastTitle = "Email Already Registered";
        toastDescription = "An account with this email address already exists. Please try signing in instead.";
      } else if (errorMessage.toLowerCase().includes('password')) {
        toastTitle = "Password Requirements Not Met";
        toastDescription = "Please ensure your password meets all requirements and try again.";
      } else if (errorMessage.toLowerCase().includes('name')) {
        toastTitle = "Invalid Name";
        toastDescription = "Please enter a valid name and try again.";
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
        toastTitle = "Connection Error";
        toastDescription = "Unable to connect to our servers. Please check your internet connection and try again.";
      }
      
      toast({
        title: toastTitle,
        description: toastDescription,
        variant: "destructive"
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
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <p className="text-muted-foreground">Sign up to start your Hedera journey</p>
          </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="pl-10"
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

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
                placeholder="Create a password"
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                className="pl-10 pr-10"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>



          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-primary hover:underline font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
      </HydrationSafe>
    </ErrorBoundary>
  );
}