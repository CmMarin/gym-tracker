"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import ActiveWorkout from "./ActiveWorkout";
import { Dumbbell, Calendar, Play, UploadCloud } from "lucide-react";
import { startOrResumeWorkout } from "@/app/actions/active-workout-actions";
import Link from "next/link";

type Exercise = { id: string; name: string; targetSets: number; targetReps: number; };
type Plan = { id: string; name: string; dayOfWeek: number | null; exercises: Exercise[] };

export default function WorkoutSelector({
  plans,
  existingActiveWorkout
}: {
  plans: Plan[],
  existingActiveWorkout?: any
}) {
  const [activeState, setActiveState] = useState<any>(existingActiveWorkout || null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleStart = async (plan: Plan) => {
    setLoadingPlan(plan.id);
    try {
      const res = await startOrResumeWorkout(plan.id);
      if (res.success && res.activeWorkout) {
        setActiveState(res.activeWorkout);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingPlan(null);
  };

  if (activeState) {
    const planName = plans.find(p => p.id === activeState.workoutPlanId)?.name || "Workout";
    return <ActiveWorkout planName={planName} initialState={activeState.state} />;
  }

  return (
    <div className="p-6 pb-32 max-w-lg mx-auto">
      <h1 className="text-3xl font-black text-slate-800 mb-2">Start a Workout</h1>
      <p className="text-slate-500 font-medium mb-8">Select a routine for today.</p>

      {plans.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 border-2 border-indigo-100 shadow-[0_8px_0_theme(colors.indigo.100)] text-center flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <UploadCloud className="text-indigo-400" size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">No Routines Yet!</h2>
          <p className="text-slate-500 mb-8 max-w-[250px] leading-relaxed font-medium">
            You don't have any saved workouts. Head over to your profile to generate a routine from a PDF!
          </p>
          <Link 
            href="/profile"
            className="bg-indigo-500 hover:bg-indigo-600 active:translate-y-1 active:shadow-none text-white font-bold py-4 px-8 rounded-2xl shadow-[0_4px_0_theme(colors.indigo.600)] transition-all w-full flex items-center justify-center gap-2"
          >
            Go to Profile
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-[0_4px_0_theme(colors.gray.200)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                  {plan.dayOfWeek && (
                    <span className="flex items-center text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-lg shrink-0">
                      <Calendar size={14} className="mr-1" />
                      Day {plan.dayOfWeek}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 font-medium text-sm">{plan.exercises.length} exercises</p>
              </div>

              <button
                onClick={() => handleStart(plan)}
                disabled={loadingPlan !== null}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-2xl shadow-[0_4px_0_theme(colors.green.600)] transition-all w-full sm:w-auto text-center shrink-0 flex justify-center items-center gap-2"
              >
                {loadingPlan === plan.id ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Play fill="white" size={16} /> START
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
