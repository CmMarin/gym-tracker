import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";
import ProfileAvatar from "@/components/ProfileAvatar";
import UploadPdfWidget from "@/components/UploadPdfWidget";
import CustomExercisesWidget from "@/components/CustomExercisesWidget";
import TrophyCaseWidget from "@/components/TrophyCaseWidget";
import MuscleHeatmapWidget from "@/components/MuscleHeatmapWidget";
import IronGridCalendar from "@/components/IronGridCalendar";
import { getMuscleFatigue, getIronGridData } from "@/app/actions/analytics-actions";
import { syncUserAchievements } from "@/app/actions/achievement-actions";

export default async function ProfilePage() {
  await syncUserAchievements();
  
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const username = session.user.name as string;

  const [user, fatigueData, ironGridData] = await Promise.all([
    prisma.user.findUnique({
      where: { username },
      include: {
        workoutPlans: {
          include: {
            planExercises: {
              include: { exercise: true, customExercise: true }
            }
          }
        },
        achievements: {
          orderBy: { achievedAt: 'desc' }
        }
      }
    }),
    getMuscleFatigue(),
    getIronGridData()
  ]);

  if (!user) {
    redirect("/login");
  }

  const mappedWorkoutPlans = user.workoutPlans.map(p => ({
    id: p.id,
    name: p.name,
    dayOfWeek: p.dayOfWeek,
    exercises: p.planExercises.map(px => {
       const exercise = px.exercise || px.customExercise;
       return {
         id: exercise?.id || "",
         name: exercise?.name || "Unknown Exercise",
         targetSets: px.targetSets,
         targetReps: px.targetReps,
         exerciseId: px.exerciseId,
         customExerciseId: px.customExerciseId,
         isCustom: !!px.customExerciseId
       };
    })
  }));

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="bg-[var(--color-white)] pt-12 pb-8 px-4 rounded-b-[3rem] shadow-[0_4px_0_var(--color-theme-shadow)] mb-6 flex flex-col items-center border-b-2 border-indigo-50">
        <div className="mb-4">
          <ProfileAvatar
             currentImage={user.image}
             username={user.username}
          />
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">{user.username}</h1>
        <p className="text-slate-500 font-bold">Lvl {Math.floor(user.xp / 1000) + 1} Titan</p>
      </div>

      <div className="container mx-auto px-4 w-full max-w-md">
        <div className="flex flex-col gap-4">

            <TrophyCaseWidget userAchievements={user.achievements} />
            <IronGridCalendar data={ironGridData} />
          <MuscleHeatmapWidget fatigueData={fatigueData} />
          <CustomExercisesWidget />
          <ProfileClient savedWorkouts={mappedWorkoutPlans} />

          <UploadPdfWidget />
        </div>
      </div>
    </div>
  );
}
