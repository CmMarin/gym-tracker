"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { differenceInCalendarWeeks } from "date-fns";

export async function finishWorkoutAction(workoutData: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = session.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const activeWk = await prisma.activeWorkout.findUnique({ where: { userId } });
  if (!activeWk) throw new Error("No active workout found");
  
  let totalXpEarned = 100; // Base completion XP
  const prs: string[] = [];
  
  // Create workout session first
  const startTime = activeWk.startTime;
  const durationMinutes = Math.floor((new Date().getTime() - startTime.getTime()) / 60000);

  const workoutSession = await prisma.workoutSession.create({
    data: {
      userId,
      workoutPlanId: activeWk.workoutPlanId,
      durationMinutes,
      totalXpEarned: 0 // Will update later
    }
  });

  // evaluate exercises
  for (const ex of workoutData.exercises) {
    if (!ex.id) continue;
    let exercisePr = false;

    // Get previous logs to check TRUE PRs cross-referencing by name
    const pastLogsAll = await prisma.setLog.findMany({
      where: {
        userId,
        OR: [
          { exercise: { name: ex.name } },
          { customExercise: { name: ex.name } }
        ]
      },
      orderBy: { createdAt: "desc" }
    });

    const hasHistory = pastLogsAll.length > 0;

    let allTimeBestWeight = 0;
    let allTimeBestReps = 0;
    let lastSessionMaxWeight = 0;
    let lastSessionMaxReps = 0;

    if (hasHistory) {
      // Find all time best
      for (const log of pastLogsAll) {
        if (log.weight > allTimeBestWeight || (log.weight === allTimeBestWeight && log.reps > allTimeBestReps)) {
          allTimeBestWeight = log.weight;
          allTimeBestReps = log.reps;
        }
      }

      // Find last session best (for regression deduction)
      const lastSessionDate = pastLogsAll[0].createdAt.toDateString();
      const lastSessionLogs = pastLogsAll.filter(l => l.createdAt.toDateString() === lastSessionDate);
      
      for (const l of lastSessionLogs) {
        if (l.weight > lastSessionMaxWeight || (l.weight === lastSessionMaxWeight && l.reps > lastSessionMaxReps)) {
          lastSessionMaxWeight = l.weight;
          lastSessionMaxReps = l.reps;
        }
      }
    }

    let thisSessionMaxWeight = 0;
    let thisSessionMaxReps = 0;

    for (let i = 0; i < ex.sets.length; i++) {
      const set = ex.sets[i];
      if (!set.completed || !set.reps || !set.weight) continue;

      const weight = parseFloat(set.weight);
      const reps = parseInt(set.reps, 10);
      const isWarmup = set.isWarmup || false;
      let isPR = false;

      // Only count non-warmup sets for PRs and Performance Tracking
      if (!isWarmup) {
        // Update this session's max stats for deduction check
        if (weight > thisSessionMaxWeight || (weight === thisSessionMaxWeight && reps > thisSessionMaxReps)) {
          thisSessionMaxWeight = weight;
          thisSessionMaxReps = reps;
        }

        // PR Logic: Strictly greater than historical max, AND history must exist
        if (hasHistory && (weight > allTimeBestWeight || (weight === allTimeBestWeight && reps > allTimeBestReps))) {
          isPR = true;
          exercisePr = true;
          allTimeBestWeight = weight; // update it so subsequent sets must beat THIS to be another PR
          allTimeBestReps = reps;
          totalXpEarned += 50; // PR Bonus!
        } else {
          totalXpEarned += 10; // Normal set XP
        }
      } else {
        totalXpEarned += 5; // Small XP for warmups
      }

      await prisma.setLog.create({
        data: {
          userId,
          sessionId: workoutSession.id,
          exerciseId: ex.isCustom ? null : ex.id,
          customExerciseId: ex.isCustom ? ex.id : null,
          setNumber: i + 1,
          reps,
          weight,
          isWarmup,
          isPR,
          xpEarned: isPR ? 60 : (isWarmup ? 5 : 10)
        }
      });
    }

    // Performance Deduction Logic: If performed worse than LAST session        
    if (hasHistory && thisSessionMaxWeight > 0) {
      if (thisSessionMaxWeight < lastSessionMaxWeight ||
         (thisSessionMaxWeight === lastSessionMaxWeight && thisSessionMaxReps < lastSessionMaxReps)) {
        totalXpEarned -= 20; // Regression penalty
      }
    }

    if (exercisePr) {
       prs.push(ex.name);
    }
  }

  // Prevent negative XP gains just in case it was a terrible workout
  if (totalXpEarned < 10) totalXpEarned = 10;

  // Update session total XP
  await prisma.workoutSession.update({
    where: { id: workoutSession.id },
    data: { totalXpEarned }
  });

  // Clear Active Workout
  await prisma.activeWorkout.delete({
    where: { userId }
  });

  const newXp = user.xp + totalXpEarned;
  const currentLevel = Math.floor(user.xp / 1000) + 1;
  const newLevel = Math.floor(newXp / 1000) + 1;
  const didLevelUp = newLevel > currentLevel;

  // Streak logic
  const prevSession = await prisma.workoutSession.findFirst({
    where: { userId, id: { not: workoutSession.id } },
    orderBy: { completedAt: "desc" }
  });

  let newStreak = user.streakDays || 0;
  if (!prevSession) {
    newStreak = 1;
  } else {
    const diffWeeks = differenceInCalendarWeeks(workoutSession.completedAt, prevSession.completedAt, { weekStartsOn: 1 });
    if (diffWeeks === 1) {
      newStreak += 1;
    } else if (diffWeeks > 1) {
      newStreak = 1;
    }
  }
  if (newStreak === 0) newStreak = 1;

  await prisma.user.update({
    where: { id: user.id },
    data: { xp: newXp, streakDays: newStreak }
  });

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/workout");

  return {
    success: true,
    newXp,
    newLevel,
    didLevelUp,
    xpEarned: totalXpEarned,
    prs
  };
}
