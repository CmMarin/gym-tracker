'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getExerciseHistory() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const setLogs = await prisma.setLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      weight: true,
      reps: true,
      createdAt: true,
      exercise: { select: { name: true } },
      customExercise: { select: { name: true } }
    }
  });

  const historyMap = new Map<string, {
    name: string,
    pr: number,
    lastWeight: number,
    lastReps: number,
    lastDate: Date
  }>();

  for (const log of setLogs) {
    if (log.weight === null || log.reps === null) continue;
    const name = log.exercise?.name || log.customExercise?.name || "Unknown Exercise";
    
    if (!historyMap.has(name)) {
      historyMap.set(name, {
        name,
        pr: log.weight,
        lastWeight: log.weight,
        lastReps: log.reps,
        lastDate: log.createdAt
      });
    } else {
      const existing = historyMap.get(name)!;
      if (log.weight > existing.pr) {
        existing.pr = log.weight;
      }
    }
  }

  return Array.from(historyMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}
