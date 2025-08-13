'use client';

import { useState } from 'react';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import { Trophy, Star, Users, Target } from 'lucide-react';

import { User } from '@/lib/types';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-white space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-xl flex items-center justify-center">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold">Hedera Quest</h1>
            </div>
            <p className="text-xl text-purple-200">
              Master the Hedera ecosystem through gamified learning
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Users className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Join the Community</h3>
              <p className="text-sm text-purple-200">
                Connect with developers and learners worldwide
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Target className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Complete Quests</h3>
              <p className="text-sm text-purple-200">
                Learn by doing with hands-on challenges
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Earn Rewards</h3>
              <p className="text-sm text-purple-200">
                Collect badges and climb the leaderboard
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Level Up</h3>
              <p className="text-sm text-purple-200">
                Track your progress and showcase skills
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
            <h3 className="font-semibold mb-3">What you'll learn:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span>Smart Contracts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Token Service</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>NFT Creation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>DeFi Protocols</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                <span>Consensus Service</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>File Service</span>
              </div>
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
              onSuccess={onAuthSuccess}
              onSwitchToLogin={() => setIsLogin(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}