import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BodyWeightTracker from "@/components/BodyWeightTracker";
import ExerciseTiers from "@/components/ExerciseTiers";
import VolumeTracker from "@/components/VolumeTracker";
import { format } from "date-fns";

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Execute queries in parallel, fetching ONLY the necessary fields to drastically drop load time
  const [bodyWeightLogs, setLogs] = await Promise.all([
    prisma.bodyWeightLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { weight: true, createdAt: true }
    }),
    prisma.setLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        weight: true,
        reps: true,
        createdAt: true,
        exercise: { select: { name: true } }
      }
    })
  ]);

  // 1. Body weight data
  const weightData = bodyWeightLogs.map(bw => ({
    weight: bw.weight,
    date: new Date(bw.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  // 2. Personal Records
  const prs = new Map<string, number>();
  setLogs.forEach(log => {
    if (log.weight) {
      const currentPr = prs.get(log.exercise.name) || 0;
      if (log.weight > currentPr) prs.set(log.exercise.name, log.weight);
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


  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="bg-white pt-12 pb-8 px-4 rounded-b-[3rem] shadow-[0_4px_0_theme(colors.gray.200)] mb-6 text-center border-b-2 border-gray-100">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Progress</h1>
        <p className="text-slate-500 font-medium mt-2">Track your gains over time</p>
      </div>

      <div className="container mx-auto px-4 w-full max-w-md">
        <div className="flex flex-col gap-6">
          <VolumeTracker data={volumeData} />
          <BodyWeightTracker data={weightData} />
          <ExerciseTiers prs={prList} />
        </div>
      </div>
    </div>
  );
}
