'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Star, Eye, EyeOff, Minimize2, Maximize2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import useStore from '@/lib/store';

interface BalanceWidgetProps {
  className?: string;
}

export function BalanceWidget({ className }: BalanceWidgetProps) {
  const { user } = useStore();
  const [isMinimized, setIsMinimized] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Points conversion rate should be configurable
  const pointsBalance = user?.points || 0;
  const conversionRate = 0; // Will be provided by API/config
  const dollarBalance = (pointsBalance * conversionRate).toFixed(2);

  // Set initial position to bottom-right corner
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth - 220,
        y: window.innerHeight - 120
      });
    }
  }, []);

  // Handle drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 200, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Don't show for admin users or if user is not logged in
  if (!user || user.role === 'admin') {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed z-50 transition-all duration-200 select-none',
        isDragging && 'cursor-grabbing',
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMinimized ? 'auto' : '200px'
      }}
    >
      <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/10 to-purple-500/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200">
        <CardContent className="p-3">
          {isMinimized ? (
            // Minimized view
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
              >
                <DollarSign className="w-3 h-3 text-green-500" />
              </Button>
              <Badge className="bg-green-500/20 text-green-700 border-green-500/30 font-mono text-xs">
                ${showBalance ? dollarBalance : '••••'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsMinimized(false)}
              >
                <Maximize2 className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            // Full view
            <div className="space-y-2">
              {/* Header with drag handle and controls */}
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-2 cursor-grab active:cursor-grabbing flex-1"
                  onMouseDown={handleMouseDown}
                >
                  <div className="p-1 bg-primary/20 rounded border border-dashed border-primary/40">
                    <DollarSign className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Balance
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowBalance(!showBalance)}
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
                    className="h-6 w-6 p-0"
                    onClick={() => setIsMinimized(true)}
                  >
                    <Minimize2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Balance Display */}
              <div className="space-y-2">
                <div className="text-lg font-bold font-mono bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ${showBalance ? dollarBalance : '••••••'}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 text-purple-500" />
                  <span className="font-mono">
                    {showBalance ? pointsBalance.toLocaleString() : '••••'} pts
                  </span>
                </div>
                
                {/* Claim Button */}
                <Button 
                  disabled 
                  size="sm" 
                  className="w-full h-7 text-xs bg-muted/50 hover:bg-muted/50 cursor-not-allowed"
                >
                  <Lock className="w-3 h-3 mr-1" />
                  Claim Locked
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default BalanceWidget;