import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      achievements: {
        orderBy: { achievedAt: 'desc' },
        take: 3
      },
      _count: {
        select: { workoutSessions: true }
      }
    }
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Calculate current weekly leaderboard rank
  const allUsers = await prisma.user.findMany({
    orderBy: { weeklyXp: 'desc' },
    select: { id: true }
  });
  const rank = allUsers.findIndex(u => u.id === userId) + 1;

  return NextResponse.json({
    success: true,
    data: {
      username: user.username,
      image: user.image,
      xp: user.xp,
      weeklyXp: user.weeklyXp,
      leaderboardRank: rank > 0 ? rank : null,
      streakDays: user.streakDays,
      totalWorkouts: user._count.workoutSessions,
      achievements: user.achievements
    }
  });
}
