'use client';

import { Bell, Search, Moon, Sun, Menu, Check, X, Clock, Trophy, Users, AlertCircle, Settings, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/components/ui/theme-provider';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useStore from '@/lib/store';

interface HeaderProps {
  onMenuClick: () => void;
}

interface Notification {
  id: string;
  type: 'quest_completed' | 'submission_approved' | 'submission_rejected' | 'new_quest' | 'event_reminder' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'submission_approved',
    title: 'Quest Submission Approved!',
    message: 'Your submission for "Create Your First Hedera Account" has been approved. You earned 100 points!',
    timestamp: '2024-01-20T10:30:00Z',
    read: false,
    actionUrl: '/progress'
  },
  {
    id: '2',
    type: 'new_quest',
    title: 'New Quest Available',
    message: 'A new quest "Advanced Smart Contract Development" is now available in the Development category.',
    timestamp: '2024-01-20T09:15:00Z',
    read: false,
    actionUrl: '/quests'
  },
  {
    id: '3',
    type: 'event_reminder',
    title: 'Hackathon Starting Soon',
    message: 'The Hedera Hackathon 2024 starts in 2 days. Make sure you\'re registered!',
    timestamp: '2024-01-19T16:45:00Z',
    read: true,
    actionUrl: '/events'
  },
  {
    id: '4',
    type: 'quest_completed',
    title: 'Level Up!',
    message: 'Congratulations! You\'ve reached Level 16 and unlocked new advanced quests.',
    timestamp: '2024-01-19T14:20:00Z',
    read: true,
    actionUrl: '/profile'
  },
  {
    id: '5',
    type: 'submission_rejected',
    title: 'Submission Needs Revision',
    message: 'Your submission for "Deploy Your First Smart Contract" needs some revisions. Check the feedback.',
    timestamp: '2024-01-19T11:30:00Z',
    read: true,
    actionUrl: '/progress'
  }
];

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const { user: currentUser, loadCurrentUser, logout } = useStore();
  const router = useRouter();
  const unreadCount = notifications.filter(n => !n.read).length;

  // Load current user on component mount
  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const handleLogout = () => {
    // Clear store state and localStorage
    logout();
    // Redirect to login page using Next.js router (no refresh)
    router.push('/');
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'quest_completed':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'submission_approved':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'submission_rejected':
        return <X className="w-4 h-4 text-red-500" />;
      case 'new_quest':
        return <Bell className="w-4 h-4 text-blue-500" />;
      case 'event_reminder':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'system':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <header className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b-2 border-dashed border-purple-500/30 px-4 lg:px-6 h-16 flex items-center justify-between font-mono">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden border-2 border-dashed border-purple-500/50 hover:border-cyan-500/50 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-cyan-500/20 font-mono"
        >
          <Menu className="h-5 w-5" />
        </Button>
        


        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-500" />
          <Input
            placeholder="[SEARCH_QUESTS...]"
            className="pl-10 border-2 border-dashed border-purple-500/50 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 font-mono placeholder:text-purple-500/70 focus:border-cyan-500/70 focus:bg-gradient-to-r focus:from-cyan-500/10 focus:to-purple-500/10"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="border-2 border-dashed border-purple-500/50 hover:border-cyan-500/50 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-cyan-500/20 font-mono"
          title={theme === 'light' ? '[DARK_MODE]' : '[LIGHT_MODE]'}
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative border-2 border-dashed border-purple-500/50 hover:border-cyan-500/50 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-cyan-500/20 font-mono" title="[NOTIFICATIONS]">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 px-1 py-0 text-xs min-w-[1rem] h-5 flex items-center justify-center bg-red-500 hover:bg-red-600 border border-dashed border-red-700 font-mono">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 border-2 border-dashed border-purple-500/50 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 font-mono">
            <div className="flex items-center justify-between p-2 border-b border-dashed border-purple-500/30">
              <DropdownMenuLabel className="p-0 font-mono text-purple-600">[NOTIFICATIONS]</DropdownMenuLabel>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs h-auto p-1 border border-dashed border-cyan-500/50 hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-500/20 font-mono"
                >
                  [MARK_ALL_READ]
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            <ScrollArea className="h-96">
              {notifications.length > 0 ? (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-3 p-3 cursor-pointer border border-dashed border-transparent hover:border-purple-500/30 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-cyan-500/10 font-mono",
                        !notification.read && "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(notification.timestamp)}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground font-mono">
                  [NO_NOTIFICATIONS_YET]
                </div>
              )}
            </ScrollArea>
            <DropdownMenuSeparator className="border-dashed border-purple-500/30" />
            <DropdownMenuItem className="justify-center">
              <Button variant="ghost" size="sm" className="w-full border border-dashed border-purple-500/50 hover:border-cyan-500/50 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-cyan-500/20 font-mono">
                [VIEW_ALL_NOTIFICATIONS]
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 p-2 border-2 border-dashed border-purple-500/50 hover:border-cyan-500/50 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-cyan-500/20 font-mono">
              <div className="w-8 h-8 border-2 border-dashed border-purple-500 bg-gradient-to-r from-purple-600 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs font-mono">[U]</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium font-mono">
                  [{currentUser?.name || 'LOADING...'}]
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {currentUser?.points ? `[${currentUser.points}_POINTS]` : '[LOADING...]'}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-2 border-dashed border-purple-500/50 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 font-mono">
            <DropdownMenuLabel className="font-mono text-purple-600">[MY_ACCOUNT]</DropdownMenuLabel>
            <DropdownMenuSeparator className="border-dashed border-purple-500/30" />
            <DropdownMenuItem className="cursor-pointer border border-dashed border-transparent hover:border-purple-500/30 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-cyan-500/10 font-mono">
              <User className="mr-2 h-4 w-4" />
              <span>[PROFILE]</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer border border-dashed border-transparent hover:border-purple-500/30 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-cyan-500/10 font-mono">
              <Settings className="mr-2 h-4 w-4" />
              <span>[SETTINGS]</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="border-dashed border-purple-500/30" />
            <DropdownMenuItem 
              className="cursor-pointer text-red-600 focus:text-red-600 border border-dashed border-transparent hover:border-red-500/30 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-orange-500/10 font-mono"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>[LOGOUT]</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}