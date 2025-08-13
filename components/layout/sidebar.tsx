'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
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
  ChevronRight
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
  const isAdmin = userRole === 'admin' || userRole === 'moderator';

  return (
    <div
      className={cn(
        'bg-card border-r transition-all duration-300 ease-in-out flex flex-col',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
		<div className="p-4 border-b flex items-center justify-between">
			<div className="flex items-center space-x-2">
				<Image src="/logo.png" alt="Hedera Quest" width={32} height={32} className="rounded" />
				{!isCollapsed && <span className="font-bold text-lg">Hedera Quest</span>}
			</div>
        <button
          onClick={onToggle}
          className="p-1 rounded-md hover:bg-muted transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <item.icon className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
                {!isCollapsed && item.name}
              </Link>
            );
          })}
        </div>

        {/* Admin Navigation */}
        {isAdmin && (
          <>
            <div className="pt-4 border-t">
              {!isCollapsed && (
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
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
                        'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                        isCollapsed && 'justify-center px-2'
                      )}
                    >
                      <item.icon className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
                      {!isCollapsed && item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Alice Chen</p>
              <p className="text-xs text-muted-foreground">Level 15</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}