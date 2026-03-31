import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FriendsList from "./FriendsList";
import FriendsWidget from "@/components/FriendsWidget";

export default async function FriendsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Get user's friends
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { userId: userId },
        { friendId: userId }
      ]
    },
    include: {
      user: {
        select: { id: true, username: true, image: true, xp: true, streakDays: true }
      },
      friend: {
        select: { id: true, username: true, image: true, xp: true, streakDays: true }
      }
    }
  });

  const friends = friendships
    .filter((f: any) => f.status === "ACCEPTED")
    .map((f: any) => (f.userId === userId ? f.friend : f.user));

  const pendingRequestsToMe = friendships
    .filter((f: any) => f.status === "PENDING" && f.friendId === userId)
    .map((f: any) => ({ friendshipId: f.id, user: f.user }));

  // Get latest activity for friends
  const activeWorkouts = await prisma.activeWorkout.findMany({
    where: {
      userId: { in: friends.map((f: any) => f.id) }
    },
    include: {
      workoutPlan: { select: { name: true } }
    }
  });

  const recentSessions = await prisma.workoutSession.findMany({
    where: {
      userId: { in: friends.map((f: any) => f.id) }
    },
    orderBy: { completedAt: 'desc' },
    distinct: ['userId'], // get latest session per user
    include: {
      workoutPlan: { select: { name: true } }
    }
  });

  // Assemble friend data
  const friendsData = friends.map((friend: any) => {
    const isOnline = activeWorkouts.find(aw => aw.userId === friend.id);
    const lastSession = recentSessions.find(rs => rs.userId === friend.id);
    
    return {
      id: friend.id,
      username: friend.username,
      image: friend.image,
      xp: friend.xp,
      streakDays: friend.streakDays,
      level: Math.floor(friend.xp / 1000) + 1,
      isOnline: !!isOnline,
      activeWorkoutName: isOnline?.workoutPlan?.name,
      lastActive: lastSession ? lastSession.completedAt.toISOString() : null,
      lastWorkoutName: lastSession?.workoutPlan?.name
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-32 pt-8 selection:- selection:-">
      <div className="max-w-xl mx-auto px-4 md:px-0">
        <h1 className="text-3xl font-black text-slate-800 mb-6">Friends</h1>
        <div className="mb-6">
          <FriendsWidget pendingRequests={pendingRequestsToMe} />
        </div>
        <FriendsList initialFriends={friendsData} />
      </div>
    </div>
  );
}
