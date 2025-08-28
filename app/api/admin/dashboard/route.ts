import { NextRequest, NextResponse } from 'next/server';
import { QuestsApi } from '@/lib/api/quests';
import { SubmissionsApi } from '@/lib/api/submissions';
import { UsersApi } from '@/lib/api/users';

export async function GET(request: NextRequest) {
  try {
    // Get current date and date from last week for comparison
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Fetch all necessary data in parallel
    const [users, quests, submissions] = await Promise.all([
      UsersApi.list().catch(() => ({ data: [] })),
      QuestsApi.list().catch(() => []),
      SubmissionsApi.list({}).catch(() => [])
    ]);

    // Calculate user data
    const allUsers = Array.isArray(users) ? users : (users.data || []);
    const usersLastWeek = allUsers.filter((user: any) => {
      const createdAt = new Date(user.created_at || user.createdAt || 0);
      return createdAt >= lastWeek;
    });

    // Calculate quest submission data
    const allSubmissions = Array.isArray(submissions) ? submissions : [];
    const submissionsLastWeek = allSubmissions.filter((submission: any) => {
      const createdAt = new Date(submission.created_at || submission.createdAt || 0);
      return createdAt >= lastWeek;
    });

    // Calculate approval rate
    const approvedSubmissions = allSubmissions.filter((submission: any) => 
      submission.status === 'approved'
    );
    const approvedSubmissionsLastWeek = approvedSubmissions.filter((submission: any) => {
      const reviewedAt = new Date(submission.reviewed_at || submission.reviewedAt || 0);
      return reviewedAt >= lastWeek;
    });

    // Calculate approval rate percentage
    const totalApprovals = approvedSubmissions.length;
    const totalApprovalsLastWeek = approvedSubmissionsLastWeek.length;

    const response = {
      success: true,
      data: {
        userData: {
          count: allUsers.length,
          lastWeek: usersLastWeek.length
        },
        approvalRate: {
          count: totalApprovals,
          lastWeek: totalApprovalsLastWeek
        },
        questSubmissionData: {
          count: allSubmissions.length,
          lastWeek: submissionsLastWeek.length
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    
    // Return default structure on error
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
      data: {
        userData: {
          count: 0,
          lastWeek: 0
        },
        approvalRate: {
          count: 0,
          lastWeek: 0
        },
        questSubmissionData: {
          count: 0,
          lastWeek: 0
        }
      }
    }, { status: 500 });
  }
}