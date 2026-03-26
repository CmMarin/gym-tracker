"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function startOrResumeWorkout(workoutPlanId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const userId = session.user.id;

  const existing = await prisma.activeWorkout.findUnique({
    where: { userId }
  });

  if (existing) {
    if (existing.workoutPlanId === workoutPlanId) {
      return { success: true, activeWorkout: existing };
    } else {
      await prisma.activeWorkout.delete({ where: { userId } });
    }
  }

  const plan = await prisma.workoutPlan.findUnique({
    where: { id: workoutPlanId },
    include: {
      planExercises: {
        include: { exercise: true }
      }
    }
  });

  if (!plan) throw new Error("Plan not found");

  const pastLogs = await prisma.setLog.groupBy({
    by: ["exerciseId"],
    where: { userId, exerciseId: { in: plan.planExercises.map(px => px.exerciseId) } },
    _max: { weight: true, reps: true }
  });

  const state = {
    currentExerciseIndex: 0,
    exercises: plan.planExercises.map(px => {
      const pastLog = pastLogs.find(l => l.exerciseId === px.exerciseId);
      return {
        id: px.exerciseId,
        name: px.exercise.name,
        targetSets: px.targetSets,
        targetReps: px.targetReps,
        sets: Array.from({ length: px.targetSets }).map(() => ({
          reps: pastLog?._max.reps?.toString() || "",
          weight: pastLog?._max.weight?.toString() || "",
          completed: false
        }))
      };
    })
  };

  const active = await prisma.activeWorkout.create({
    data: {
      userId,
      workoutPlanId,
      state: state as any
    }
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
    data: { state: state as any }
  });

  return { success: true };
}

export async function cancelActiveWorkout() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false };

  await prisma.activeWorkout.delete({
    where: { userId: session.user.id }
  });

  revalidatePath("/workout");
  revalidatePath("/dashboard");
  return { success: true };
}
