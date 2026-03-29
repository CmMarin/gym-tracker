import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { 
      xp: true, 
      streakDays: true,
      _count: {
        select: {
          notifications: { where: { read: false } }
        }
      }
    }
  });

  return NextResponse.json({
    xp: user?.xp || 0,
    streakDays: user?.streakDays || 0,
    unreadNotifications: user?._count.notifications || 0
  });
}
