'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Star, Eye, EyeOff, Minimize2, Maximize2, Lock, Settings, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import useStore from '@/lib/store';

interface BalanceWidgetProps {
  className?: string;
  conversionRate?: number;
  showClaimButton?: boolean;
  enableAnimations?: boolean;
}

interface WidgetConfig {
  isMinimized: boolean;
  showBalance: boolean;
}

const STORAGE_KEY = 'balance-widget-config';
const DEFAULT_CONVERSION_RATE = 0.001; // $0.001 per point

export function BalanceWidget({ 
  className, 
  conversionRate = DEFAULT_CONVERSION_RATE,
  showClaimButton = true,
  enableAnimations = true 
}: BalanceWidgetProps) {
  const { user } = useStore();
  const [isMinimized, setIsMinimized] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Enhanced balance calculations
  const pointsBalance = user?.points || 0;
  const dollarBalance = (pointsBalance * conversionRate).toFixed(3);
  const isPositiveBalance = pointsBalance > 0;

  // Load saved configuration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const config = JSON.parse(saved);
          setIsMinimized(config.isMinimized || false);
          setShowBalance(config.showBalance !== false);
        }
      } catch (error) {
        console.warn('Failed to load balance widget config:', error);
      }
    }
  }, []);

  // Save configuration to localStorage
  const saveConfig = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const config = {
          isMinimized,
          showBalance
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (error) {
        console.warn('Failed to save balance widget config:', error);
      }
    }
  }, [isMinimized, showBalance]);

  // Save config when state changes
  useEffect(() => {
    const timeoutId = setTimeout(saveConfig, 500); // Debounce saves
    return () => clearTimeout(timeoutId);
  }, [saveConfig]);



  // Enhanced toggle functions with animations
  const toggleMinimized = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  const toggleBalance = useCallback(() => {
    setShowBalance(prev => !prev);
  }, []);

  const toggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // Don't show for admin users or if user is not logged in
  if (!user || user.role === 'admin') {
    return null;
  }

  return (
    <div
      className={cn(
        // Centered on mobile, right on md+
        'fixed top-16 left-1/2 -translate-x-1/2 right-auto z-50 select-none group',
        'md:left-auto md:right-4 md:translate-x-0',
        'transition-all duration-300 ease-out',
        enableAnimations && 'animate-in fade-in slide-in-from-top-4',
        className
      )}
      style={{
        width: isMinimized ? 'auto' : '220px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="dialog"
      aria-label="Balance Widget"
      aria-live="polite"
    >
      <Card className={cn(
        'border-2 border-dashed transition-all duration-300',
        'backdrop-blur-md shadow-lg',
        isHovered ? 'shadow-2xl scale-[1.02]' : 'shadow-lg',
        isPositiveBalance 
          ? 'border-emerald-400/40 bg-gradient-to-br from-emerald-50/80 to-green-100/60 dark:from-emerald-950/40 dark:to-green-950/30'
          : 'border-slate-400/40 bg-gradient-to-br from-slate-50/80 to-slate-100/60 dark:from-slate-950/40 dark:to-slate-900/30'
      )}>
        <CardContent className="p-3 relative overflow-hidden">
          {/* Animated background gradient */}
          <div className={cn(
            'absolute inset-0 opacity-20 transition-opacity duration-500',
            isHovered && 'opacity-30',
            isPositiveBalance 
              ? 'bg-gradient-to-br from-emerald-400 via-green-400 to-teal-400'
              : 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600'
          )} />
          
          {/* Content */}
          <div className="relative z-10">
            {isMinimized ? (
              // Enhanced Minimized view
              <div className="flex items-center gap-2 animate-in slide-in-from-left-2">
                <div className={cn(
                  'h-7 w-7 p-0 rounded-full transition-all duration-200 flex items-center justify-center',
                  'hover:scale-110 hover:bg-white/20'
                )}>
                  <DollarSign className={cn(
                    'w-4 h-4 transition-colors duration-200',
                    isPositiveBalance ? 'text-emerald-600' : 'text-slate-600'
                  )} />
                </div>
                
                <Badge className={cn(
                  'font-mono text-xs font-semibold transition-all duration-200',
                  'border backdrop-blur-sm',
                  isPositiveBalance 
                    ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30 dark:text-emerald-300'
                    : 'bg-slate-500/20 text-slate-700 border-slate-500/30 dark:text-slate-300'
                )}>
                  {isPositiveBalance && <TrendingUp className="w-3 h-3 inline mr-1" />}
                  ${showBalance ? dollarBalance : '••••'}
                </Badge>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full hover:scale-110 hover:bg-white/20 transition-all duration-200"
                  onClick={toggleMinimized}
                  aria-label="Expand widget"
                >
                  <Maximize2 className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              // Enhanced Full view
              <div className="space-y-3 animate-in slide-in-from-right-2">
                {/* Enhanced Header with drag handle and controls */}
                <div className="flex items-center justify-between">
                  <div 
                    className={cn(
                      'flex items-center gap-2 flex-1 p-1 rounded-lg transition-all duration-200'
                    )}
                  >
                    <div className={cn(
                      'p-1.5 rounded-lg border border-dashed transition-all duration-200',
                      isPositiveBalance 
                        ? 'bg-emerald-500/20 border-emerald-400/40'
                        : 'bg-slate-500/20 border-slate-400/40'
                    )}>
                      <DollarSign className={cn(
                        'w-4 h-4 transition-colors duration-200',
                        isPositiveBalance ? 'text-emerald-600' : 'text-slate-600'
                      )} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        Balance
                      </span>
                      {isPositiveBalance && (
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          +{((pointsBalance / 1000) * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-full hover:scale-110 hover:bg-white/20 transition-all duration-200"
                      onClick={toggleSettings}
                      aria-label="Widget settings"
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-full hover:scale-110 hover:bg-white/20 transition-all duration-200"
                      onClick={toggleBalance}
                      aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                    >
                      {showBalance ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-full hover:scale-110 hover:bg-white/20 transition-all duration-200"
                      onClick={toggleMinimized}
                      aria-label="Minimize widget"
                    >
                      <Minimize2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Enhanced Balance Display */}
                <div className="space-y-3">
                  {/* Main Balance */}
                  <div className="text-center">
                    <div className={cn(
                      'text-2xl font-bold font-mono transition-all duration-300',
                      'bg-gradient-to-r bg-clip-text text-transparent',
                      isPositiveBalance 
                        ? 'from-emerald-600 via-green-600 to-teal-600'
                        : 'from-slate-600 via-slate-700 to-slate-800',
                      isHovered && 'scale-105'
                    )}>
                      ${showBalance ? dollarBalance : '••••••'}
                    </div>
                    
                    {/* Points Display */}
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      <Star className={cn(
                        'w-3 h-3 transition-colors duration-200',
                        isPositiveBalance ? 'text-emerald-500' : 'text-slate-500'
                      )} />
                      <span className={cn(
                        'font-mono text-sm font-medium transition-colors duration-200',
                        isPositiveBalance ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'
                      )}>
                        {showBalance ? pointsBalance.toLocaleString() : '••••'} pts
                      </span>
                    </div>
                  </div>

                  {/* Settings Panel */}
                  {showSettings && (
                    <div className="space-y-2 p-2 bg-black/5 dark:bg-white/5 rounded-lg border border-dashed border-current/20 animate-in slide-in-from-top-2">
                      <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider text-center">
                        Settings
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Conversion Rate:</span>
                        <span className="font-mono">${conversionRate.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Animations:</span>
                        <span className="font-mono">{enableAnimations ? 'ON' : 'OFF'}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced Claim Button */}
                  {showClaimButton && (
                    <Button 
                      disabled 
                      size="sm" 
                      className={cn(
                        'w-full h-8 text-xs font-mono transition-all duration-200',
                        'bg-gradient-to-r border border-dashed',
                        isPositiveBalance
                          ? 'from-emerald-500/10 to-green-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                          : 'from-slate-500/10 to-slate-600/10 border-slate-500/30 text-slate-600 dark:text-slate-400',
                        'cursor-not-allowed opacity-60'
                      )}
                    >
                      <Lock className="w-3 h-3 mr-1.5" />
                      CLAIM LOCKED
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BalanceWidget;