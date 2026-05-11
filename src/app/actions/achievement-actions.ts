"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AchievementType } from "@prisma/client";

export async function syncUserAchievements() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.name) return;

  const user = await prisma.user.findUnique({
    where: { username: session.user.name as string },
    include: {
      achievements: true,
      workoutSessions: {
        orderBy: { completedAt: 'asc' },
        include: {
          setLogs: {
            include: { exercise: true, customExercise: true }
          }
        }
      },
      friends: true,
      customExercises: true,
    }
  });

  if (!user) return;

  const unlocked = new Set(user.achievements.map((a) => a.type));
  const newAchievements: { userId: string; type: AchievementType; achievedAt: Date }[] = [];

  const addAchievement = (type: AchievementType, date: Date = new Date()) => {
    if (!unlocked.has(type)) {
      newAchievements.push({ userId: user.id, type, achievedAt: date });
      unlocked.add(type); // Prevent duplicate pushing in same run
    }
  };

  // Workout Counts
  const workoutCount = user.workoutSessions.length;
  if (workoutCount >= 1) addAchievement("FIRST_WORKOUT" as AchievementType, user.workoutSessions[0].completedAt);
  if (workoutCount >= 10) addAchievement("WORKOUT_10" as AchievementType, user.workoutSessions[9].completedAt);
  if (workoutCount >= 50) addAchievement("WORKOUT_50" as AchievementType, user.workoutSessions[49].completedAt);
  if (workoutCount >= 100) addAchievement("WORKOUT_100" as AchievementType, user.workoutSessions[99].completedAt);

  // Social & Custom
  if (user.customExercises.length > 0) addAchievement("CREATOR" as AchievementType);
  if (user.friends.length >= 1) addAchievement("SOCIAL_START" as AchievementType);
  if (user.friends.length >= 5) addAchievement("GYM_BRO" as AchievementType);

  // Session iteration for conditionals
  let ironStreakProgress: { s: boolean; b: boolean; d: boolean; firstDate?: Date } = { s: false, b: false, d: false };

  for (const session of user.workoutSessions) {
    const d = session.completedAt;
    
    // Total Volume > 1000kg
    const sessionVolume = session.setLogs.reduce((acc, set) => acc + (set.weight * set.reps), 0);
    if (sessionVolume >= 9000 && !unlocked.has("LIFT_9000_KG" as AchievementType)) {
      addAchievement("LIFT_9000_KG" as AchievementType, d);
    }

    // Night Owl / Early Bird (Based on UTC / server localized approx)
    const hours = d.getHours();
    if (hours < 6 && !unlocked.has("EARLY_BIRD" as AchievementType)) addAchievement("EARLY_BIRD" as AchievementType, d);
    if (hours >= 22 && !unlocked.has("NIGHT_OWL" as AchievementType)) addAchievement("NIGHT_OWL" as AchievementType, d);

    // Iterating sets
    for (const set of session.setLogs) {
      // 100kg Club
      if (set.weight >= 100 && !unlocked.has("CLUB_100_KG" as AchievementType)) {
        addAchievement("CLUB_100_KG" as AchievementType, d);
      }
      
      // PR
      if (set.isPR && !unlocked.has("PR_HIT" as AchievementType)) {
        addAchievement("PR_HIT" as AchievementType, d);
      }

      // Iron Streak Tracker
      if (!unlocked.has("IRON_STREAK" as AchievementType)) {
         const name = (set.exercise?.name || set.customExercise?.name || "").toLowerCase();
         if (name.includes("squat")) ironStreakProgress.s = true;
         if (name.includes("bench")) ironStreakProgress.b = true;
         if (name.includes("deadlift") || name.includes("dl")) ironStreakProgress.d = true;

         if (!ironStreakProgress.firstDate) ironStreakProgress.firstDate = d;

         // Reset if over 7 days passed since first tracking
         const daysDiff = (d.getTime() - ironStreakProgress.firstDate.getTime()) / (1000 * 3600 * 24);
         if (daysDiff > 7) {
           // Reset window
           ironStreakProgress = { s: false, b: false, d: false, firstDate: d };
           if (name.includes("squat")) ironStreakProgress.s = true;
           if (name.includes("bench")) ironStreakProgress.b = true;
           if (name.includes("deadlift") || name.includes("dl")) ironStreakProgress.d = true;
         }

         if (ironStreakProgress.s && ironStreakProgress.b && ironStreakProgress.d) {
            addAchievement("IRON_STREAK" as AchievementType, d);
         }
      }
    }
  }

  // Streaks
  if (workoutCount > 0) {
    const dates = [...new Set(user.workoutSessions.map(ws => ws.completedAt.toISOString().split('T')[0]))].sort();
    let currentStreak = 1;
    let maxStreak = 1;
    const streakDates = new Map<number, Date>();

    for (let i = 1; i < dates.length; i++) {
        const d1 = new Date(dates[i - 1]);
        const d2 = new Date(dates[i]);
        const diffDays = Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            currentStreak++;
            if (currentStreak === 7 && !streakDates.has(7)) streakDates.set(7, new Date(dates[i]));
            if (currentStreak === 30 && !streakDates.has(30)) streakDates.set(30, new Date(dates[i]));
            if (currentStreak === 100 && !streakDates.has(100)) streakDates.set(100, new Date(dates[i]));
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
    }

    if (maxStreak >= 7) addAchievement("STREAK_7_DAYS" as AchievementType, streakDates.get(7));
    if (maxStreak >= 30) addAchievement("STREAK_30_DAYS" as AchievementType, streakDates.get(30));
    if (maxStreak >= 100) addAchievement("STREAK_100_DAYS" as AchievementType, streakDates.get(100));
  }

  // Insert any newly unlocked ones
  if (newAchievements.length > 0) {
    await prisma.userAchievement.createMany({
      data: newAchievements,
      skipDuplicates: true
    });
  }
}
