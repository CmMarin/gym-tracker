"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

type WorkoutTimelineProps = {
  exercises: any[];
  currentExerciseIndex: number;
  showMilestone: boolean;
  currentSet?: any;
  previousWorkingSets: number;
  totalWorkingSets: number;
  setShowTimeline: (show: boolean) => void;
};

export default function WorkoutTimeline({
  exercises,
  currentExerciseIndex,
  showMilestone,
  currentSet,
  previousWorkingSets,
  totalWorkingSets,
  setShowTimeline,
}: WorkoutTimelineProps) {
  return (
    <motion.div
      key="timeline"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md bg-[var(--color-white)] rounded-[2rem] p-6 shadow-xl border-b-4 border-gray-200 mb-20 overflow-y-auto max-h-[70vh]"
    >
      <h2 className="text-xl font-bold text-[var(--color-slate-800)] mb-6 flex items-center justify-between">
        Workout Timeline
        <div className="text-sm font-normal text-slate-500 bg-gray-100 px-3 py-1 rounded-full">
          {exercises.length} Exercises
        </div>
      </h2>
      <div className="space-y-4">
        {exercises.map((ex: any, exIdx: number) => {
          const isCurrent = exIdx === currentExerciseIndex;
          const isCompleted = exIdx < currentExerciseIndex || showMilestone;
          return (
            <div key={ex.id} className="flex gap-4 items-start">
              <div className="flex flex-col items-center mt-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                    isCompleted
                      ? "bg-green-500 text-[var(--color-white)]"
                      : isCurrent
                        ? "bg-[var(--color-indigo-500)] text-[var(--color-white)] ring-4 ring-indigo-100"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? <Check size={16} /> : exIdx + 1}
                </div>
                {exIdx < exercises.length - 1 && (
                  <div
                    className={`w-1 h-12 mt-2 rounded-full ${
                      isCompleted ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
              <div
                className={`flex-1 pb-4 ${
                  isCompleted ? "opacity-50" : "opacity-100"
                }`}
              >
                <h3
                  className={`font-bold text-lg leading-tight mb-1 ${
                    isCompleted ? "text-[var(--color-indigo-600)]" : "text-slate-700"
                  }`}
                >
                  {ex.name}
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  {ex.sets.length} sets planned
                </p>
                {currentExerciseIndex === exIdx && !showMilestone && (
                  <div className="mt-3 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-2 rounded-lg inline-block border border-indigo-100">
                    Current Exercise &bull; {
                    currentSet?.isWarmup
                      ? "Warm-up"
                      : `Set ${previousWorkingSets + 1} / ${totalWorkingSets}`
                    }
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={() => setShowTimeline(false)}
        className="mt-6 w-full bg-[var(--color-indigo-500)] hover:bg-[var(--color-indigo-400)] text-[var(--color-white)] shadow-[0_4px_0_0_var(--color-indigo-600)] active:translate-y-[4px] active:shadow-none font-bold py-4 rounded-xl transition-all"
      >
        RESUME WORKOUT
      </button>
    </motion.div>
  );
}
