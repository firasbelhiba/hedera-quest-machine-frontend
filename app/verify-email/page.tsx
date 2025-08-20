'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { AuthService } from '@/lib/api/auth';

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Extract token from URL query parameters
    const tokenParam = searchParams?.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setVerificationStatus('error');
      setMessage('No verification token found in URL. Please check your email link.');
    }
  }, [searchParams]);

  const handleVerifyToken = async () => {
    if (!token) {
      setMessage('No verification token available');
      setVerificationStatus('error');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('idle');
    
    try {
      const result = await AuthService.verifyToken(token);
      
      if (result.success) {
        setVerificationStatus('success');
        setMessage('Email verified successfully! You can now log in to your account.');
        
        // Redirect to root page after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setVerificationStatus('error');
        setMessage(result.message || 'Token verification failed. Please try again or request a new verification email.');
      }
    } catch (error: any) {
      console.error('Token verification error:', error);
      setVerificationStatus('error');
      setMessage(error.response?.data?.message || 'Failed to verify token. Please try again or request a new verification email.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-2 border-dashed border-gray-700">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-purple-900 border-2 border-dashed border-purple-600 rounded flex items-center justify-center">
            <Mail className="w-8 h-8 text-purple-400" />
          </div>
          <CardTitle className="text-xl font-mono text-green-400">[EMAIL_VERIFICATION]</CardTitle>
          <CardDescription className="text-gray-400 font-mono text-sm">
            {token ? 'Click the button below to verify your email address' : 'Invalid verification link'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {token && verificationStatus === 'idle' && (
            <Button
              onClick={handleVerifyToken}
              disabled={isVerifying}
              className="w-full bg-purple-900 hover:bg-purple-800 border-2 border-dashed border-purple-600 text-purple-100 font-mono text-sm transition-colors"
            >
              {isVerifying ? '[VERIFYING...]' : '[VERIFY_EMAIL]'}
            </Button>
          )}
          
          {message && (
            <div className={`flex items-center gap-2 p-3 border-2 border-dashed rounded font-mono text-sm ${
              verificationStatus === 'success' 
                ? 'bg-green-900/20 border-green-600 text-green-400'
                : 'bg-red-900/20 border-red-600 text-red-400'
            }`}>
              {verificationStatus === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{message}</span>
            </div>
          )}
          
          {verificationStatus === 'success' && (
            <div className="text-center">
              <p className="text-xs font-mono text-gray-500">
                Redirecting to login page in 3 seconds...
              </p>
            </div>
          )}
          
          <div className="text-center">
            <p className="text-xs font-mono text-gray-500">
              Already verified? <a href="/auth/login" className="text-purple-400 hover:text-purple-300 underline">[LOGIN]</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}