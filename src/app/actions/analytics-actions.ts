import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfWeek, endOfWeek } from "date-fns";

// Map our custom categories/muscles to react-body-highlighter muscles
export const categoryToMusclesMap: Record<string, string[]> = {
  Chest: ["chest"],
  Back: ["upper-back", "lower-back", "trapezius"],
  Shoulders: ["front-deltoids", "back-deltoids"],
  Biceps: ["biceps"],
  Triceps: ["triceps"],
  Legs: ["quadriceps", "hamstring", "adductor"],
  Glutes: ["gluteal"],
  Core: ["abs", "obliques"],
  Calves: ["calves"],
  Forearms: ["forearm"],
};

// Also try to help map traditional exercise categories if they differ
const standardCategoryMap: Record<string, string[]> = {
  Chest: ["Chest"],
  Back: ["Back"],
  Shoulders: ["Shoulders"],
  Arms: ["Biceps", "Triceps", "Forearms"],
  Legs: ["Legs", "Calves", "Glutes"],
  Core: ["Core"],
  Cardio: [],
};

function resolveMuscleGroups(
  exerciseName?: string | null,
  category?: string | null,
  customTargetMuscles?: string[] | null,
): string[] {
  if (customTargetMuscles && customTargetMuscles.length > 0) {
    return customTargetMuscles;
  }

  if (category) {
    const matched = standardCategoryMap[category];
    if (matched) return matched;
    // Direct match
    if (categoryToMusclesMap[category]) return [category];
  }

  // Fallback heuristic by name
  const name = (exerciseName || "").toLowerCase();

  // Specific checks first
  if (
    name.includes("squat") ||
    (name.includes("press") && name.includes("leg"))
  )
    return ["Legs", "Glutes"];
  if (
    name.includes("deadlift") ||
    name.includes("row") ||
    name.includes("pull up") ||
    name.includes("pulldown") ||
    name.includes("pull-up")
  )
    return ["Back"];
  if (name.includes("curl") && !name.includes("leg")) return ["Biceps"];
  if (
    name.includes("extension") ||
    name.includes("tricep") ||
    name.includes("pushdown") ||
    name.includes("skullcrusher")
  )
    return ["Triceps"];
  if (
    name.includes("crunch") ||
    name.includes("plank") ||
    name.includes("sit up")
  )
    return ["Core"];
  if (name.includes("calf") || name.includes("calves")) return ["Calves"];
  if (name.includes("forearm") || name.includes("wrist")) return ["Forearms"];
  if (
    name.includes("lateral") ||
    name.includes("raise") ||
    name.includes("shoulder") ||
    name.includes("military") ||
    name.includes("overhead")
  )
    return ["Shoulders"];

  // Broader chest checking (after we've ruled out overhead/shoulder/leg presses)
  if (
    name.includes("chest") ||
    name.includes("bench") ||
    name.includes("fly") ||
    name.includes("push up") ||
    name.includes("pec") ||
    name.includes("press")
  )
    return ["Chest"];

  return [];
}

export async function getWeeklyVolumeAnalytics() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });

  const sets = await prisma.setLog.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: start, lte: end },
      isWarmup: false,
    },
    include: {
      exercise: true,
      customExercise: true,
    },
  });

  const volumeMap: Record<string, number> = {};

  sets.forEach((set) => {
    const muscles = resolveMuscleGroups(
      set.customExercise?.name || set.exercise?.name,
      set.customExercise?.category || set.exercise?.category,
      set.customExercise?.targetMuscles,
    );

    // For "volume" calculating sets count vs total weight lifted x reps. Let's do simply count of SETS for "volume per muscle group". In many tracker apps this means 'Sets' is easiest to interpret. Let's do Sets count.
    const setVolume = 1;

    muscles.forEach((m) => {
      // Split volume or attribute fully? Let's attribute fully, user did 1 set that targeted back and biceps -> 1 set back, 1 set biceps
      if (!volumeMap[m]) volumeMap[m] = 0;
      volumeMap[m] += setVolume;
    });
  });

  return Object.entries(volumeMap)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
}

export async function getMuscleFatigue() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const cutoff = subDays(new Date(), 5);

  const recentSets = await prisma.setLog.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: cutoff },
      isWarmup: false,
    },
    include: {
      exercise: true,
      customExercise: true,
    },
  });

  const loadPerMuscleTracker: Record<string, number> = {};

  recentSets.forEach((set) => {
    const muscles = resolveMuscleGroups(
      set.customExercise?.name || set.exercise?.name,
      set.customExercise?.category || set.exercise?.category,
      set.customExercise?.targetMuscles,
    );

    const daysAgo =
      (new Date().getTime() - new Date(set.createdAt).getTime()) /
      (1000 * 3600 * 24);
    const weightDecay = Math.max(0, 5 - daysAgo) / 5;

    // We'll calculate a "fatigue score" by roughly how many sets they did * decay. Let's say 12 sets = very fatigued.
    // 5 sets = decently fatigued.
    const load = 1 * weightDecay;

    muscles.forEach((m) => {
      const specificMuscles = categoryToMusclesMap[m] || [m.toLowerCase()];
      specificMuscles.forEach((sm) => {
        if (!loadPerMuscleTracker[sm]) loadPerMuscleTracker[sm] = 0;
        loadPerMuscleTracker[sm] += load;
      });
    });
  });

  return loadPerMuscleTracker;
}
