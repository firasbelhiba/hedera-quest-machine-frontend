'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import useStore from '@/lib/store';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Compass,
  User,
  BarChart3,
  Users,
  Settings,
  Shield,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Award,
  Star,
  Zap
} from 'lucide-react';

const navigation = [
  { name: '[DASHBOARD]', href: '/', icon: BarChart3 },
  { name: '[DISCOVER_QUESTS]', href: '/quests', icon: Compass },
  { name: '[MY_PROGRESS]', href: '/progress', icon: Trophy },
  { name: '[LEADERBOARD]', href: '/leaderboard', icon: Users },
  { name: '[PROFILE]', href: '/profile', icon: User },
];

const adminNavigation = [
  { name: '[ADMIN_DASHBOARD]', href: '/admin', icon: Shield },
  { name: '[MANAGE_QUESTS]', href: '/admin/quests', icon: FileText },
  { name: '[MANAGE_BADGES]', href: '/admin/badges', icon: Award },
  { name: '[REVIEW_SUBMISSIONS]', href: '/admin/submissions', icon: FileText },
  { name: '[EVENTS]', href: '/admin/events', icon: Calendar },
  { name: '[SETTINGS]', href: '/admin/settings', icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  userRole?: 'user' | 'admin' | 'moderator';
}

export function Sidebar({ isCollapsed, onToggle, userRole = 'user' }: SidebarProps) {
  const pathname = usePathname();
  const { user, isLoading } = useStore();
  const isAdmin = userRole === 'admin' || userRole === 'moderator';
  const isAdminPage = pathname?.startsWith('/admin') || false;
  
  // Don't show admin navigation until user data is fully loaded
  const shouldShowAdminNav = isAdmin && !isLoading && user;

  return (
    <div
      className={cn(
        'bg-card/95 backdrop-blur-sm border-r-2 border-dashed border-purple-500/30 hover:border-solid transition-all duration-300 ease-in-out flex flex-col shadow-lg',
        'h-screen sticky top-0 z-40 font-mono',
        // Responsive widths
        isCollapsed ? 'w-16' : 'w-64 max-w-[280px]',
        // Mobile responsiveness
        'md:relative md:translate-x-0',
        !isCollapsed && 'fixed md:static inset-y-0 left-0'
      )}
    >
      {/* Logo Section */}
      <div className="p-4 border-b-2 border-dashed border-purple-500/30 flex items-center justify-between bg-gradient-to-r from-background/50 to-muted/20">
        <div className="flex items-center space-x-2 transition-all duration-300">
          <div className={cn(
            'transition-all duration-300 ease-in-out',
            isCollapsed ? 'scale-75' : 'scale-100'
          )}>
            <Image src="/logo.png" alt="Hedera Quest" width={200} height={200} className="rounded-lg drop-shadow-sm" />
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-2 border border-dashed border-purple-500/50 hover:border-solid hover:bg-purple-500/10 transition-all duration-200 group font-mono"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div className="transition-transform duration-200 group-hover:rotate-12">
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </div>
        </button>
      </div>



      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {isAdminPage ? (
          // Admin pages: Show only admin navigation
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 transition-opacity duration-200 font-mono">
                [ADMINISTRATION]
              </p>
            )}
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2.5 border border-dashed text-sm font-medium font-mono transition-all duration-200 ease-in-out relative overflow-hidden',
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-foreground border-purple-500 border-solid shadow-lg shadow-purple-500/25 scale-[1.02]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-cyan-500/10 hover:border-solid hover:border-purple-500/50 hover:scale-[1.01] hover:shadow-sm border-transparent',
                    isCollapsed && 'justify-center px-2.5'
                  )}
                >
                  <item.icon className={cn(
                    'h-5 w-5 transition-all duration-200',
                    !isCollapsed && 'mr-3',
                    isActive && 'drop-shadow-sm',
                    !isActive && 'group-hover:scale-110'
                  )} />
                  {!isCollapsed && (
                    <span className="transition-all duration-200 group-hover:translate-x-0.5">
                      {item.name}
                    </span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="absolute right-2 w-1.5 h-1.5 bg-primary-foreground rounded-full opacity-75" />
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          // User pages: Show user navigation + admin section if admin
          <>
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-3 py-2.5 border border-dashed text-sm font-medium font-mono transition-all duration-200 ease-in-out relative overflow-hidden',
                      isActive
                        ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-foreground border-purple-500 border-solid shadow-lg shadow-purple-500/25 scale-[1.02]'
                        : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-cyan-500/10 hover:border-solid hover:border-purple-500/50 hover:scale-[1.01] hover:shadow-sm border-transparent',
                      isCollapsed && 'justify-center px-2.5'
                    )}
                  >
                    <item.icon className={cn(
                      'h-5 w-5 transition-all duration-200',
                      !isCollapsed && 'mr-3',
                      isActive && 'drop-shadow-sm',
                      !isActive && 'group-hover:scale-110'
                    )} />
                    {!isCollapsed && (
                      <span className="transition-all duration-200 group-hover:translate-x-0.5">
                        {item.name}
                      </span>
                    )}
                    {isActive && !isCollapsed && (
                      <div className="absolute right-2 w-1.5 h-1.5 bg-primary-foreground rounded-full opacity-75" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Admin Navigation */}
            {shouldShowAdminNav && (
              <>
                <div className="pt-4 border-t-2 border-dashed border-purple-500/30">
                  {!isCollapsed && (
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 transition-opacity duration-200 font-mono">
                      [ADMINISTRATION]
                    </p>
                  )}
                  <div className="space-y-1">
                    {adminNavigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            'group flex items-center px-3 py-2.5 border border-dashed text-sm font-medium font-mono transition-all duration-200 ease-in-out relative overflow-hidden',
                            isActive
                              ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-foreground border-orange-500 border-solid shadow-lg shadow-orange-500/25 scale-[1.02]'
                              : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-red-500/10 hover:border-solid hover:border-orange-500/50 hover:scale-[1.01] hover:shadow-sm border-transparent',
                            isCollapsed && 'justify-center px-2.5'
                          )}
                        >
                          <item.icon className={cn(
                            'h-5 w-5 transition-all duration-200',
                            !isCollapsed && 'mr-3',
                            isActive && 'drop-shadow-sm',
                            !isActive && 'group-hover:scale-110 group-hover:text-orange-600 dark:group-hover:text-orange-400'
                          )} />
                          {!isCollapsed && (
                            <span className="transition-all duration-200 group-hover:translate-x-0.5">
                              {item.name}
                            </span>
                          )}
                          {isActive && !isCollapsed && (
                            <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full opacity-75" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </nav>

      {/* User Info - Only show for regular users, not admins */}
      {!isCollapsed && userRole === 'user' && (
        <div className="p-4 border-t-2 border-dashed border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="relative">
              <div className="w-10 h-10 border-2 border-dashed border-purple-500 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 p-0.5">
                <div className="w-full h-full bg-background flex items-center justify-center">
                  <span className="text-sm font-bold font-mono bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    [{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}]
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border border-dashed border-green-600 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold font-mono truncate flex items-center gap-1">
                [{user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : 'LOADING...'}]
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs px-2 py-0.5 font-mono bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-dashed border-blue-500/50">
                  <Zap className="w-3 h-3 mr-1" />
                  [LVL_{user?.level || 1}]
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>[PROGRESS_TO_LVL_{(user?.level || 1) + 1}]</span>
              <span>[{Math.min(((user?.level || 1) * 100) % 100, 85)}%]</span>
            </div>
            <Progress 
              value={Math.min(((user?.level || 1) * 100) % 100, 85)} 
              className="h-2 bg-muted border border-dashed border-purple-500/30"
            />
          </div>
        </div>
      )}
      
      {/* Collapsed User Avatar - Only show for regular users, not admins */}
      {isCollapsed && userRole === 'user' && (
        <div className="p-2 border-t-2 border-dashed border-purple-500/30 flex justify-center">
          <div className="relative">
            <div className="w-8 h-8 border border-dashed border-purple-500 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 p-0.5">
              <div className="w-full h-full bg-background flex items-center justify-center">
                <span className="text-xs font-bold font-mono bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border border-dashed border-green-600" />
          </div>
        </div>
      )}
    </div>
  );
}