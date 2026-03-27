import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";
import ProfileAvatar from "@/components/ProfileAvatar";
import UploadPdfWidget from "@/components/UploadPdfWidget";
import CustomExercisesWidget from "@/components/CustomExercisesWidget";
import AchievementItem from "@/components/AchievementItem";
import MuscleHeatmapWidget from "@/components/MuscleHeatmapWidget";
import { getMuscleFatigue } from "@/app/actions/analytics-actions";
import { Trophy } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const username = session.user.name as string;

  const [user, fatigueData] = await Promise.all([
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
    getMuscleFatigue()
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
         targetReps: px.targetReps
       };
    })
  }));

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="bg-white pt-12 pb-8 px-4 rounded-b-[3rem] shadow-[0_4px_0_theme(colors.gray.200)] mb-6 flex flex-col items-center border-b-2 border-gray-100">
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

          {/* Achievements Section */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_0_theme(colors.gray.200)] border-2 border-gray-100 mb-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-xl">
                <Trophy size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Achievements</h2>
            </div>

            {user.achievements.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {user.achievements.map((ach) => (
                  <AchievementItem 
                    key={ach.id} 
                    type={ach.type} 
                    achievedAt={ach.achievedAt} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-slate-400 font-bold text-sm">No achievements yet. Keep training!</p>
              </div>
            )}
          </div>

          <MuscleHeatmapWidget fatigueData={fatigueData} />
          <CustomExercisesWidget />
          <ProfileClient savedWorkouts={mappedWorkoutPlans} />

          <UploadPdfWidget />
        </div>
      </div>
    </div>
  );
}
