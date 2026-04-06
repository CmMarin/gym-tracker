"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendPushNotification } from "@/lib/server-push";

export async function sendHypeNotification(targetUserId: string, prExercise: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  await sendPushNotification(targetUserId, {
    title: "🔥 You got HYPED!",
    body: `${session.user.username || "Someone"} hyped your PR on ${prExercise}! Keep it up!`,
    url: "/dashboard"
  });

  return { success: true };
}

export async function addBodyWeightLog(weight: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  await prisma.bodyWeightLog.create({
    data: {
      userId: session.user.id,
      weight
    }
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function updateUserImage(imageUrl: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: imageUrl }
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function clearAllWorkoutPlans() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  try {
    await prisma.activeWorkout.deleteMany({
      where: { userId: session.user.id }
    });

    await prisma.planExercise.deleteMany({
       where: { workoutPlan: { userId: session.user.id } }
    });

    await prisma.workoutPlan.deleteMany({
      where: { userId: session.user.id }
    });
  } catch (err) {
    console.error("Failed to delete all securely", err);
  }

  revalidatePath("/profile");
  revalidatePath("/workout");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteWorkoutPlan(planId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  try {
    await prisma.activeWorkout.deleteMany({
      where: { userId: session.user.id, workoutPlanId: planId }
    });

    await prisma.planExercise.deleteMany({
       where: { workoutPlanId: planId }
    });

    await prisma.workoutPlan.delete({
      where: { id: planId, userId: session.user.id }
    });
  } catch (err) {
    console.error("Failed to delete the routine securely", err);
    return { success: false, error: "Failed to delete routine" };
  }

  revalidatePath("/profile");
  revalidatePath("/workout");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function saveWorkoutPlan(
  planId: string | null,
  name: string,
  exercises: { exerciseId?: string | null, customExerciseId?: string | null, targetSets: number, targetReps: number }[]
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  try {
    let finalPlanId = planId;

    if (planId) {
      const existing = await prisma.workoutPlan.findUnique({ where: { id: planId, userId: session.user.id } });
      if (!existing) throw new Error("Plan not found");

      await prisma.workoutPlan.update({ where: { id: planId }, data: { name } });
      await prisma.planExercise.deleteMany({ where: { workoutPlanId: planId } });
    } else {
      const newPlan = await prisma.workoutPlan.create({
        data: { userId: session.user.id, name }
      });
      finalPlanId = newPlan.id;
    }

    if (exercises.length > 0 && finalPlanId) {
      await prisma.planExercise.createMany({
        data: exercises.map(ex => ({
          workoutPlanId: finalPlanId!,
          exerciseId: ex.exerciseId || null,
          customExerciseId: ex.customExerciseId || null,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps
        }))
      });
    }

    revalidatePath("/profile");
    revalidatePath("/workout");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Failed to save workout plan", err);
    return { success: false, error: "Failed to save workout plan" };
  }
}
