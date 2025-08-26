'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Target, 
  Trophy, 
  Clock, 
  TrendingUp, 
  Award, 
  Zap, 
  BookOpen 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Stat {
  id: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  description: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const stats: Stat[] = [
  {
    id: 'active-learners',
    label: 'Active Learners',
    value: '10,247',
    icon: <Users className="w-5 h-5" />,
    gradient: 'from-blue-500/5 to-cyan-500/5',
    borderColor: 'border-blue-500/20',
    description: 'Developers actively learning',
    trend: {
      value: '+12%',
      isPositive: true
    }
  },
  {
    id: 'quests-completed',
    label: 'Quests Completed',
    value: '45,892',
    icon: <Target className="w-5 h-5" />,
    gradient: 'from-green-500/5 to-emerald-500/5',
    borderColor: 'border-green-500/20',
    description: 'Successfully finished quests',
    trend: {
      value: '+8%',
      isPositive: true
    }
  },
  {
    id: 'badges-earned',
    label: 'Badges Earned',
    value: '23,156',
    icon: <Award className="w-5 h-5" />,
    gradient: 'from-yellow-500/5 to-orange-500/5',
    borderColor: 'border-yellow-500/20',
    description: 'Achievements unlocked',
    trend: {
      value: '+15%',
      isPositive: true
    }
  },
  {
    id: 'success-rate',
    label: 'Success Rate',
    value: '94.7%',
    icon: <TrendingUp className="w-5 h-5" />,
    gradient: 'from-purple-500/5 to-indigo-500/5',
    borderColor: 'border-purple-500/20',
    description: 'Quest completion rate',
    trend: {
      value: '+2.3%',
      isPositive: true
    }
  },
  {
    id: 'avg-completion-time',
    label: 'Avg Completion',
    value: '2.4h',
    icon: <Clock className="w-5 h-5" />,
    gradient: 'from-pink-500/5 to-rose-500/5',
    borderColor: 'border-pink-500/20',
    description: 'Per quest average time'
  },
  {
    id: 'total-xp',
    label: 'Total XP Earned',
    value: '1.2M',
    icon: <Zap className="w-5 h-5" />,
    gradient: 'from-orange-500/5 to-red-500/5',
    borderColor: 'border-orange-500/20',
    description: 'Experience points gained',
    trend: {
      value: '+25%',
      isPositive: true
    }
  }
];

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
}

function AnimatedCounter({ end, duration = 2000, suffix = '' }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export function StatsOverview() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('stats-overview');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <section id="stats-overview" className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="font-mono border-dashed bg-primary/10">
          Platform Statistics
        </Badge>
        
        <h2 className="text-3xl md:text-4xl font-bold font-mono bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
          Growing Community
        </h2>
        
        <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto">
          {'>'} Join thousands of developers who are already mastering Hedera blockchain development.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          // Extract numeric value for animation
          const numericValue = parseFloat(stat.value.replace(/[^0-9.]/g, ''));
          const suffix = stat.value.replace(/[0-9.,]/g, '');
          
          return (
            <Card 
              key={stat.id}
              className={cn(
                'border-2 border-dashed hover:border-solid transition-all duration-200 bg-gradient-to-br group',
                stat.borderColor,
                stat.gradient
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    'p-2 rounded-lg border border-dashed transition-all duration-200 group-hover:border-solid',
                    stat.borderColor.replace('/20', '/30'),
                    stat.gradient.replace('from-', 'bg-').replace('/5', '/10').split(' ')[0]
                  )}>
                    <div className={cn(
                      stat.borderColor.replace('border-', 'text-').replace('/20', '')
                    )}>
                      {stat.icon}
                    </div>
                  </div>
                  
                  {stat.trend && (
                    <Badge 
                      variant={stat.trend.isPositive ? 'default' : 'destructive'}
                      className="font-mono text-xs border-dashed"
                    >
                      {stat.trend.value}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="text-3xl font-bold font-mono bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                    {isVisible ? (
                      <AnimatedCounter 
                        end={numericValue} 
                        suffix={suffix}
                        duration={1500 + index * 200}
                      />
                    ) : (
                      stat.value
                    )}
                  </div>
                  
                  <div className="text-sm font-semibold font-mono text-foreground">
                    {stat.label}
                  </div>
                  
                  <div className="text-xs text-muted-foreground font-mono">
                    {stat.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground font-mono">
          {'>'} Statistics updated in real-time • Last updated: {formatDistanceToNow(new Date(), { addSuffix: true })}
        </p>
      </div>
    </section>
  );
}