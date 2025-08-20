import { NextRequest, NextResponse } from 'next/server';
import { mockQuests } from '@/lib/mock-data';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    console.log('API: Fetching quest with ID:', id);

    const quest = mockQuests.find(q => q.id === id);

    if (!quest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found' },
        { status: 404 }
      );
    }

    console.log('API: Found quest:', quest.title);

    return NextResponse.json({
      success: true,
      data: quest
    });
  } catch (error) {
    console.error('API Error in /api/quests/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quest' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    console.log('API: Updating quest with ID:', id, 'Data:', body);

    const quest = mockQuests.find(q => q.id === id);

    if (!quest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found' },
        { status: 404 }
      );
    }

    // In a real implementation, you would update the database
    // For now, just return the updated quest with mock data
    const updatedQuest = {
      ...quest,
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: updatedQuest,
      message: 'Quest updated successfully'
    });
  } catch (error) {
    console.error('API Error in PUT /api/quests/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quest' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    console.log('API: Deleting quest with ID:', id);

    const quest = mockQuests.find(q => q.id === id);

    if (!quest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found' },
        { status: 404 }
      );
    }

    // In a real implementation, you would delete from database
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Quest deleted successfully'
    });
  } catch (error) {
    console.error('API Error in DELETE /api/quests/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete quest' },
      { status: 500 }
    );
  }
}