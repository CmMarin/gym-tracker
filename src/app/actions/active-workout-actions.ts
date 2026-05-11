"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function startOrResumeWorkout(
  workoutPlanId: string,
  coopSessionId?: string,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const userId = session.user.id;

  const existing = await prisma.activeWorkout.findUnique({
    where: { userId },
  });

  if (existing) {
    if (existing.workoutPlanId === workoutPlanId) {
      if (coopSessionId) {
        // Inject coop session id into the existing state
        const newState = { ...(existing.state as any), coopSessionId };
        await prisma.activeWorkout.update({
          where: { userId },
          data: { state: newState },
        });
        existing.state = newState;
      }
      return { success: true, activeWorkout: existing };
    } else {
      await prisma.activeWorkout.delete({ where: { userId } });
    }
  }

  const plan = await prisma.workoutPlan.findUnique({
    where: { id: workoutPlanId },
    include: {
      planExercises: {
        include: { exercise: true, customExercise: true },
      },
    },
  });

  if (!plan) throw new Error("Plan not found");

  const exerciseIds = plan.planExercises
    .map((px) => px.exerciseId)
    .filter((id): id is string => id !== null);
  const customExerciseIds = plan.planExercises
    .map((px) => px.customExerciseId)
    .filter((id): id is string => id !== null);

  const pastLogsData = await Promise.all([
    exerciseIds.length > 0
      ? prisma.setLog.findMany({
          where: { userId, exerciseId: { in: exerciseIds } },
          orderBy: { createdAt: "desc" },
          take: 200, // Get enough to find the most recent session's stats
        })
      : Promise.resolve([]),
    customExerciseIds.length > 0
      ? prisma.setLog.findMany({
          where: { userId, customExerciseId: { in: customExerciseIds } },
          orderBy: { createdAt: "desc" },
          take: 200,
        })
      : Promise.resolve([]),
  ]);

  // Group by exercise and find the max weight and its reps from the *most recent session* only
  const getRecentStats = (logs: any[], idField: "exerciseId" | "customExerciseId") => {
    const stats: Record<string, { maxWeight: number; maxReps: number }> = {};
    for (const log of logs) {
      const id = log[idField];
      if (!id) continue;
      
      // If we haven't seen this exercise yet, track its session
      if (!stats[id]) {
        // Find all logs for THIS exactly recent session
        const sessionLogs = logs.filter(l => l[idField] === id && l.sessionId === log.sessionId);
        const maxWeightLog = sessionLogs.reduce((max, current) => current.weight > max.weight ? current : max, sessionLogs[0]);
        stats[id] = { maxWeight: maxWeightLog.weight, maxReps: maxWeightLog.reps };
      }
    }
    return Object.entries(stats).map(([id, s]) => ({ id, _max: { weight: s.maxWeight, reps: s.maxReps } }));
  };

  const allPastLogs = {
    exercises: getRecentStats(pastLogsData[0], "exerciseId"),
    customExercises: getRecentStats(pastLogsData[1], "customExerciseId"),
  };

  const state = {
    currentExerciseIndex: 0,
    coopSessionId: coopSessionId || undefined,
    exercises: plan.planExercises.map((px) => {
      const exercise = px.exercise || px.customExercise;

      const pastLog = px.customExerciseId
        ? allPastLogs.customExercises.find((l) => l.id === px.customExerciseId)
        : allPastLogs.exercises.find((l) => l.id === px.exerciseId);

      let suggestedWeight = pastLog?._max?.weight || 0;
      const pastMaxReps = pastLog?._max?.reps || 0;
      let isProgressionSuggested = false;

      // Smart Progressive Overload Auto-Fill
      // If they comfortably hit the target reps (or higher) with their previous max weight, suggest +2.5kg
      if (suggestedWeight > 0 && pastMaxReps >= px.targetReps) {
        suggestedWeight += 2.5;
        isProgressionSuggested = true;
      }

      return {
        id: px.exerciseId || px.customExerciseId,
        name: exercise?.name || "Unknown",
        isCustom: !!px.customExerciseId,
        targetSets: px.targetSets,
        targetReps: px.targetReps,
        isProgressionSuggested,
        sets: Array.from({ length: px.targetSets }).map(() => ({
          reps: pastMaxReps ? pastMaxReps.toString() : "",
          weight: suggestedWeight ? suggestedWeight.toString() : "",
          completed: false,
        })),
      };
    }),
  };

  const active = await prisma.activeWorkout.create({
    data: {
      userId,
      workoutPlanId,
      state: state as any,
    },
  });

  revalidatePath("/workout");
  revalidatePath("/dashboard");

  return { success: true, activeWorkout: active };
}

export async function updateWorkoutState(state: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false };

  await prisma.activeWorkout.update({
    where: { userId: session.user.id },
    data: { state: state as any },
  });

  return { success: true };
}

export async function cancelActiveWorkout() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false };

  await prisma.activeWorkout.delete({
    where: { userId: session.user.id },
  });

  revalidatePath("/workout");
  revalidatePath("/dashboard");
  return { success: true };
}
export async function getAlternativeExercises(exerciseId: string, isCustom: boolean) {
  try {
    let category = null;
    let fallbackName = null;

    if (isCustom) {
      const ex = await prisma.customExercise.findUnique({
        where: { id: exerciseId },
        select: { category: true, name: true, targetMuscles: true }
      });
      category = ex?.category || (ex?.targetMuscles && ex.targetMuscles[0]) || null;
      fallbackName = ex?.name;
    } else {
      const ex = await prisma.exercise.findUnique({
        where: { id: exerciseId },
        select: { category: true, name: true }
      });
      category = ex?.category;
      fallbackName = ex?.name;
    }

    if (!category && !fallbackName) return { success: true, alternatives: [] };

    // Find 3 other exercises with the same category (default exercises only for simplicity)
    let alternatives: any[] = [];
    
    if (category) {
      alternatives = await prisma.exercise.findMany({
        where: {
          category,
          id: { not: exerciseId }
        },
        take: 20
      });
    }

    // If category didn't yield enough results, try fuzzy name matching
    if (alternatives.length < 3 && fallbackName) {
      const mainKeyword = fallbackName.split(" ").filter((w: string) => w.length > 3)[0];
      if (mainKeyword) {
         const nameMatches = await prisma.exercise.findMany({
           where: {
             name: { contains: mainKeyword, mode: "insensitive" },
             id: { not: exerciseId }
           },
           take: 10
         });
         alternatives = [...alternatives, ...nameMatches];
         // Deduplicate
         alternatives = Array.from(new Map(alternatives.map((item: any) => [item.id, item])).values());
      }
    }

    // Randomize 3
    const shuffled = alternatives.sort(() => 0.5 - Math.random());
    return { success: true, alternatives: shuffled.slice(0, 3) };
  } catch (error) {
    console.error("Error fetching alternatives:", error);
    return { success: false, alternatives: [] };
  }
}