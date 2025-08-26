'use client';

import { useState } from 'react';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import { Trophy, Star, Users, Target } from 'lucide-react';
import { HydrationSafe } from '@/components/hydration-safe';
import ErrorBoundary from '@/components/error-boundary';

import { User } from '@/lib/types';

export function AuthPage({ onAuthSuccess }: { onAuthSuccess: (user: User, isAdmin: boolean) => void }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <ErrorBoundary>
      <HydrationSafe fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <div className="relative min-h-screen bg-[#0b0d14] flex items-center justify-center p-4">
          {/* Pixel grid background */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(#111827 1px, transparent 1px), linear-gradient(90deg, #111827 1px, transparent 1px)'
              , backgroundSize: '12px 12px'
            }}
          />
      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-white space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <h1 className={`font-pixel text-4xl font-bold tracking-wider`}>Hedera Quest</h1>
            </div>
            <p className="text-xl text-purple-200">
              Master the Hedera ecosystem through gamified learning
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-black/30 border-2 border-cyan-400 rounded-none p-6 text-center shadow-[4px_4px_0_0_rgba(0,0,0,0.6)]">
              <Users className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className={`font-pixel mb-2`}>Join the Community</h3>
              <p className="text-sm text-purple-200">
                Connect with developers and learners worldwide
              </p>
            </div>
            
            <div className="bg-black/30 border-2 border-green-400 rounded-none p-6 text-center shadow-[4px_4px_0_0_rgba(0,0,0,0.6)]">
              <Target className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className={`font-pixel mb-2`}>Complete Quests</h3>
              <p className="text-sm text-purple-200">
                Learn by doing with hands-on challenges
              </p>
            </div>
            
            <div className="bg-black/30 border-2 border-yellow-400 rounded-none p-6 text-center shadow-[4px_4px_0_0_rgba(0,0,0,0.6)]">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className={`font-pixel mb-2`}>Earn Rewards</h3>
              <p className="text-sm text-purple-200">
                Collect badges and climb the leaderboard
              </p>
            </div>
            
            <div className="bg-black/30 border-2 border-purple-400 rounded-none p-6 text-center shadow-[4px_4px_0_0_rgba(0,0,0,0.6)]">
              <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className={`font-pixel mb-2`}>Level Up</h3>
              <p className="text-sm text-purple-200">
                Track your progress and showcase skills
              </p>
            </div>
          </div>





        </div>

        {/* Right Side - Auth Forms */}
        <div className="flex justify-center">
          {isLogin ? (
            <LoginForm
              onSuccess={onAuthSuccess}
              onSwitchToRegister={() => setIsLogin(false)}
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={() => setIsLogin(true)}
            />
          )}
        </div>
      </div>
    </div>
      </HydrationSafe>
    </ErrorBoundary>
  );
}