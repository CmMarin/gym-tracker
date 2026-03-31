"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { differenceInCalendarWeeks } from "date-fns";
import { broadcastToUsers } from "@/lib/server-push";

export async function finishWorkoutAction(workoutData: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = session.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const activeWk = await prisma.activeWorkout.findUnique({ where: { userId } });
  if (!activeWk) throw new Error("No active workout found");

  const stateData = activeWk.state
    ? typeof activeWk.state === "string"
      ? JSON.parse(activeWk.state)
      : activeWk.state
    : {};
  const coopSessionId = stateData.coopSessionId;

  // Batch collect exercise ids for historical lookups (avoid per-exercise queries)
  const exerciseIds: string[] = [];
  const customExerciseIds: string[] = [];
  for (const ex of workoutData.exercises || []) {
    if (!ex?.id) continue;
    if (ex.isCustom) {
      customExerciseIds.push(ex.id);
    } else {
      exerciseIds.push(ex.id);
    }
  }

  const historyFilters = [] as any[];
  if (exerciseIds.length) historyFilters.push({ exerciseId: { in: exerciseIds } });
  if (customExerciseIds.length) historyFilters.push({ customExerciseId: { in: customExerciseIds } });

  const pastLogsAll = historyFilters.length
    ? await prisma.setLog.findMany({
        where: { userId, OR: historyFilters },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const logsByKey: Record<string, any[]> = {};
  for (const log of pastLogsAll) {
    const key = log.exerciseId ? `ex:${log.exerciseId}` : log.customExerciseId ? `cx:${log.customExerciseId}` : "";
    if (!key) continue;
    if (!logsByKey[key]) logsByKey[key] = [];
    logsByKey[key].push(log);
  }

  let totalXpEarned = 100; // Base completion XP
  const prs: string[] = [];
  let totalVolume = 0;
  let penaltyCount = 0;

  // Create workout session first
  const startTime = activeWk.startTime;
  const durationMinutes = Math.floor(
    (new Date().getTime() - startTime.getTime()) / 60000,
  );

  const workoutSession = await prisma.workoutSession.create({
    data: {
      userId,
      workoutPlanId: activeWk.workoutPlanId,
      durationMinutes,
      totalXpEarned: 0, // Will update later
    },
  });

  // evaluate exercises
  for (const ex of workoutData.exercises) {
    if (!ex.id) continue;
    let exercisePr = false;

    const key = ex.isCustom ? `cx:${ex.id}` : `ex:${ex.id}`;
    const pastLogs = key ? logsByKey[key] || [] : [];
    const hasHistory = pastLogs.length > 0;

    let allTimeBestWeight = 0;
    let allTimeBestReps = 0;
    let lastSessionMaxWeight = 0;
    let lastSessionMaxReps = 0;

    if (hasHistory) {
      // Find all time best
      for (const log of pastLogs) {
        if (
          log.weight > allTimeBestWeight ||
          (log.weight === allTimeBestWeight && log.reps > allTimeBestReps)
        ) {
          allTimeBestWeight = log.weight;
          allTimeBestReps = log.reps;
        }
      }

      // Find last session best (for regression deduction)
      const lastSessionDate = pastLogs[0].createdAt.toDateString();
      const lastSessionLogs = pastLogs.filter(
        (l) => l.createdAt.toDateString() === lastSessionDate,
      );

      for (const l of lastSessionLogs) {
        if (
          l.weight > lastSessionMaxWeight ||
          (l.weight === lastSessionMaxWeight && l.reps > lastSessionMaxReps)
        ) {
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
      if (Number.isNaN(weight) || Number.isNaN(reps)) continue;
      const isWarmup = set.isWarmup || false;
      let isPR = false;

      totalVolume += weight * reps;

      // Only count non-warmup sets for PRs and Performance Tracking
      if (!isWarmup) {
        // Update this session's max stats for deduction check
        if (
          weight > thisSessionMaxWeight ||
          (weight === thisSessionMaxWeight && reps > thisSessionMaxReps)
        ) {
          thisSessionMaxWeight = weight;
          thisSessionMaxReps = reps;
        }

        // PR Logic: Strictly greater than historical max, AND history must exist
        if (
          hasHistory &&
          (weight > allTimeBestWeight ||
            (weight === allTimeBestWeight && reps > allTimeBestReps))
        ) {
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
          xpEarned: isPR ? 60 : isWarmup ? 5 : 10,
        },
      });
    }

    // Performance Deduction Logic: If performed worse than LAST session
    if (hasHistory && thisSessionMaxWeight > 0) {
      if (
        thisSessionMaxWeight < lastSessionMaxWeight ||
        (thisSessionMaxWeight === lastSessionMaxWeight &&
          thisSessionMaxReps < lastSessionMaxReps)
      ) {
        totalXpEarned -= 20; // Regression penalty
        penaltyCount += 1;
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
    data: { totalXpEarned },
  });

  // Clear Active Workout
  await prisma.activeWorkout.delete({
    where: { userId },
  });

  // --- CO-OP GAMEPLAY COMPLETION ---
  if (coopSessionId) {
    try {
      const coopSession = await prisma.coopSession.findUnique({
        where: { id: coopSessionId },
      });
      if (coopSession && coopSession.status === "ACTIVE") {
        totalXpEarned += 100; // Bonus for finishing a co-op session!

        await prisma.coopSessionMember.update({
          where: { sessionId_userId: { sessionId: coopSessionId, userId } },
          data: {
            status: "COMPLETED",
            prsCount: prs.length,
            volume: totalVolume,
            penalties: penaltyCount,
          },
        });

        // Check if all members are completed
        const allMembers = await prisma.coopSessionMember.findMany({
          where: { sessionId: coopSessionId },
        });
        const allCompleted = allMembers.every(
          (m: any) => m.status === "COMPLETED",
        );

        if (allCompleted) {
          const finalSession = await prisma.coopSession.update({
            where: { id: coopSessionId },
            data: { status: "COMPLETED", endedAt: new Date() },
          });

          if (finalSession.totalXp >= finalSession.goalXp) {
            totalXpEarned += 200; // Team met the shared goal!
          }

          // Notify everyone in the session that it's complete!
          const memberIds = allMembers.map((m: any) => m.userId);
          await broadcastToUsers(memberIds, {
            title: "Co-Op Completed!",
            body: `Your Co-Op team finished the session and earned ${finalSession.totalXp} XP!`,
            url: "/dashboard"
          });
        } else {
          // Notify others that this user finished
          const otherMembers = allMembers.filter((m: any) => m.userId !== userId);
          if (otherMembers.length > 0) {
            await broadcastToUsers(otherMembers.map((m: any) => m.userId), {
              title: "Co-Op Update",
              body: `${user.username} just finished their workout!`,
              url: "/dashboard"
            });
          }
        }
      }
    } catch (error) {
      console.error("Co-Op Completion Error:", error);
    }
  }

  const newXp = user.xp + totalXpEarned;
  const newWeeklyXp = (user.weeklyXp || 0) + totalXpEarned;
  const currentLevel = Math.floor(user.xp / 1000) + 1;
  const newLevel = Math.floor(newXp / 1000) + 1;
  const didLevelUp = newLevel > currentLevel;

  // Streak logic
  const prevSession = await prisma.workoutSession.findFirst({
    where: { userId, id: { not: workoutSession.id } },
    orderBy: { completedAt: "desc" },
  });

  let newStreak = user.streakDays || 0;
  if (!prevSession) {
    newStreak = 1;
  } else {
    const diffWeeks = differenceInCalendarWeeks(
      workoutSession.completedAt,
      prevSession.completedAt,
      { weekStartsOn: 1 },
    );
    if (diffWeeks === 1) {
      newStreak += 1;
    } else if (diffWeeks > 1) {
      newStreak = 1;
    }
  }
  if (newStreak === 0) newStreak = 1;

  await prisma.user.update({
    where: { id: user.id },
    data: { xp: newXp, weeklyXp: newWeeklyXp, streakDays: newStreak },
  });

  // --- ACHIEVEMENTS LOGIC ---
  const earnedAchs: string[] = [];
  const existingAchs = await prisma.userAchievement.findMany({
    where: { userId },
  });
  const existingTypes = new Set(existingAchs.map((a) => a.type));

  const checkAndAward = async (type: any, condition: boolean) => {
    if (condition && !existingTypes.has(type)) {
      await prisma.userAchievement.create({ data: { userId, type } });
      earnedAchs.push(type);
    }
  };

  await checkAndAward("FIRST_WORKOUT", !prevSession);
  await checkAndAward(
    "NIGHT_OWL",
    new Date().getHours() >= 22 || new Date().getHours() <= 3,
  );
  await checkAndAward("IRON_STREAK", newStreak >= 30);

  const hit100kg = workoutData.exercises.some((ex: any) =>
    ex.sets?.some((s: any) => parseFloat(s.weight || "0") >= 100),
  );
  await checkAndAward("CLUB_100_KG", hit100kg);

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/workout");

  return {
    success: true,
    newXp,
    newLevel,
    didLevelUp,
    xpEarned: totalXpEarned,
    prs,
    earnedAchievements: earnedAchs,
  };
}
