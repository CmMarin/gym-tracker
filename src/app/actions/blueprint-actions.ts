"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Snapshot shape that we store in WorkoutBlueprint.data
interface BlueprintExercise {
  targetSets: number;
  targetReps: number;
  source: "standard" | "custom";
  exerciseId?: string | null;
  name?: string | null;
  category?: string | null;
  targetMuscles?: string[] | null;
}

interface BlueprintData {
  name: string;
  dayOfWeek: number | null;
  exercises: BlueprintExercise[];
}

export async function createWorkoutBlueprint(planId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const plan = await prisma.workoutPlan.findFirst({
    where: { id: planId, userId: session.user.id },
    include: {
      planExercises: {
        include: { exercise: true, customExercise: true },
      },
    },
  });

  if (!plan) throw new Error("Plan not found");

  const blueprintData = {
    name: plan.name,
    dayOfWeek: plan.dayOfWeek,
    exercises: plan.planExercises.map((px) => {
      const base = px.customExercise || px.exercise;
      const isCustom = !!px.customExerciseId;
      return {
        targetSets: px.targetSets,
        targetReps: px.targetReps,
        source: isCustom ? "custom" : "standard",
        exerciseId: isCustom ? null : px.exerciseId,
        name: base?.name ?? "Exercise",
        category: base?.category ?? null,
        targetMuscles: isCustom
          ? px.customExercise?.targetMuscles ?? []
          : null,
      } satisfies BlueprintExercise;
    }),
  } satisfies Prisma.InputJsonObject & BlueprintData;

  // Ensure code uniqueness with multiple retries
  let code = generateCode();
  for (let i = 0; i < 25; i += 1) {
    const existing = await prisma.workoutBlueprint.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!existing) break;
    code = generateCode();
    if (i === 24) throw new Error("Could not generate unique share code");
  }

  const blueprint = await prisma.workoutBlueprint.create({
    data: {
      code,
      ownerId: session.user.id,
      name: plan.name,
      dayOfWeek: plan.dayOfWeek,
      data: blueprintData,
    },
    select: { code: true },
  });

  return { success: true, code: blueprint.code };
}

export async function importWorkoutBlueprint(code: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const blueprint = await prisma.workoutBlueprint.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!blueprint) {
    return { success: false, error: "Blueprint not found" };
  }

  const data = blueprint.data as unknown as BlueprintData;
  const planName = data?.name || "Imported Workout";
  const exercises = Array.isArray(data?.exercises) ? data.exercises : [];

  let newPlanId = "";

  await prisma.$transaction(async (tx) => {
    const createdPlan = await tx.workoutPlan.create({
      data: {
        userId: session.user.id,
        name: planName,
        dayOfWeek: data?.dayOfWeek ?? null,
      },
    });

    newPlanId = createdPlan.id;

    for (const ex of exercises) {
      let exerciseId: string | null = null;
      let customExerciseId: string | null = null;

      if (ex.source === "standard" && ex.exerciseId) {
        const exists = await tx.exercise.findUnique({
          where: { id: ex.exerciseId },
          select: { id: true },
        });
        if (exists?.id) {
          exerciseId = exists.id;
        } else if (ex.name) {
          const byName = await tx.exercise.findFirst({
            where: { name: ex.name },
            select: { id: true },
          });
          exerciseId = byName?.id ?? null;
        }
      }

      if (!exerciseId) {
        // Create a custom exercise for the importer
        const createdCustom = await tx.customExercise.create({
          data: {
            userId: session.user.id,
            name: ex.name || "Shared Exercise",
            category: ex.category ?? null,
            targetMuscles: ex.targetMuscles || [],
          },
          select: { id: true },
        });
        customExerciseId = createdCustom.id;
      }

      await tx.planExercise.create({
        data: {
          workoutPlanId: createdPlan.id,
          exerciseId,
          customExerciseId,
          targetSets: ex.targetSets ?? 3,
          targetReps: ex.targetReps ?? 10,
        },
      });
    }

    await tx.workoutBlueprint.update({
      where: { id: blueprint.id },
      data: { imports: { increment: 1 } },
    });
  });

  revalidatePath("/workout");
  revalidatePath("/profile");
  revalidatePath("/dashboard");

  return { success: true, planId: newPlanId };
}
