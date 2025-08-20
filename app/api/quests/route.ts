import { NextRequest, NextResponse } from 'next/server';
import { mockQuests } from '@/lib/mock-data';
import type { Quest, FilterOptions, QuestCategory, Difficulty } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const filters: FilterOptions = {
      categories: (searchParams.get('categories')?.split(',') || []) as QuestCategory[],
      difficulties: (searchParams.get('difficulties')?.split(',') || []) as Difficulty[],
      search: searchParams.get('search') || '',
      showCompleted: searchParams.get('showCompleted') === 'true',
    };

    console.log('API: Fetching quests with filters:', filters);

    // Apply filters to mock data
    let filteredQuests = mockQuests;

    if (filters.categories && filters.categories.length > 0) {
      filteredQuests = filteredQuests.filter(quest =>
        quest.category && filters.categories!.includes(quest.category)
      );
    }

    if (filters.difficulties && filters.difficulties.length > 0) {
      filteredQuests = filteredQuests.filter(quest => 
        filters.difficulties!.includes(quest.difficulty)
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredQuests = filteredQuests.filter(quest => 
        quest.title.toLowerCase().includes(searchLower) ||
        quest.description.toLowerCase().includes(searchLower)
      );
    }

    console.log('API: Returning', filteredQuests.length, 'quests');

    return NextResponse.json({
      success: true,
      data: filteredQuests,
      count: filteredQuests.length
    });
  } catch (error) {
    console.error('API Error in /api/quests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('API: Creating quest with data:', body);
    
    // In a real implementation, you would save to database
    // For now, just return a mock response
    const newQuest: Quest = {
      id: Date.now().toString(),
      title: body.title,
      description: body.description,
      reward: body.reward,
      difficulty: body.difficulty,
      status: body.status || 'active',
      category: body.category,
      estimatedTime: '15 minutes',
      completions: 0,
      currentParticipants: 0,
      requirements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newQuest,
      message: 'Quest created successfully'
    });
  } catch (error) {
    console.error('API Error in POST /api/quests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quest' },
      { status: 500 }
    );
  }
}