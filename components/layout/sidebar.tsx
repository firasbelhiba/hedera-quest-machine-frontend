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
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Discover Quests', href: '/quests', icon: Compass },
  { name: 'My Progress', href: '/progress', icon: Trophy },
  { name: 'Leaderboard', href: '/leaderboard', icon: Users },
  { name: 'Profile', href: '/profile', icon: User },
];

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: Shield },
  { name: 'Manage Quests', href: '/admin/quests', icon: FileText },
  { name: 'Manage Badges', href: '/admin/badges', icon: Award },
  { name: 'Review Submissions', href: '/admin/submissions', icon: FileText },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  userRole?: 'user' | 'admin' | 'moderator';
}

export function Sidebar({ isCollapsed, onToggle, userRole = 'user' }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useStore();
  const isAdmin = userRole === 'admin' || userRole === 'moderator';
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <div
      className={cn(
        'bg-card/95 backdrop-blur-sm border-r border-border/50 transition-all duration-300 ease-in-out flex flex-col shadow-lg',
        'h-screen sticky top-0 z-40',
        // Responsive widths
        isCollapsed ? 'w-16' : 'w-64 max-w-[280px]',
        // Mobile responsiveness
        'md:relative md:translate-x-0',
        !isCollapsed && 'fixed md:static inset-y-0 left-0'
      )}
    >
		<div className="p-4 border-b border-border/50 flex items-center justify-between bg-gradient-to-r from-background/50 to-muted/20">
			<div className="flex items-center space-x-2 transition-all duration-300">
				<div className={cn(
          'transition-all duration-300 ease-in-out',
          isCollapsed ? 'scale-75' : 'scale-100'
        )}>
          <Image src="/logo.png" alt="Hedera Quest" width={100} height={100} className="rounded-lg drop-shadow-sm" />
        </div>
			</div>
        <button
          onClick={onToggle}
          className="p-2 rounded-xl hover:bg-muted/50 transition-all duration-200 hover:scale-110 active:scale-95 group"
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
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 transition-opacity duration-200">
                Administration
              </p>
            )}
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out relative overflow-hidden',
                    isActive
                      ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted hover:scale-[1.01] hover:shadow-sm',
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
                      'group flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out relative overflow-hidden',
                      isActive
                        ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]'
                        : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted hover:scale-[1.01] hover:shadow-sm',
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
            {isAdmin && (
              <>
                <div className="pt-4 border-t">
                  {!isCollapsed && (
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 transition-opacity duration-200">
                      Administration
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
                            'group flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out relative overflow-hidden',
                            isActive
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25 scale-[1.02]'
                              : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-950/20 dark:hover:to-red-950/20 hover:scale-[1.01] hover:shadow-sm',
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

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-t bg-gradient-to-r from-muted/30 to-muted/10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 p-0.5">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate flex items-center gap-1">
                {user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : 'Loading...'}
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border-0">
                  <Zap className="w-3 h-3 mr-1" />
                  Level {user?.level || 1}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress to Level {(user?.level || 1) + 1}</span>
              <span>{Math.min(((user?.level || 1) * 100) % 100, 85)}%</span>
            </div>
            <Progress 
              value={Math.min(((user?.level || 1) * 100) % 100, 85)} 
              className="h-2 bg-muted"
            />
          </div>
        </div>
      )}
      
      {/* Collapsed User Avatar */}
      {isCollapsed && (
        <div className="p-2 border-t flex justify-center">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 p-0.5">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <span className="text-xs font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-background" />
          </div>
        </div>
      )}
    </div>
  );
}