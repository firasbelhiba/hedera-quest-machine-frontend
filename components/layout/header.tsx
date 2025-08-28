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
import { useRouter, usePathname } from 'next/navigation';
import useStore from '@/lib/store';
import { UsersApi } from '@/lib/api/users';
import { useWebSocket } from '@/hooks/use-websocket';

interface HeaderProps {
  onMenuClick: () => void;
}

// Using the Notification interface from users.ts
import type { Notification, AdminNotification } from '@/lib/api/users';

// Notifications will be loaded from API
const initialNotifications: Notification[] = [];
const initialAdminNotifications: AdminNotification[] = [];

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>(initialAdminNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const { user: currentUser, loadCurrentUser, logout } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  const isAdminPage = pathname?.startsWith('/admin');

  // Helper function to generate notification title and message
  const generateNotificationContent = (notification: Notification) => {
    const title = notification.title || (() => {
      switch (notification.notif_type) {
        case 'new_quest':
          return '[NEW_QUEST]';
        case 'quest_validated':
          return '[QUEST_VALIDATED]';
        case 'quest_rejected':
          return '[QUEST_REJECTED]';
        default:
          return '[NOTIFICATION]';
      }
    })();

    const message = notification.message || (() => {
      switch (notification.notif_type) {
        case 'new_quest':
          return `A new quest is available! Quest ID: ${notification.quest_id}`;
        case 'quest_validated':
          return `Your quest submission has been validated! Quest ID: ${notification.quest_id}`;
        case 'quest_rejected':
          return `Your quest submission has been rejected. Quest ID: ${notification.quest_id}`;
        default:
          return 'You have a new notification';
      }
    })();

    return { title, message };
  };

  // Helper function to generate admin notification title and message
  const generateAdminNotificationContent = (notification: AdminNotification) => {
    const title = (() => {
      switch (notification.notif_type) {
        case 'pending_quest':
          return '[PENDING_QUEST]';
        case 'quest_validated':
          return '[QUEST_VALIDATED]';
        case 'quest_rejected':
          return '[QUEST_REJECTED]';
        default:
          return '[ADMIN_NOTIFICATION]';
      }
    })();

    const message = (() => {
      switch (notification.notif_type) {
        case 'pending_quest':
          return `A quest submission is pending review. Quest ID: ${notification.quest_id}`;
        case 'quest_validated':
          return `Quest submission has been validated. Quest ID: ${notification.quest_id}`;
        case 'quest_rejected':
          return `Quest submission has been rejected. Quest ID: ${notification.quest_id}`;
        default:
          return 'You have a new admin notification';
      }
    })();

    return { title, message };
  };

  // Load current user on component mount
  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (isAdminPage) return;
    setIsLoadingNotifications(true);
    try {
      const [notificationsResponse, unreadCountResponse] = await Promise.all([
        UsersApi.getNotifications(),
        UsersApi.getUnreadNotificationCount()
      ]);
      setNotifications(notificationsResponse.notifications || []);
      setUnreadCount(unreadCountResponse.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Fetch admin notifications
  const fetchAdminNotifications = async () => {
    if (!isAdminPage) return;
    setIsLoadingNotifications(true);
    try {
      const [notificationsResponse, unreadCountResponse] = await Promise.all([
        UsersApi.getAdminNotifications(),
        UsersApi.getAdminUnreadNotificationCount()
      ]);
      setAdminNotifications(notificationsResponse.notifications || []);
      setAdminUnreadCount(unreadCountResponse.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch admin notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // WebSocket integration for real-time notifications
  const { isConnected, error: wsError } = useWebSocket({
    onNotification: (data) => {
      console.log('Received WebSocket notification:', data);
      
      // Refresh notifications when we receive a WebSocket notification
      if (isAdminPage) {
        fetchAdminNotifications();
      } else {
        fetchNotifications();
      }
    },
    onConnect: () => {
      console.log('WebSocket connected, fetching initial notifications');
      // Fetch initial notifications on connection
      if (isAdminPage) {
        fetchAdminNotifications();
      } else {
        fetchNotifications();
      }
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
    autoReconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5
  });

  // Initial load and page context changes
  useEffect(() => {
    if (isAdminPage) {
      fetchAdminNotifications();
    } else {
      fetchNotifications();
    }
  }, [isAdminPage]);

  const handleLogout = () => {
    // Clear store state and localStorage
    logout();
    // Redirect to login page using Next.js router (no refresh)
    router.push('/');
  };

  const getNotificationIcon = (notifType: string) => {
    switch (notifType) {
      case 'quest_completed':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'submission_approved':
      case 'quest_validated':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'submission_rejected':
      case 'quest_rejected':
        return <X className="w-4 h-4 text-red-500" />;
      case 'new_quest':
        return <Bell className="w-4 h-4 text-blue-500" />;
      case 'pending_quest':
        return <Clock className="w-4 h-4 text-orange-500" />;
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

  const markAsRead = async (notificationId: string) => {
    const numericId = parseInt(notificationId, 10);
    
    try {
      if (isAdminPage) {
        await UsersApi.markAdminNotificationAsSeen(numericId);
        setAdminNotifications(prev => 
          prev.map(n => n.id === numericId ? { ...n, seen: true } : n)
        );
        setAdminUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        await UsersApi.markNotificationAsSeen(numericId);
        setNotifications(prev => 
          prev.map(n => n.id === numericId ? { ...n, seen: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as seen:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (isAdminPage) {
        // Mark all admin notifications as seen
        const unseenNotifications = adminNotifications.filter(n => !n.seen);
        await Promise.all(
          unseenNotifications.map(n => UsersApi.markAdminNotificationAsSeen(n.id))
        );
        setAdminNotifications(prev => prev.map(n => ({ ...n, seen: true })));
        setAdminUnreadCount(0);
      } else {
        // Mark all user notifications as seen
        const unseenNotifications = notifications.filter(n => !n.seen);
        await Promise.all(
          unseenNotifications.map(n => UsersApi.markNotificationAsSeen(n.id))
        );
        setNotifications(prev => prev.map(n => ({ ...n, seen: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as seen:', error);
    }
  };

  const handleNotificationClick = (notification: Notification | AdminNotification) => {
    markAsRead(notification.id.toString());
    if (notification.quest_id) {
      // Navigate to quest details
      if (isAdminPage) {
        router.push(`/admin/quests/${notification.quest_id}`);
      } else {
        router.push(`/quests/${notification.quest_id}`);
      }
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
              <Bell className={cn("h-5 w-5", isConnected ? "text-green-500" : "text-gray-500")} />
              {(isAdminPage ? adminUnreadCount : unreadCount) > 0 && (
                <Badge className="absolute -top-1 -right-1 px-1 py-0 text-xs min-w-[1rem] h-5 flex items-center justify-center bg-red-500 hover:bg-red-600 border border-dashed border-red-700 font-mono">
                  {isAdminPage ? adminUnreadCount : unreadCount}
                </Badge>
              )}
              {!isConnected && (
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-orange-500 rounded-full border border-white" title="WebSocket disconnected" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 border-2 border-dashed border-purple-500/50 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 font-mono">
            <div className="flex items-center justify-between p-2 border-b border-dashed border-purple-500/30">
              <div className="flex items-center gap-2">
                <DropdownMenuLabel className="p-0 font-mono text-purple-600">[NOTIFICATIONS]</DropdownMenuLabel>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-green-500" : "bg-red-500"
                )} title={isConnected ? "Connected" : "Disconnected"} />
              </div>
              {(isAdminPage ? adminUnreadCount : unreadCount) > 0 && (
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
              {(isAdminPage ? adminNotifications : notifications).length > 0 ? (
                <div className="space-y-1">
                  {(isAdminPage ? adminNotifications : notifications).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={cn(
                         "flex items-start gap-3 p-3 cursor-pointer border border-dashed border-transparent hover:border-purple-500/30 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-cyan-500/10 font-mono",
                         !(isAdminPage ? (notification as AdminNotification).seen : (notification as Notification).seen) && "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30"
                       )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(isAdminPage ? (notification as AdminNotification).notif_type : (notification as Notification).notif_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">
                              {isAdminPage ? generateAdminNotificationContent(notification as AdminNotification).title : generateNotificationContent(notification as Notification).title}
                            </p>
                           {!(isAdminPage ? (notification as AdminNotification).seen : (notification as Notification).seen) && (
                             <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                           )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                            {isAdminPage ? generateAdminNotificationContent(notification as AdminNotification).message : generateNotificationContent(notification as Notification).message}
                          </p>
                         <div className="flex items-center gap-1 text-xs text-muted-foreground">
                           <Clock className="w-3 h-3" />
                           {formatTimestamp((notification as AdminNotification | Notification).created_at)}
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
                {!isAdminPage && currentUser?.role !== 'admin' && (
                  <p className="text-xs text-muted-foreground font-mono">
                    {currentUser && typeof currentUser.points === 'number' ? `[${currentUser.points}_POINTS]` : '[LOADING...]'}
                  </p>
                )}
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