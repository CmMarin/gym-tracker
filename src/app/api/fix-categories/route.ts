import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export async function GET() {
  const exercises = [
    { name: "Barbell Bench Press", category: "Chest" },
    { name: "Incline Barbell Bench Press", category: "Chest" },
    { name: "Dumbbell Bench Press", category: "Chest" },
    { name: "Incline Dumbbell Bench Press", category: "Chest" },
    { name: "Chest Flyes", category: "Chest" },
    { name: "Push-ups", category: "Chest" },
    { name: "Barbell Squat", category: "Legs" },
    { name: "Leg Press", category: "Legs" },
    { name: "Leg Extension", category: "Legs" },
    { name: "Lying Leg Curls", category: "Legs" },
    { name: "Romanian Deadlift", category: "Legs" },
    { name: "Calf Raises", category: "Legs" },
    { name: "Deadlift", category: "Back" },
    { name: "Pull-ups", category: "Back" },
    { name: "Lat Pulldown", category: "Back" },
    { name: "Barbell Row", category: "Back" },
    { name: "Seated Cable Row", category: "Back" },
    { name: "Dumbbell Row", category: "Back" },
    { name: "Overhead Press", category: "Shoulders" },
    { name: "Dumbbell Shoulder Press", category: "Shoulders" },
    { name: "Lateral Raises", category: "Shoulders" },
    { name: "Front Raises", category: "Shoulders" },
    { name: "Barbell Curl", category: "Biceps" },
    { name: "Dumbbell Curl", category: "Biceps" },
    { name: "Hammer Curl", category: "Biceps" },
    { name: "Preacher Curl", category: "Biceps" },
    { name: "Tricep Pushdown", category: "Triceps" },
    { name: "Overhead Tricep Extension", category: "Triceps" },
    { name: "Skullcrushers", category: "Triceps" },
    { name: "Close-Grip Bench Press", category: "Triceps" }
  ];

  let updatedCount = 0;
  for (const ex of exercises) {
    const updated = await prisma.exercise.updateMany({
      where: { name: { contains: ex.name, mode: "insensitive" } },
      data: { category: ex.category }
    });
    updatedCount += updated.count;
  }

  // Find uncategorized
  const uncategorized = await prisma.exercise.findMany({
    where: { category: null }
  });

  return NextResponse.json({ success: true, updatedCount, uncategorized: uncategorized.map(e => e.name) });
}
