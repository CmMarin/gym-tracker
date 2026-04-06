import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BodyWeightTracker from "@/components/BodyWeightTracker";
import ExerciseTiers from "@/components/ExerciseTiers";
import VolumeTracker from "@/components/VolumeTracker";
import WeeklyVolumeWidget from "@/components/WeeklyVolumeWidget";
import OneRepMaxWidget from "@/components/OneRepMaxWidget";
import { format } from "date-fns";
import { getWeeklyVolumeAnalytics } from "@/app/actions/analytics-actions";
import ExerciseHistoryWidget from "@/components/ExerciseHistoryWidget";

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Execute queries sequentially to prevent connection pool exhaustion
  const bodyWeightLogs = await prisma.bodyWeightLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: { weight: true, createdAt: true }
  });

  const setLogs = await prisma.setLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      weight: true,
      reps: true,
      createdAt: true,
      exercise: { select: { name: true } },
      customExercise: { select: { name: true } }
    }
  });

  const weeklyVolumeData = await getWeeklyVolumeAnalytics();

  // 1. Body weight data
  const weightData = bodyWeightLogs.map(bw => ({
    weight: bw.weight,
    date: new Date(bw.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  // 2. Personal Records
  const prs = new Map<string, number>();
  setLogs.forEach(log => {
    if (log.weight) {
      const exerciseName = log.exercise?.name || log.customExercise?.name || "Unknown Exercise";
      const currentPr = prs.get(exerciseName) || 0;
      if (log.weight > currentPr) prs.set(exerciseName, log.weight);
    }
  });

  // Convert to array and take top 5
  const prList = Array.from(prs.entries()).map(([name, maxWeight]) => ({ name, maxWeight })).slice(0, 5);

  // 3. Volume Data (Grouped by date)
  const volumeByDate = new Map<string, number>();

  // To keep dates in chronological order, we can reverse the setLogs or sort Map entries at the end.
  const logsAsc = [...setLogs].reverse();
  logsAsc.forEach(log => {
    if (log.weight && log.reps) {
      // Use the session completetion time or just set log creation
      const dateStr = format(new Date(log.createdAt), 'MMM d');
      const volume = log.weight * log.reps;
      const currentVolume = volumeByDate.get(dateStr) || 0;
      volumeByDate.set(dateStr, currentVolume + volume);
    }
  });

  const volumeData = Array.from(volumeByDate.entries()).map(([date, volume]) => ({
    date,
    volume: Math.round(volume)
  }));

  // 4. One Rep Max Data (1RM)
  // Target specifically major compound movements if present, or fallback to the top lifts
  const oneRMByExerciseAndDate = new Map<string, Map<string, number>>();

  logsAsc.forEach(log => {
      if (log.weight && log.reps) {
          const exerciseName = log.exercise?.name || log.customExercise?.name || "Unknown Exercise";
          const dateStr = format(new Date(log.createdAt), 'MMM d');
          
          // Epley Formula: 1RM = Weight * (1 + 0.0333 * Reps)
          const oneRepMax = log.weight * (1 + 0.0333 * log.reps);
          
          if (!oneRMByExerciseAndDate.has(exerciseName)) {
              oneRMByExerciseAndDate.set(exerciseName, new Map());
          }
          
          const dateMap = oneRMByExerciseAndDate.get(exerciseName)!;
          const currentMaxForDate = dateMap.get(dateStr) || 0;
          
          if (oneRepMax > currentMaxForDate) {
              dateMap.set(dateStr, oneRepMax);
          }
      }
  });

  // Convert to structured array, filtering for compound lifts or taking the top trackable exercises
  const targetLifts = ["Bench Press", "Squat", "Deadlift", "Barbell Row", "Overhead Press"];
  let oneRMData = Array.from(oneRMByExerciseAndDate.entries())
      .map(([exercise, dateMap]) => ({
          exercise,
          data: Array.from(dateMap.entries()).map(([date, oneRM]) => ({ date, oneRM: Math.round(oneRM) }))
      }))
      .filter(entry => entry.data.length >= 1); // Allow even a single data point

  // If we have "core" lifts, prioritize them
  const coreRMData = oneRMData.filter(d => targetLifts.some(tl => d.exercise.toLowerCase().includes(tl.toLowerCase())));
  if (coreRMData.length > 0) {
      oneRMData = coreRMData;
  } else {
      // Otherwise just show the top trackable ones
      oneRMData = oneRMData.sort((a, b) => b.data.length - a.data.length).slice(0, 5);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="bg-[var(--color-white)] pt-12 pb-8 px-4 rounded-b-[3rem] shadow-[0_4px_0_var(--color-theme-shadow)] mb-6 text-center border-b-2 border-indigo-50">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Progress</h1>
        <p className="text-slate-500 font-medium mt-2">Track your gains over time</p>
      </div>

      <div className="container mx-auto px-4 w-full max-w-md">
        <div className="flex flex-col gap-6">
          <ExerciseHistoryWidget />
          <OneRepMaxWidget compoundData={oneRMData} />
          <VolumeTracker data={volumeData} />
          <WeeklyVolumeWidget initData={weeklyVolumeData} />
          <BodyWeightTracker data={weightData} />
          <ExerciseTiers prs={prList} />
        </div>
      </div>
    </div>
  );
}
