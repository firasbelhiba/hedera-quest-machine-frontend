'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import useStore from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/components/ui/theme-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Trophy,
  Compass,
  User,
  BarChart3,
  Users,
  Settings,
  Bell,
  Search,
  Moon,
  Sun,
  Menu,
  LogOut,
  Star,
  Zap,
  Award
} from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/', icon: BarChart3, description: 'Your unified dashboard with quests, progress, and stats' },
  { name: 'Leaderboard', href: '/leaderboard', icon: Users, description: 'See top performers' },
  { name: 'Profile', href: '/profile', icon: User, description: 'Manage your account' },
];

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <nav className={cn(
      'sticky top-0 z-50 w-full border-b-2 border-dashed border-purple-500/30 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 font-mono text-slate-100',
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="relative">
              <Image 
                src="/logo.png" 
                alt="Hedera Quest" 
                width={100} 
                height={100} 
                className="rounded-lg drop-shadow-sm" 
              />
            </div>

          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavigationMenu>
              <NavigationMenuList>
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <NavigationMenuItem key={item.name}>
                      <Link href={item.href} legacyBehavior passHref>
                        <NavigationMenuLink
                          className={cn(
                            'group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-800 hover:text-slate-100 focus:bg-slate-800 focus:text-slate-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 border-2 border-dashed border-transparent hover:border-purple-500/50 font-mono text-slate-300',
                            isActive && 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-purple-500 border-solid text-slate-100'
                          )}
                        >
                          <item.icon className="w-4 h-4 mr-2" />
                          {item.name.toUpperCase()}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="border-2 border-dashed border-purple-500/50 hover:border-cyan-500/50 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-cyan-500/20 font-mono text-slate-300 hover:text-slate-100"
              title={theme === 'light' ? '[DARK_MODE]' : '[LIGHT_MODE]'}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative border-2 border-dashed border-purple-500/50 hover:border-cyan-500/50 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-cyan-500/20 font-mono text-slate-300 hover:text-slate-100"
              title="[NOTIFICATIONS]"
            >
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 px-1 py-0 text-xs min-w-[1rem] h-5 flex items-center justify-center bg-red-500 hover:bg-red-600 border border-dashed border-red-700 font-mono">
                0
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-dashed border-purple-500/50 hover:border-cyan-500/50 p-0 text-slate-300 hover:text-slate-100">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-mono text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 border-2 border-dashed border-purple-500/50 bg-slate-800 text-slate-100 font-mono" align="end" forceMount>
                <DropdownMenuLabel className="font-mono">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="border-dashed border-purple-500/30" />
                
                {/* User Stats */}
                <div className="px-2 py-2 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-yellow-500" />
                      LEVEL
                    </span>
                    <span className="font-bold">{user?.level || 1}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-purple-500" />
                      POINTS
                    </span>
                    <span className="font-bold">{user?.points?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-orange-500" />
                      STREAK
                    </span>
                    <span className="font-bold">{user?.streak || 0} days</span>
                  </div>
                </div>
                
                <DropdownMenuSeparator className="border-dashed border-purple-500/30" />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer font-mono">
                    <User className="mr-2 h-4 w-4" />
                    <span>[PROFILE]</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dashed border-purple-500/30" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer font-mono text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>[LOGOUT]</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden border-2 border-dashed border-purple-500/50 hover:border-cyan-500/50 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-cyan-500/20 font-mono text-slate-300 hover:text-slate-100"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 border-l-2 border-dashed border-purple-500/30 bg-slate-800 text-slate-100 font-mono">
                <SheetHeader>
                  <SheetTitle className="font-mono bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                    [NAVIGATION]
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'flex items-center space-x-3 px-3 py-3 rounded-lg border-2 border-dashed transition-all duration-200 font-mono',
                          isActive
                            ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-purple-500 border-solid text-slate-100'
                            : 'border-transparent hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-cyan-500/10 text-slate-300 hover:text-slate-100'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{item.name.toUpperCase()}</div>
                          <div className="text-xs text-slate-400">{item.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}