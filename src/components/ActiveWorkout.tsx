"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, List } from "lucide-react";
import CoopPanel from "./CoopPanel";
import CoopWorkoutReview from "./CoopWorkoutReview";

import WorkoutWrappedCard from "./WorkoutWrappedCard";
import WorkoutModals from "./workout/WorkoutModals";
import { useWorkoutManager } from "./workout/useWorkoutManager";
import WorkoutTimeline from "./workout/WorkoutTimeline";
import RestTimerPanel from "./workout/RestTimerPanel";
import CurrentExercisePanel from "./workout/CurrentExercisePanel";


export default function ActiveWorkout({
  planName,
  initialState,
}: {
  planName: string;
  initialState: any;
}) {
  const {
    workoutState,
    showMilestone,
    isFinishing,
    summary,
    showCancelConfirm,
    setShowCancelConfirm,
    showSkipConfirm,
    setShowSkipConfirm,
    showTimeline,
    setShowTimeline,
    showSwapModal,
    setShowSwapModal,
    isLoadingAlternatives,
    alternatives,
    showPlateCalc,
    setShowPlateCalc,
    restTimeLeft,
    setRestTimeLeft,
    currentExerciseIndex,
    exercises,
    coopSessionId,
    currentExercise,
    currentSetIndex,
    progressPercent,
    currentSet,
    previousWorkingSets,
    totalWorkingSets,
    isLastSet,
    nextExercise,
    hasPreviousSet,
    handleOpenSwap,
    handleSwapExercise,
    handleUpdateSet,
    handleGoBack,
    handleSkipSet,
    handleCompleteSet,
  } = useWorkoutManager(initialState);

  if (!exercises || exercises.length === 0) return <div>No exercises.</div>;

    return (
    <div className="min-h-[100dvh] h-full bg-[var(--color-gray-50)] flex flex-col px-6 pt-6 pb-2 items-center relative font-sans selection:bg-[var(--color-indigo-500)]/30 overflow-y-auto">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-10%] w-[70vw] h-[70vw] max-w-[400px] max-h-[400px] bg-[var(--color-indigo-500)] opacity-[0.07] blur-[80px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[60vw] h-[60vw] max-w-[300px] max-h-[300px] bg-[var(--color-indigo-400)] opacity-[0.05] blur-[80px] rounded-full" />
      </div>

      <WorkoutModals 
        showSwapModal={showSwapModal}
        setShowSwapModal={setShowSwapModal}
        showCancelConfirm={showCancelConfirm}
        setShowCancelConfirm={setShowCancelConfirm}
        showSkipConfirm={showSkipConfirm}
        setShowSkipConfirm={setShowSkipConfirm}
        isLoadingAlternatives={isLoadingAlternatives}
        alternatives={alternatives}
        handleSwapExercise={handleSwapExercise}
        handleSkipSet={handleSkipSet}
      />
      
      <div className="w-full max-w-md flex justify-between items-start mb-6 mt-2 relative z-10">
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="p-3 bg-[var(--color-white)]/60 backdrop-blur-xl border border-[var(--color-white)]/50 rounded-2xl text-[var(--color-slate-400)] hover:text-[var(--color-indigo-500)] hover:scale-105 active:scale-95 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center justify-center pt-1 overflow-hidden px-4 text-center">
            <span className="text-[10px] text-[var(--color-indigo-500)] font-bold tracking-widest uppercase mb-0.5">Active Workout</span>
            <h1 className="font-bold text-[13px] text-[var(--color-slate-700)] truncate max-w-full w-full">
              {planName}
            </h1>
        </div>
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="p-3 bg-[var(--color-white)]/60 backdrop-blur-xl border border-[var(--color-white)]/50 rounded-2xl text-[var(--color-slate-400)] hover:text-[var(--color-rose-500)] hover:scale-105 active:scale-95 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {coopSessionId && (
        <div className="mb-4">
          <CoopPanel
            sessionId={coopSessionId}
            currentExercise={currentExercise?.name}
          />
        </div>
      )}

      {!showTimeline && !showMilestone && (!restTimeLeft || restTimeLeft === 0) && (
        <>
          <div className="w-full max-w-md flex items-center justify-between mb-2">
            <span className="text-[var(--color-slate-500)] text-xs font-bold">Progress</span>
            <span className="text-[var(--color-slate-500)] text-xs font-bold">
              {currentExerciseIndex !== -1 ? `Exercise ${currentExerciseIndex + 1} / ${exercises.length}` : 'Done'}
            </span>
          </div>
          <div className="w-full max-w-md h-[4px] bg-[var(--color-gray-200)] rounded-full mb-10 overflow-hidden relative border-none">
            <motion.div
              className="h-full rounded-full absolute left-0 top-0 bg-[var(--color-indigo-500)]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: "spring", stiffness: 50 }}
            />
          </div>
        </>
      )}

      <AnimatePresence mode="wait">
        {showTimeline ? (
          <WorkoutTimeline exercises={exercises} currentExerciseIndex={currentExerciseIndex} showMilestone={showMilestone} currentSet={currentSet} previousWorkingSets={previousWorkingSets} totalWorkingSets={totalWorkingSets} setShowTimeline={setShowTimeline} />
        ) : showMilestone ? (
          coopSessionId ? (
            <CoopWorkoutReview sessionId={coopSessionId} />
          ) : (
            <WorkoutWrappedCard 
              summary={summary} 
              workoutState={workoutState} 
              onClose={() => (window.location.href = "/dashboard")} 
            />
          )
        ) : restTimeLeft !== null && restTimeLeft > 0 ? (
          <RestTimerPanel restTimeLeft={restTimeLeft} setRestTimeLeft={setRestTimeLeft} onSkipRest={() => setRestTimeLeft(0)} />
        ) : (
          <CurrentExercisePanel 
            currentExercise={currentExercise}
            currentSetIndex={currentSetIndex}
            previousWorkingSets={previousWorkingSets}
            totalWorkingSets={totalWorkingSets}
            currentSet={currentSet}
            handleOpenSwap={handleOpenSwap}
            handleUpdateSet={handleUpdateSet}
            handleCompleteSet={handleCompleteSet}
            showPlateCalc={showPlateCalc}
            setShowPlateCalc={setShowPlateCalc}
            isFinishing={isFinishing}
            setShowSkipConfirm={setShowSkipConfirm}
            isLastSet={isLastSet}
            nextExercise={nextExercise}
            hasPreviousSet={hasPreviousSet}
            handleGoBack={handleGoBack}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
