'use client';

import { ReactNode } from 'react';
import { Navbar } from './navbar';
import { cn } from '@/lib/utils';

interface UserLayoutProps {
  children: ReactNode;
  className?: string;
}

export function UserLayout({ children, className }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-background font-mono">
      <Navbar />
      <main className={cn(
        'container mx-auto px-4 py-6 space-y-6',
        className
      )}>
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t-2 border-dashed border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h3 className="font-bold text-lg bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                HEDERA_QUEST
              </h3>
              <p className="text-sm text-muted-foreground">
                Gamified learning platform for Hedera blockchain development.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">[PLATFORM]</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/quests" className="hover:text-foreground transition-colors">&gt; Quests</a></li>
                <li><a href="/progress" className="hover:text-foreground transition-colors">&gt; Progress</a></li>
                <li><a href="/leaderboard" className="hover:text-foreground transition-colors">&gt; Leaderboard</a></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">[RESOURCES]</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">&gt; Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">&gt; API Reference</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">&gt; Community</a></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">[CONNECT]</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">&gt; Discord</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">&gt; Twitter</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">&gt; GitHub</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-dashed border-purple-500/30 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2024 Hedera Quest. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">[PRIVACY]</a>
              <a href="#" className="hover:text-foreground transition-colors">[TERMS]</a>
              <a href="#" className="hover:text-foreground transition-colors">[SUPPORT]</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}