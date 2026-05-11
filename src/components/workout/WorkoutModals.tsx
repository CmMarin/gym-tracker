"use client";

import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { cancelActiveWorkout } from "@/app/actions/active-workout-actions";

type WorkoutModalsProps = {
  showSwapModal: boolean;
  setShowSwapModal: (show: boolean) => void;
  showCancelConfirm: boolean;
  setShowCancelConfirm: (show: boolean) => void;
  showSkipConfirm: boolean;
  setShowSkipConfirm: (show: boolean) => void;
  isLoadingAlternatives: boolean;
  alternatives: any[];
  handleSwapExercise: (alt: any) => void;
  handleSkipSet: () => void;
};

export default function WorkoutModals({
  showSwapModal,
  setShowSwapModal,
  showCancelConfirm,
  setShowCancelConfirm,
  showSkipConfirm,
  setShowSkipConfirm,
  isLoadingAlternatives,
  alternatives,
  handleSwapExercise,
  handleSkipSet,
}: WorkoutModalsProps) {
  if (showSwapModal) {
    return (
      <div className="min-h-full flex flex-col items-center justify-start pt-20 p-4 absolute inset-0 z-[100] bg-[var(--color-gray-50)]/90 backdrop-blur-sm">     
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[var(--color-white)] rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[var(--color-indigo-50)]"
        >
          <h2 className="text-2xl font-black text-[var(--color-slate-800)] mb-2">
            Bench is Taken?
          </h2>
          <p className="text-[var(--color-slate-500)] mb-6 font-medium text-sm">
            Swap to a muscle-equivalent alternative for today&apos;s session. 
          </p>

          <div className="flex flex-col gap-3 min-h-[150px] justify-center">  
            {isLoadingAlternatives ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : alternatives.length > 0 ? (
              alternatives.map((alt) => (
                <button
                  key={alt.id}
                  onClick={() => handleSwapExercise(alt)}
                  className="w-full p-4 flex items-center justify-between text-left text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-2xl font-bold transition-all border border-indigo-100 active:scale-95"
                >
                  <span>{alt.name}</span>
                  <RefreshCw className="text-indigo-400" size={16} />
                </button>
              ))
            ) : (
              <p className="text-slate-400 italic">No direct alternatives found.</p>
            )}
          </div>

          <button
            onClick={() => setShowSwapModal(false)}
            className="mt-6 w-full py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </motion.div>
      </div>
    );
  }

  if (showCancelConfirm) {
    return (
      <div className="min-h-full flex flex-col items-center justify-start pt-20 p-4 absolute inset-0 z-[100] bg-[var(--color-gray-50)]/90 backdrop-blur-sm">
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

  if (showSkipConfirm) {
    return (
      <div className="min-h-full flex flex-col items-center justify-start pt-20 p-4 absolute inset-0 z-[100] bg-[var(--color-gray-50)]/90 backdrop-blur-sm">       
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[var(--color-white)] rounded-3xl p-8 max-w-sm w-full text-center shadow-xl border-2 border-[var(--color-indigo-50)]"
        >
          <h2 className="text-2xl font-black text-[var(--color-slate-800)] mb-4">
            Skip Set?
          </h2>
          <p className="text-[var(--color-slate-500)] mb-8 font-medium">        
            Are you sure you want to skip this set? You will lose <strong className="text-[var(--color-rose-500)]">5 XP</strong>.
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                setShowSkipConfirm(false);
                handleSkipSet();
              }}
              className="w-full py-4 bg-[var(--color-rose-500)] text-[var(--color-white)] rounded-xl font-bold shadow-[0_4px_0_var(--color-button-shadow)] active:translate-y-1 active:shadow-none hover:bg-[var(--color-rose-600)] transition-all"
            >
              Yes, Skip Set
            </button>
            <button
              onClick={() => setShowSkipConfirm(false)}
              className="w-full py-4 bg-[var(--color-gray-100)] text-[var(--color-slate-700)] rounded-xl font-bold border-2 border-[var(--color-gray-200)] hover:bg-[var(--color-gray-200)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}