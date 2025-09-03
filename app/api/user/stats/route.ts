import { NextRequest, NextResponse } from "next/server";
import { SubmissionsApi } from "@/lib/api/submissions";
import { BadgesApi } from "@/lib/api/badges";

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Decode the JWT token to extract user ID (basic decoding without verification)
    // This is a simple base64 decode of the payload part
    let userId: string;
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid token format");
      }

      const payload = parts[1];
      const decoded = JSON.parse(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
      );

      if (!decoded || !decoded.id) {
        throw new Error("Invalid token payload");
      }
      userId = String(decoded.id);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Fetch user statistics in parallel
    const [badges, submissions] = await Promise.all([
      BadgesApi.listByUser(userId).catch(() => []),
      SubmissionsApi.list({ userId }).catch(() => []),
    ]);

    // Calculate quest statistics
    const completedQuests = submissions.filter(
      (sub) => sub.status === "approved"
    );
    const rejectedQuests = submissions.filter(
      (sub) => sub.status === "rejected"
    );
    const pendingQuests = submissions.filter(
      (sub) => sub.status === "pending" || sub.status === "needs-revision"
    );

    const stats = {
      numberOfBadges: badges.length,
      numberOfquestCompleted: completedQuests.length,
      numberOfquestRejected: rejectedQuests.length,
      numberOfquestPending: pendingQuests.length,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);

    // Return default structure on error
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user statistics",
        stats: {
          numberOfBadges: 0,
          numberOfquestCompleted: 0,
          numberOfquestRejected: 0,
          numberOfquestPending: 0,
        },
      },
      { status: 500 }
    );
  }
}
