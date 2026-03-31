"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Trophy,
  Timer,
  Calculator,
  Flame,
  X,
} from "lucide-react";
import { finishWorkoutAction } from "@/app/actions/workout-actions";
import {
  updateWorkoutState,
  cancelActiveWorkout,
} from "@/app/actions/active-workout-actions";
import { updateCoopStatus } from "@/app/actions/coop-actions";
import toast from "react-hot-toast";
import { useAppSounds } from "@/hooks/useAppSounds";
import CoopPanel from "./CoopPanel";
import CoopWorkoutReview from "./CoopWorkoutReview";

const BARBELL_WEIGHT = 20;
const AVAILABLE_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

export default function ActiveWorkout({
  planName,
  initialState,
}: {
  planName: string;
  initialState: any;
}) {
  const { playBuzzer, playDing, playPop } = useAppSounds();
  const [workoutState, setWorkoutState] = useState(initialState);
  const [showMilestone, setShowMilestone] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);
  const [showPlateCalc, setShowPlateCalc] = useState(false);

  const { currentExerciseIndex, exercises, coopSessionId } = workoutState;
  const currentExercise = exercises[currentExerciseIndex];

  // Find the first uncompleted set
  const currentSetIndex =
    currentExercise?.sets.findIndex((s: any) => !s.completed) ?? 0;

  useEffect(() => {
    if (restTimeLeft !== null && restTimeLeft > 0) {
      if (coopSessionId && currentExercise)
        updateCoopStatus(coopSessionId, "RESTING", currentExercise.name);
      const interval = setInterval(
        () => setRestTimeLeft((prev) => prev! - 1),
        1000,
      );
      return () => clearInterval(interval);
    } else if (restTimeLeft === 0) {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(500);
      }
      playDing();
      toast.success("Rest is over, time to lift!");
      setRestTimeLeft(null);
      if (coopSessionId && currentExercise)
        updateCoopStatus(coopSessionId, "LIFTING", currentExercise.name);
    }
  }, [restTimeLeft, playDing, coopSessionId, currentExercise]);

  if (!exercises || exercises.length === 0) return <div>No exercises.</div>;

  const totalSets = exercises.reduce(
    (acc: number, ex: any) => acc + ex.sets.length,
    0,
  );
  const completedSets = exercises.reduce(
    (acc: number, ex: any) =>
      acc + ex.sets.filter((s: any) => s.completed).length,
    0,
  );
  const progressPercent = (completedSets / (totalSets || 1)) * 100;

  const handleUpdateSet = (field: string, value: string | boolean | number) => {
    if (currentSetIndex === -1) return;
    const newState = { ...workoutState };
    newState.exercises[currentExerciseIndex].sets[currentSetIndex][field] =
      value;
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
    const nextSetIndex = newState.exercises[
      currentExerciseIndex
    ].sets.findIndex((s: any) => !s.completed);

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

    // Co-Op Sync
    if (coopSessionId) {
      updateCoopStatus(coopSessionId, "LIFTING", currentExercise.name, 15);
      toast.success("+15 Team XP", { icon: "🔥", position: "top-center" });
    }

    const isWorkoutFinished =
      newState.currentExerciseIndex === exercises.length - 1 &&
      newState.exercises[newState.currentExerciseIndex].sets.findIndex(
        (s: any) => !s.completed,
      ) === -1;

    if (isWorkoutFinished) {
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
    } else {
      setRestTimeLeft(set.isWarmup ? 30 : 90);
    }
  };

  const calculatePlates = (weight: number) => {
    let remaining = (weight - BARBELL_WEIGHT) / 2;
    if (remaining <= 0) return "Bar empty";
    const plates: string[] = [];
    AVAILABLE_PLATES.forEach((plate) => {
      let count = 0;
      while (remaining >= plate) {
        count++;
        remaining -= plate;
      }
      if (count > 0) plates.push(`${count}x${plate}kg`);
    });
    return plates.join(", ");
  };

  const currentSet =
    currentSetIndex !== -1 && currentExercise
      ? currentExercise.sets[currentSetIndex]
      : null;

  if (showCancelConfirm) {
    return (
      <div className="min-h-full flex flex-col items-center justify-start pt-20 p-4">
        <div className="bg-[var(--color-white)] rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_4px_0_var(--color-theme-shadow)] border-2 border-[var(--color-indigo-50)]">
          <h2 className="text-2xl font-black text-[var(--color-slate-800)] mb-4">
            End Workout?
          </h2>
          <p className="text-[var(--color-slate-500)] mb-8 font-medium">
            Are you sure you want to end this workout without finishing it?
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={async () => {
                await cancelActiveWorkout();
                window.location.href = "/workout";
              }}
              className="w-full py-4 bg-[var(--color-rose-500)] text-[var(--color-white)] rounded-xl font-bold shadow-[0_4px_0_var(--color-button-shadow)] active:translate-y-1 active:shadow-none hover:bg-[var(--color-rose-600)] transition-all"
            >
              Yes, End Workout
            </button>
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="w-full py-4 bg-[var(--color-gray-100)] text-[var(--color-slate-700)] rounded-xl font-bold border-2 border-[var(--color-gray-200)] hover:bg-[var(--color-gray-200)] transition-colors"
            >
              Resume Workout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full h-full bg-transparent flex flex-col p-6 items-center relative">
      <div className="w-full max-w-md flex justify-center items-center mb-8 relative">
        <h1 className="font-bold text-2xl text-[var(--color-slate-800)] text-center px-16">
          {planName}
        </h1>
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--color-slate-500)] hover:text-[var(--color-rose-500)] p-3 bg-[var(--color-gray-100)] rounded-xl hover:scale-110 transition-all border border-[var(--color-gray-200)] shadow-[0_4px_0_var(--color-button-shadow)]"
        >
          <X size={24} />
        </button>
      </div>
      {coopSessionId && (
        <CoopPanel
          sessionId={coopSessionId}
          currentExercise={currentExercise?.name}
        />
      )}
      <div className="w-full max-w-md h-6 bg-gray-200 rounded-full mb-10 overflow-hidden border-2 border-indigo-50 shadow-inner">
        <motion.div
          className="h-full bg-green-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: "spring", stiffness: 50 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {showMilestone ? (
          coopSessionId ? (
            <CoopWorkoutReview sessionId={coopSessionId} />
          ) : (
            <motion.div
              key="milestone"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-green-500 p-8 rounded-[2rem] shadow-2xl w-full max-w-md text-center text-[var(--color-white)] border-b-8 border-green-700 mt-10"
            >
              <Trophy
                size={80}
                className="mx-auto mb-6 text-[var(--color-white)] drop-shadow-lg"
              />
              <h2 className="text-4xl font-black mb-4">Workout Complete!</h2>
              <div className="bg-green-600 rounded-2xl p-4 mb-6 text-left space-y-2">
                <p className="font-bold text-green-100">
                  Total XP:{" "}
                  <span className="text-[var(--color-white)]">
                    +{summary?.xpEarned || 0}
                  </span>
                </p>
                {summary?.prs && summary.prs.length > 0 && (
                  <div className="pt-2 border-t border-green-500 text-sm">
                    <p className="font-bold text-[var(--color-white)] mb-1">
                      🔥 New PRs!
                    </p>
                    <ul className="list-disc pl-4 text-green-100">
                      {summary.prs.map((pr: string, idx: number) => (
                        <li key={idx}>{pr}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="bg-[var(--color-white)] text-green-600 font-black text-xl w-full py-4 rounded-2xl shadow-[0_6px_0_0_#dcfce7] active:translate-y-[6px] active:shadow-none transition-all"
              >
                CONTINUE TO DASHBOARD
              </button>
            </motion.div>
          )
        ) : restTimeLeft !== null && restTimeLeft > 0 ? (
          <motion.div
            key="rest-timer-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[var(--color-white)] p-8 rounded-[2rem] shadow-xl w-full max-w-md border-b-4 border-gray-200 flex flex-col items-center"
          >
            <Timer size={64} className="text-indigo-500 mb-6" />
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2 text-center">
              Rest Timer
            </h2>
            <div className="text-7xl font-black text-slate-700 mb-10 tabular-nums tracking-tighter">
              {Math.floor(restTimeLeft / 60)}:
              {(restTimeLeft % 60).toString().padStart(2, "0")}
            </div>

            <div className="flex w-full gap-4">
              <button
                onClick={() => setRestTimeLeft((prev) => (prev || 0) + 10)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold text-xl py-5 rounded-2xl transition-all"
              >
                +10s
              </button>
              <button
                onClick={() => setRestTimeLeft(0)}
                className="flex-[2] bg-indigo-500 hover:bg-indigo-400 text-[var(--color-white)] font-black text-xl py-5 rounded-2xl shadow-[0_6px_0_0_var(--color-indigo-600)] active:translate-y-[6px] active:shadow-none transition-all flex justify-center items-center gap-2"
              >
                <span>SKIP REST</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={currentExercise?.id + "-" + currentSetIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-[var(--color-white)] p-8 rounded-[2rem] shadow-xl w-full max-w-md border-b-4 border-gray-200 flex flex-col items-center"
          >
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2 text-center">
              {currentExercise?.name}
            </h2>

            <div className="flex flex-col items-center justify-center gap-3 mb-8 w-full">
              <p className="text-slate-500 font-medium">
                {currentSetIndex !== -1
                  ? `Set ${currentSetIndex + 1} of ${currentExercise?.targetSets}`
                  : "All sets done!"}
              </p>
              {currentSetIndex !== -1 && (
                <button
                  onClick={() =>
                    handleUpdateSet("isWarmup", !currentSet?.isWarmup)
                  }
                  className={`flex items-center justify-center gap-1 px-3 py-1.5 w-full max-w-[200px] rounded-full text-sm font-bold transition-all ${currentSet?.isWarmup ? "bg-orange-100 text-orange-600 border-2 border-orange-200" : "bg-gray-100 text-gray-400 border-2 border-transparent hover:bg-gray-200"}`}
                >
                  <Flame
                    size={16}
                    className={
                      currentSet?.isWarmup ? "text-orange-500" : "text-gray-400"
                    }
                  />
                  Mark as Warm-up
                </button>
              )}
            </div>

            {currentSetIndex !== -1 && (
              <div className="w-full flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <label className="flex items-center justify-center gap-1 text-sm font-bold text-slate-400 uppercase mb-2 text-center">
                    Weight (kg)
                    <button
                      onClick={() => setShowPlateCalc(!showPlateCalc)}
                      className="text-indigo-400 hover:text-indigo-600 transition-colors bg-indigo-50 p-1 rounded-md"
                      title="Calculate Plates"
                    >
                      <Calculator size={14} />
                    </button>
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentSet?.weight || ""}
                    onChange={(e) => handleUpdateSet("weight", e.target.value)}
                    className="w-full text-center text-4xl font-black text-slate-700 bg-gray-100 rounded-2xl py-4 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition-all"
                  />
                  <AnimatePresence>
                    {showPlateCalc && currentSet?.weight && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 w-full bg-[var(--color-indigo-600)] text-[var(--color-white)] text-xs p-3 rounded-xl text-center z-10 shadow-lg border border-[var(--color-indigo-700)] pointer-events-none"
                      >
                        <p className="text-[var(--color-indigo-100)] font-medium mb-1">
                          Plates/side (20kg bar)
                        </p>
                        <span className="font-bold text-[var(--color-white)] text-sm">
                          {calculatePlates(Number(currentSet.weight))}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-400 uppercase mb-2 text-center">
                    Reps
                  </label>
                  <input
                    type="number"
                    placeholder={currentExercise?.targetReps?.toString() || "0"}
                    value={currentSet?.reps || ""}
                    onChange={(e) => handleUpdateSet("reps", e.target.value)}
                    className="w-full text-center text-4xl font-black text-slate-700 bg-gray-100 rounded-2xl py-4 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition-all"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleCompleteSet}
              disabled={isFinishing || currentSetIndex === -1}
              className={`w-full ${isFinishing ? "bg-indigo-300" : "bg-indigo-500 hover:bg-indigo-400"} text-[var(--color-white)] font-black text-xl py-5 rounded-2xl shadow-[0_6px_0_0_var(--color-indigo-600)] active:shadow-[0_0px_0_0_var(--color-indigo-600)] active:translate-y-[6px] transition-all flex justify-center items-center space-x-2`}
            >
              {isFinishing ? (
                <div className="w-6 h-6 border-4 border-[var(--color-white)] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 size={28} />
                  <span>
                    {currentSetIndex !== -1 ? "COMPLETE SET" : "EXERCISE DONE"}
                  </span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
