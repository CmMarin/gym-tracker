"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
