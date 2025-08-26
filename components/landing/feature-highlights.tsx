'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Trophy, 
  Users, 
  BookOpen, 
  Zap, 
  Award, 
  TrendingUp, 
  Clock, 
  Shield, 
  Code, 
  Gamepad2, 
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  stats?: {
    label: string;
    value: string;
  }[];
  cta?: {
    text: string;
    href: string;
  };
}

const features: Feature[] = [
  {
    id: 'interactive-quests',
    title: 'Interactive Quests',
    description: 'Hands-on challenges that teach Hedera development through practical coding exercises and real-world scenarios.',
    icon: <Target className="w-6 h-6" />,
    gradient: 'from-blue-500/5 to-cyan-500/5',
    borderColor: 'border-blue-500/20',
    stats: [
      { label: 'Available Quests', value: '50+' },
      { label: 'Difficulty Levels', value: '4' }
    ],
    cta: {
      text: 'Explore Quests',
      href: '/quests'
    }
  },
  {
    id: 'gamified-learning',
    title: 'Gamified Learning',
    description: 'Earn XP, unlock achievements, and compete on leaderboards while mastering blockchain development skills.',
    icon: <Gamepad2 className="w-6 h-6" />,
    gradient: 'from-purple-500/5 to-indigo-500/5',
    borderColor: 'border-purple-500/20',
    stats: [
      { label: 'XP System', value: 'Active' },
      { label: 'Badges', value: '25+' }
    ],
    cta: {
      text: 'View Progress',
      href: '/progress'
    }
  },
  {
    id: 'community-driven',
    title: 'Community Driven',
    description: 'Join thousands of developers learning together, sharing knowledge, and building the future of Hedera.',
    icon: <Users className="w-6 h-6" />,
    gradient: 'from-green-500/5 to-emerald-500/5',
    borderColor: 'border-green-500/20',
    stats: [
      { label: 'Active Learners', value: '10K+' },
      { label: 'Success Rate', value: '95%' }
    ],
    cta: {
      text: 'Join Community',
      href: '/leaderboard'
    }
  },
  {
    id: 'comprehensive-curriculum',
    title: 'Comprehensive Curriculum',
    description: 'From basics to advanced topics, our structured learning path covers all aspects of Hedera development.',
    icon: <BookOpen className="w-6 h-6" />,
    gradient: 'from-orange-500/5 to-red-500/5',
    borderColor: 'border-orange-500/20',
    stats: [
      { label: 'Topics Covered', value: '20+' },
      { label: 'Avg Time', value: '2.5h' }
    ]
  },
  {
    id: 'real-time-feedback',
    title: 'Real-time Feedback',
    description: 'Get instant feedback on your submissions with detailed explanations and improvement suggestions.',
    icon: <Zap className="w-6 h-6" />,
    gradient: 'from-yellow-500/5 to-orange-500/5',
    borderColor: 'border-yellow-500/20',
    stats: [
      { label: 'Response Time', value: '<1min' },
      { label: 'Accuracy', value: '99%' }
    ]
  },
  {
    id: 'industry-recognition',
    title: 'Industry Recognition',
    description: 'Earn certificates and badges that are recognized by leading blockchain companies and organizations.',
    icon: <Award className="w-6 h-6" />,
    gradient: 'from-pink-500/5 to-rose-500/5',
    borderColor: 'border-pink-500/20',
    stats: [
      { label: 'Certificates', value: 'Verified' },
      { label: 'Partners', value: '15+' }
    ]
  }
];

export function FeatureHighlights() {
  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="font-mono border-dashed bg-primary/10">
          Platform Features
        </Badge>
        
        <h2 className="text-3xl md:text-4xl font-bold font-mono bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
          Why Choose Hedera Quest?
        </h2>
        
        <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto">
          {'>'} Discover the features that make learning Hedera development engaging, effective, and rewarding.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card 
            key={feature.id} 
            className={cn(
              'border-2 border-dashed hover:border-solid transition-all duration-200 bg-gradient-to-br',
              feature.borderColor,
              feature.gradient
            )}
          >
            <CardHeader className={cn(
              'bg-gradient-to-r opacity-50',
              feature.gradient
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-lg border border-dashed',
                  feature.borderColor.replace('border-', 'border-').replace('/20', '/30'),
                  feature.gradient.replace('from-', 'bg-').replace('/5', '/10').split(' ')[0]
                )}>
                  <div className={cn(
                    feature.borderColor.replace('border-', 'text-').replace('/20', '')
                  )}>
                    {feature.icon}
                  </div>
                </div>
                
                <CardTitle className="font-mono text-lg">
                  {feature.title}
                </CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                {feature.description}
              </p>
              
              {/* Stats */}
              {feature.stats && (
                <div className="grid grid-cols-2 gap-3">
                  {feature.stats.map((stat, statIndex) => (
                    <div 
                      key={statIndex} 
                      className="text-center p-2 bg-background/50 rounded border border-dashed border-primary/10"
                    >
                      <div className="text-lg font-bold font-mono text-primary">
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* CTA */}
              {feature.cta && (
                <Link href={feature.cta.href}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full font-mono border-dashed hover:border-solid transition-all duration-200 group"
                  >
                    {feature.cta.text}
                    <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-8">
        <div className="inline-flex flex-col sm:flex-row gap-4">
          <Link href="/quests">
            <Button 
              size="lg" 
              className="font-mono border-dashed hover:border-solid transition-all duration-200 group"
            >
              Start Learning Now
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <Link href="/progress">
            <Button 
              variant="outline" 
              size="lg"
              className="font-mono border-dashed hover:border-solid transition-all duration-200"
            >
              View Your Progress
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}