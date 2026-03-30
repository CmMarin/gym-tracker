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
      ? prisma.setLog.groupBy({
          by: ["exerciseId"],
          where: { userId, exerciseId: { in: exerciseIds } },
          _max: { weight: true, reps: true },
        })
      : Promise.resolve([]),
    customExerciseIds.length > 0
      ? prisma.setLog.groupBy({
          by: ["customExerciseId"],
          where: { userId, customExerciseId: { in: customExerciseIds } },
          _max: { weight: true, reps: true },
        })
      : Promise.resolve([]),
  ]);

  const allPastLogs = {
    exercises: pastLogsData[0],
    customExercises: pastLogsData[1],
  };

  const state = {
    currentExerciseIndex: 0,
    coopSessionId: coopSessionId || undefined,
    exercises: plan.planExercises.map((px) => {
      const exercise = px.exercise || px.customExercise;

      const pastLog = px.customExerciseId
        ? allPastLogs.customExercises.find(
            (l) => l.customExerciseId === px.customExerciseId,
          )
        : allPastLogs.exercises.find((l) => l.exerciseId === px.exerciseId);

      return {
        id: px.exerciseId || px.customExerciseId,
        name: exercise?.name || "Unknown",
        isCustom: !!px.customExerciseId,
        targetSets: px.targetSets,
        targetReps: px.targetReps,
        sets: Array.from({ length: px.targetSets }).map(() => ({
          reps: pastLog?._max?.reps?.toString() || "",
          weight: pastLog?._max?.weight?.toString() || "",
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
