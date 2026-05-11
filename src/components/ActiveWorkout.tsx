"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  
  
  
  
  X,
  
  List,
  
  
  
} from "lucide-react";
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
    <div className="min-h-full h-full bg-transparent flex flex-col p-6 items-center relative">
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
      
      <div className="w-full max-w-md flex justify-center items-center mb-8 relative">
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className={`absolute left-0 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all border border-[var(--color-gray-200)] shadow-[0_4px_0_var(--color-button-shadow)] ${
            showTimeline
              ? "bg-[var(--color-indigo-100)] text-[var(--color-indigo-600)]"
              : "bg-[var(--color-gray-100)] text-[var(--color-slate-500)] hover:text-[var(--color-indigo-500)] hover:scale-110"
          }`}
        >
          <List size={24} />
        </button>
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
