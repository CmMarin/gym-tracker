import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CompetitionDashboard from "@/components/CompetitionDashboard";
import FriendsWidget from "@/components/FriendsWidget";
import CurrentWorkoutWidget from "@/components/CurrentWorkoutWidget";
import FriendActivityWidget from "@/components/FriendActivityWidget";
import RecentPRsWidget from "@/components/RecentPRsWidget";

function getColors(username: string) {
  const colors = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-green-500", "bg-amber-500", "bg-rose-500"];
  const charCode = username.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}

type UserForLeaderboard = { id: string; username: string; xp: number };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = session.user.id;

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, xp: true },
  });

  if (!currentUser) return null;

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { userId: userId },
        { friendId: userId }
      ]
    },
    include: {
      user: { select: { id: true, username: true, xp: true } },
      friend: { select: { id: true, username: true, xp: true } }
    }
  });

  const acceptedFriends: UserForLeaderboard[] = [];
  const pendingRequestsToMe: { friendshipId: string; user: UserForLeaderboard }[] = [];

  friendships.forEach((f: any) => {
    if (f.status === "ACCEPTED") {
      const otherUser = f.userId === userId ? f.friend : f.user;
      acceptedFriends.push(otherUser as UserForLeaderboard);
    } else if (f.status === "PENDING" && f.friendId === userId) {
      pendingRequestsToMe.push({
        friendshipId: f.id,
        user: f.user as UserForLeaderboard
      });
    }
  });

  const allNetworkUsers = [currentUser.id, ...acceptedFriends.map(f => f.id)];

  const leaderboardRaw = [currentUser as UserForLeaderboard, ...acceptedFriends];
  const leaderboard = leaderboardRaw
    .sort((a, b) => b.xp - a.xp)
    .map((u, index) => ({
      id: u.id,
      username: u.id === userId ? "You" : u.username,
      xp: u.xp,
      rank: index + 1,
      avatarColor: getColors(u.username),
      isMe: u.id === userId
    }));

  const myActiveWorkout = await prisma.activeWorkout.findUnique({ where: { userId }, include: { workoutPlan: true } });
  
  const friendActivity = await prisma.activeWorkout.findMany({ 
    where: { userId: { in: acceptedFriends.map(f => f.id) } }, 
    include: { user: true, workoutPlan: true } 
  });
  
  const formattedFriendActivity = friendActivity.map((fa: any) => ({ username: fa.user.username, workoutName: fa.workoutPlan?.name || "Custom Workout" }));

  // Get recent PRs for the competition aspect
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentLogsWithPR = await prisma.setLog.findMany({
    where: {
      userId: { in: allNetworkUsers },
      isPR: true,
      
    },
    include: {
      user: true,
      exercise: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  const recentPRs = recentLogsWithPR.map((log: any) => ({
    id: log.id,
    username: log.user.username,
    exercise: log.exercise.name,
    weight: log.weight,
    reps: log.reps,
    isMe: log.userId === userId,
    date: log.createdAt.toISOString()
  }));

  return (
    <div className="min-h-screen flex flex-col items-center p-6 space-y-8 pb-32">
      <CompetitionDashboard leaderboard={leaderboard} />
      {myActiveWorkout && <CurrentWorkoutWidget workoutName={myActiveWorkout.workoutPlan?.name || "Custom Workout"} />}
      <FriendActivityWidget activities={formattedFriendActivity} />
      <RecentPRsWidget prs={recentPRs} />
      <div className="w-full max-w-md">
        <FriendsWidget pendingRequests={pendingRequestsToMe} />
      </div>
    </div>
  );
}
