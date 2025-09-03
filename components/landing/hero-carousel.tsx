'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Trophy, Users, Target, Zap, Star, ArrowRight, BookOpen, Award, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: {
    text: string;
    href: string;
    variant?: 'default' | 'outline' | 'secondary';
  };
  stats?: {
    label: string;
    value: string;
    icon: React.ReactNode;
  }[];
  gradient: string;
}

const slides: CarouselSlide[] = [
  {
    id: 'welcome',
    title: 'Welcome to Hedera Quest',
    subtitle: 'Your Journey Begins Here',
    description: 'Embark on an epic learning adventure through the Hedera blockchain ecosystem. Complete quests, earn rewards, and level up your skills.',
    image: '🚀',
    cta: {
      text: 'Start Your Journey',
      href: '/quests',
      variant: 'default'
    },
    stats: [
      { label: 'Active Learners', value: 'TBD', icon: <Users className="w-4 h-4" /> },
      { label: 'Quests Available', value: 'TBD', icon: <Target className="w-4 h-4" /> },
      { label: 'Success Rate', value: 'TBD', icon: <TrendingUp className="w-4 h-4" /> }
    ],
    gradient: 'from-purple-500/20 via-cyan-500/20 to-blue-500/20'
  },
  {
    id: 'quests',
    title: 'Interactive Learning Quests',
    subtitle: 'Learn by Doing',
    description: 'Dive into hands-on challenges designed to teach you Hedera development through practical experience. From beginner to expert level.',
    image: '🎯',
    cta: {
      text: 'Explore Quests',
      href: '/quests',
      variant: 'default'
    },
    stats: [
      { label: 'Difficulty Levels', value: 'TBD', icon: <Star className="w-4 h-4" /> },
      { label: 'Categories', value: 'TBD', icon: <BookOpen className="w-4 h-4" /> },
      { label: 'Avg Completion', value: 'TBD', icon: <Zap className="w-4 h-4" /> }
    ],
    gradient: 'from-green-500/20 via-emerald-500/20 to-teal-500/20'
  },
  {
    id: 'progress',
    title: 'Track Your Progress',
    subtitle: 'Level Up Your Skills',
    description: 'Monitor your learning journey with detailed analytics, earn badges, and climb the leaderboard as you master Hedera development.',
    image: '📈',
    cta: {
      text: 'View Progress',
      href: '/progress',
      variant: 'default'
    },
    stats: [
      { label: 'XP System', value: 'Gamified', icon: <Trophy className="w-4 h-4" /> },
      { label: 'Badges', value: 'TBD', icon: <Award className="w-4 h-4" /> },
      { label: 'Leaderboard', value: 'Global', icon: <TrendingUp className="w-4 h-4" /> }
    ],
    gradient: 'from-yellow-500/20 via-orange-500/20 to-red-500/20'
  }
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative w-full">
      {/* Main Carousel */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-background/50 to-muted/20">
        <div className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-50',
          currentSlideData.gradient
        )} />
        
        <div className="relative z-10 p-6 md:p-8 lg:p-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center min-h-[350px]">
            {/* Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Badge variant="outline" className="font-mono border-dashed bg-primary/10">
                  {currentSlideData.subtitle}
                </Badge>
                
                <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold font-mono bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent leading-tight">
                  {currentSlideData.title}
                </h1>
                
                <p className="text-base md:text-lg text-muted-foreground font-mono leading-relaxed">
                  {currentSlideData.description}
                </p>
              </div>

              {/* Stats */}
              {currentSlideData.stats && (
                <div className="grid grid-cols-3 gap-3">
                  {currentSlideData.stats.map((stat, index) => (
                    <div key={index} className="text-center p-2 bg-background/50 backdrop-blur-sm rounded-lg border border-dashed border-primary/20">
                      <div className="flex items-center justify-center mb-1 text-primary">
                        {stat.icon}
                      </div>
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
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={currentSlideData.cta.href}>
                  <Button 
                    size="default" 
                    variant={currentSlideData.cta.variant || 'default'}
                    className="font-mono border-dashed hover:border-solid transition-all duration-200 group"
                  >
                    {currentSlideData.cta.text}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  size="default"
                  className="font-mono border-dashed hover:border-solid transition-all duration-200"
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                >
                  {isAutoPlaying ? 'Pause' : 'Play'}
                  <Play className={cn(
                    'ml-2 h-4 w-4 transition-transform',
                    isAutoPlaying && 'scale-0'
                  )} />
                </Button>
              </div>
            </div>

            {/* Visual Element */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="text-[120px] md:text-[150px] lg:text-[180px] opacity-20 select-none">
                  {currentSlideData.image}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm border-dashed hover:border-solid"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm border-dashed hover:border-solid"
          onClick={nextSlide}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'w-3 h-3 rounded-full border-2 border-dashed transition-all duration-200',
              index === currentSlide
                ? 'bg-primary border-primary border-solid'
                : 'bg-transparent border-primary/30 hover:border-primary/60'
            )}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-4 w-full bg-muted/30 rounded-full h-1 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-300 ease-out"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>
    </div>
  );
}