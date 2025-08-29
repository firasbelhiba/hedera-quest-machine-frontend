import { NextRequest, NextResponse } from 'next/server';
import { SubmissionsApi } from '@/lib/api/submissions';
import { BadgesApi } from '@/lib/api/badges';
import { QuestService } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    // Get current user to ensure they're authenticated
    const currentUser = await QuestService.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Fetch user statistics in parallel
    const [badges, submissions] = await Promise.all([
      BadgesApi.listByUser(String(currentUser.id)).catch(() => []),
      SubmissionsApi.list({ userId: String(currentUser.id) }).catch(() => [])
    ]);

    // Calculate quest statistics
    const completedQuests = submissions.filter(sub => sub.status === 'approved');
    const rejectedQuests = submissions.filter(sub => sub.status === 'rejected');
    const pendingQuests = submissions.filter(sub => sub.status === 'pending' || sub.status === 'submitted');

    const stats = {
      numberOfBadges: badges.length,
      numberOfquestCompleted: completedQuests.length,
      numberOfquestRejected: rejectedQuests.length,
      numberOfquestPending: pendingQuests.length
    };

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    
    // Return default structure on error
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user statistics',
      stats: {
        numberOfBadges: 0,
        numberOfquestCompleted: 0,
        numberOfquestRejected: 0,
        numberOfquestPending: 0
      }
    }, { status: 500 });
  }
}