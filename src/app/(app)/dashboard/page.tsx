import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CompetitionDashboard from "@/components/CompetitionDashboard";
import FriendsWidget from "@/components/FriendsWidget";
import CurrentWorkoutWidget from "@/components/CurrentWorkoutWidget";
import FriendActivityWidget from "@/components/FriendActivityWidget";
import RecentPRsWidget from "@/components/RecentPRsWidget";
import WeeklyPlannerWidget from "@/components/WeeklyPlannerWidget";

function getColors(username: string) {
  const colors = ["bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-green-500", "bg-amber-500", "bg-rose-500"];
  const charCode = username.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}

type UserForLeaderboard = { id: string; username: string; xp: number; weeklyXp: number };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = session.user.id;

  // Run initial independent queries in parallel
  const [
    currentUser, 
    friendships, 
    myActiveWorkout, 
    mySchedule, 
    mySavedPlans
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, xp: true, weeklyXp: true },
    }),
    prisma.friendship.findMany({
      where: {
        OR: [{ userId: userId }, { friendId: userId }]
      },
      include: {
        user: { select: { id: true, username: true, xp: true, weeklyXp: true } },
        friend: { select: { id: true, username: true, xp: true, weeklyXp: true } }
      }
    }),
    prisma.activeWorkout.findUnique({
      where: { userId },
      include: { workoutPlan: true }
    }),
    prisma.workoutSchedule.findUnique({
      where: { userId }
    }),
    prisma.workoutPlan.findMany({
      where: { userId },
      include: { planExercises: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  if (!currentUser) return null;

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
    .sort((a, b) => b.weeklyXp - a.weeklyXp)
    .map((u, index) => ({
      id: u.id,
      username: u.id === userId ? "You" : u.username,
      xp: u.weeklyXp,
      rank: index + 1,
      avatarColor: getColors(u.username),
      isMe: u.id === userId
    }));

  // Dependent queries in parallel
  const [friendActivity, recentLogsWithPR] = await Promise.all([
    prisma.activeWorkout.findMany({
      where: { userId: { in: acceptedFriends.map(f => f.id) } },
      include: { user: true, workoutPlan: true }
    }),
    prisma.setLog.findMany({
      where: {
        userId: { in: allNetworkUsers },
        isPR: true,
      },
      include: {
        user: true,
        exercise: true,
        customExercise: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);

  const formattedFriendActivity = friendActivity.map((fa: any) => ({ username: fa.user.username, workoutName: fa.workoutPlan?.name || "Custom Workout" }));    

  // Get recent PRs for the competition aspect
  const recentPRs = recentLogsWithPR.map((log: any) => ({
    id: log.id,
    username: log.user.username,
    exercise: log.exercise?.name || log.customExercise?.name || "Unknown Exercise",
    weight: log.weight,
    reps: log.reps,
    isMe: log.userId === userId,
    date: log.createdAt.toISOString()
  }));

  return (
    <div className="min-h-full flex flex-col items-center p-6 space-y-8 pb-32">
      <CompetitionDashboard leaderboard={leaderboard} />
      {myActiveWorkout && <CurrentWorkoutWidget workoutName={myActiveWorkout.workoutPlan?.name || "Custom Workout"} />}
      <WeeklyPlannerWidget 
        initialSchedule={mySchedule ? JSON.parse(JSON.stringify(mySchedule)) : null} 
        savedWorkouts={JSON.parse(JSON.stringify(mySavedPlans))} 
      />
      <FriendActivityWidget activities={formattedFriendActivity} />
      <RecentPRsWidget prs={recentPRs} />
      <div className="w-full max-w-md">
        <FriendsWidget pendingRequests={pendingRequestsToMe} />
      </div>
    </div>
  );
}
