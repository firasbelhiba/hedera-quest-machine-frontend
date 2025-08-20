'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleVerifyEmail = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      setVerificationStatus('error');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('idle');
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setVerificationStatus('success');
      setMessage('Verification email sent successfully! Please check your inbox.');
    } catch (error) {
      setVerificationStatus('error');
      setMessage('Failed to send verification email. Please try again.');
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
            Enter your email address to receive a verification link
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-mono text-gray-300">
              [EMAIL_ADDRESS]
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black border-2 border-dashed border-gray-600 text-gray-300 font-mono placeholder:text-gray-500 focus:border-purple-500"
              disabled={isVerifying}
            />
          </div>
          
          <Button
            onClick={handleVerifyEmail}
            disabled={isVerifying}
            className="w-full bg-purple-900 hover:bg-purple-800 border-2 border-dashed border-purple-600 text-purple-100 font-mono text-sm transition-colors"
          >
            {isVerifying ? '[SENDING...]' : '[SEND_VERIFICATION_EMAIL]'}
          </Button>
          
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