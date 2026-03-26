"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Trophy } from "lucide-react";
import { finishWorkoutAction } from "@/app/actions/workout-actions";
import { updateWorkoutState, cancelActiveWorkout } from "@/app/actions/active-workout-actions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAppSounds } from "@/hooks/useAppSounds";

export default function ActiveWorkout({ 
  planName, 
  initialState
}: { 
  planName: string,
  initialState: any
}) {
  const router = useRouter();
  const { playBuzzer, playDing, playPop } = useAppSounds();
  const [workoutState, setWorkoutState] = useState(initialState);
  const [showMilestone, setShowMilestone] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const { currentExerciseIndex, exercises } = workoutState;
  const currentExercise = exercises[currentExerciseIndex];

  // Find the first uncompleted set
  const currentSetIndex = currentExercise?.sets.findIndex((s: any) => !s.completed) ?? 0;

  if (!exercises || exercises.length === 0) return <div>No exercises.</div>;

  const totalSets = exercises.reduce((acc: number, ex: any) => acc + ex.sets.length, 0);
  const completedSets = exercises.reduce((acc: number, ex: any) => acc + ex.sets.filter((s: any) => s.completed).length, 0);
  const progressPercent = (completedSets / (totalSets || 1)) * 100;

  const handleUpdateSet = (field: string, value: string) => {
    if (currentSetIndex === -1) return;
    const newState = { ...workoutState };
    newState.exercises[currentExerciseIndex].sets[currentSetIndex][field] = value;
    setWorkoutState(newState);
  };

  const handleCompleteSet = async () => {
    if (currentSetIndex === -1) return;
    
    const newState = { ...workoutState };
    const set = newState.exercises[currentExerciseIndex].sets[currentSetIndex];
    if (!set.reps || !set.weight) {
      playBuzzer();
      toast.error("Enter weight and reps!");
      return;
    }

    set.completed = true;

    // Advance Logic
    const nextSetIndex = newState.exercises[currentExerciseIndex].sets.findIndex((s: any) => !s.completed);

    if (nextSetIndex === -1) {
      playDing();
      if (currentExerciseIndex < exercises.length - 1) {
        newState.currentExerciseIndex += 1;
      }
    } else {
      playPop();
    }

    setWorkoutState(newState);

    // Save to DB in background
    updateWorkoutState(newState).catch(console.error);

    if (newState.currentExerciseIndex === exercises.length - 1 && 
        newState.exercises[newState.currentExerciseIndex].sets.findIndex((s: any) => !s.completed) === -1) {
      
      setIsFinishing(true);
      try {
        const result = await finishWorkoutAction(newState);
        setSummary(result);
        window.dispatchEvent(new CustomEvent("user-stats-updated"));
        setShowMilestone(true);
      } catch (e) {
        console.error(e);
      } finally {
        setIsFinishing(false);
      }
    }
  };

  const currentSet = currentSetIndex !== -1 && currentExercise ? currentExercise.sets[currentSetIndex] : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6 items-center">
      <div className="w-full max-w-md flex items-center justify-between mb-8">
        <h1 className="font-bold text-2xl text-slate-800">{planName}</h1>
        <button 
           onClick={async () => {
             await cancelActiveWorkout();
             window.location.href = "/workout";
           }}
           className="text-sm font-bold text-red-500 bg-red-100 px-3 py-1 rounded-xl">
          End Workout
        </button>
      </div>

      <div className="w-full max-w-md h-6 bg-gray-200 rounded-full mb-10 overflow-hidden border-2 border-gray-100 shadow-inner">
        <motion.div
          className="h-full bg-green-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: "spring", stiffness: 50 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!showMilestone ? (
          <motion.div
            key={currentExercise?.id + "-" + currentSetIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-md border-b-4 border-gray-200 flex flex-col items-center"
          >
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2 text-center">{currentExercise?.name}</h2>
            <p className="text-slate-500 font-medium mb-8">
              {currentSetIndex !== -1 ? `Set ${currentSetIndex + 1} of ${currentExercise?.targetSets}` : 'All sets done!'}
            </p>

            {currentSetIndex !== -1 && (
            <div className="w-full flex gap-4 mb-8">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-400 uppercase mb-2 text-center">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={currentSet?.weight || ""}
                  onChange={(e) => handleUpdateSet("weight", e.target.value)}
                  className="w-full text-center text-4xl font-black text-slate-700 bg-gray-100 rounded-2xl py-4 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-400 uppercase mb-2 text-center">Reps</label>
                <input
                  type="number"
                  placeholder={currentExercise?.targetReps?.toString() || "0"}
                  value={currentSet?.reps || ""}
                  onChange={(e) => handleUpdateSet("reps", e.target.value)}
                  className="w-full text-center text-4xl font-black text-slate-700 bg-gray-100 rounded-2xl py-4 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all"
                />
              </div>
            </div>
            )}

            <button
              onClick={handleCompleteSet}
              disabled={isFinishing || currentSetIndex === -1}
              className={`w-full ${isFinishing ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-400"} text-white font-black text-xl py-5 rounded-2xl shadow-[0_6px_0_0_#2563eb] active:shadow-[0_0px_0_0_#2563eb] active:translate-y-[6px] transition-all flex justify-center items-center space-x-2`}
            >
              {isFinishing ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 size={28} />
                  <span>{currentSetIndex !== -1 ? "COMPLETE SET" : "EXERCISE DONE"}</span>
                </>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-green-500 p-8 rounded-[2rem] shadow-2xl w-full max-w-md text-center text-white border-b-8 border-green-700 mt-10"
          >
            <Trophy size={80} className="mx-auto mb-6 text-yellow-300 drop-shadow-lg" />
            <h2 className="text-4xl font-black mb-4">Workout Complete!</h2>
            <div className="bg-green-600 rounded-2xl p-4 mb-6 text-left space-y-2">
              <p className="font-bold text-green-100">Total XP: <span className="text-white">+{summary?.xpEarned || 0}</span></p>
              {summary?.prs && summary.prs.length > 0 && (
                <div className="pt-2 border-t border-green-500 text-sm">
                  <p className="font-bold text-yellow-300 mb-1">?? New PRs!</p>
                  <ul className="list-disc pl-4 text-green-100">
                    {summary.prs.map((pr: string, idx: number) => (
                      <li key={idx}>{pr}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-white text-green-600 font-black text-xl w-full py-4 rounded-2xl shadow-[0_6px_0_0_#dcfce7] active:translate-y-[6px] active:shadow-none transition-all"
            >
              CONTINUE TO DASHBOARD
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
