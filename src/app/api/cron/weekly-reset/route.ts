import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/server-push';

export async function GET(request: Request) {
  // Check for cron token to secure the route if deployed (e.g., Vercel Cron)
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch all users and their friendships
    const users = await prisma.user.findMany({
      include: {
        friends: {
          where: { status: 'ACCEPTED' },
          include: { friend: true }
        },
        friendOf: {
          where: { status: 'ACCEPTED' },
          include: { user: true }
        }
      }
    });

    const newAchievements = [];

    // 2. Calculate ranks and distribute rewards
    for (const user of users) {
      // Gather friends (bidirectional)
      const allFriends = [
        ...user.friends.map(f => f.friend),
        ...user.friendOf.map(f => f.user)
      ];

      // Remove duplicates just in case
      const uniqueFriendsMap = new Map();
      allFriends.forEach(f => uniqueFriendsMap.set(f.id, f));
      const uniqueFriends = Array.from(uniqueFriendsMap.values());

      // Only give badges if they actually competed against someone
      if (uniqueFriends.length > 0) {
        const competitors = [user, ...uniqueFriends];
        // Sort descending by weeklyXP
        competitors.sort((a, b) => b.weeklyXp - a.weeklyXp);

        const myRank = competitors.findIndex(c => c.id === user.id) + 1;

        // Determine badge type based on rank
        let badgeType: "LEAGUE_GOLD" | "LEAGUE_SILVER" | "LEAGUE_BRONZE" | null = null;
        let notifTitle = "";
        let notifMessage = "";

        if (myRank === 1) {
          badgeType = "LEAGUE_GOLD";
          notifTitle = "Weekly Champion! 🥇";
          notifMessage = "You finished 1st in your Friend League this week!";
        } else if (myRank === 2) {
          badgeType = "LEAGUE_SILVER";
          notifTitle = "League Runner-Up! 🥈";
          notifMessage = "You finished 2nd in your Friend League this week! Push harder for Gold!";
        } else if (myRank === 3) {
          badgeType = "LEAGUE_BRONZE";
          notifTitle = "Top 3 Finish! 🥉";
          notifMessage = "You finished 3rd in your Friend League this week. Great effort!";
        } else {
          notifTitle = "League Reset";
          notifMessage = `You finished rank ${myRank} this week. A new week begins, time to grind!`;
        }

        // Always notify they finished a league if they competed
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: notifTitle,
            message: notifMessage,
          }
        });

        // Send a web push notification
        await sendPushNotification(user.id, {
          title: notifTitle,
          body: notifMessage,
          url: "/dashboard"
        });

        if (badgeType && user.weeklyXp > 0) {
          // Check if they already earned this badge (prevent duplicates if they win multiple times?
          // Wait, users might win it multiple times. Should we allow duplicates?
          // The UserAchievement model has `@@unique([userId, type])`. 
          // If we want multiple, we need to alter the schema, but let's stick to unlocking it once as a general milestone for now.
          // Or we can just catch the unique constraint error.
          newAchievements.push({
            userId: user.id,
            type: badgeType,
          });
        }
      }
    }

    // Insert achievements (ignoring conflicts if they already unlocked it)
    for (const ach of newAchievements) {
      await prisma.userAchievement.upsert({
        where: {
          userId_type: { userId: ach.userId, type: ach.type as any }
        },
        update: {}, // Do nothing if it exists
        create: {
          userId: ach.userId,
          type: ach.type as any,
        }
      });
    }

    // 3. Reset Weekly XP for all users to 0
    await prisma.user.updateMany({
      data: { weeklyXp: 0 }
    });

    return NextResponse.json({ success: true, achievementsAwarded: newAchievements.length });
  } catch (error: any) {
    console.error('Weekly reset error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
