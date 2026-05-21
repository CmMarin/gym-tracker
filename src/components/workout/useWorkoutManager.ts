"use client";

import { useState, useEffect } from "react";
import { finishWorkoutAction } from "@/app/actions/workout-actions";
import {
  updateWorkoutState,
  getAlternativeExercises,
} from "@/app/actions/active-workout-actions";
import { updateCoopStatus } from "@/app/actions/coop-actions";
import toast from "react-hot-toast";
import { useAppSounds } from "@/hooks/useAppSounds";

export function useWorkoutManager(initialState: any) {
  const { playBuzzer, playDing, playPop } = useAppSounds();
  const [workoutState, setWorkoutState] = useState(initialState);
  const [showMilestone, setShowMilestone] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [showPlateCalc, setShowPlateCalc] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);

  const { currentExerciseIndex, exercises, coopSessionId } = workoutState;
  const currentExercise = exercises?.[currentExerciseIndex];

  const currentSetIndex =
    currentExercise?.sets.findIndex((s: any) => !s.completed) ?? 0;

  useEffect(() => {
    if (restTimeLeft !== null && restTimeLeft > 0) {
      if (coopSessionId && currentExercise)
        updateCoopStatus(coopSessionId, "RESTING", currentExercise.name);
      const interval = setInterval(
        () => setRestTimeLeft((prev) => prev! - 1),
        1000
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

  const totalSets = exercises?.reduce(
    (acc: number, ex: any) => acc + ex.sets.length,
    0
  ) || 0;
  const completedSets = exercises?.reduce(
    (acc: number, ex: any) =>
      acc + ex.sets.filter((s: any) => s.completed).length,
    0
  ) || 0;
  const progressPercent = (completedSets / (totalSets || 1)) * 100;

  const handleOpenSwap = async () => {
    if (!currentExercise) return;
    setIsLoadingAlternatives(true);
    setShowSwapModal(true);
    const result = await getAlternativeExercises(
      currentExercise.id,
      currentExercise.isCustom
    );
    if (result.success) {
      setAlternatives(result.alternatives || []);
    }
    setIsLoadingAlternatives(false);
  };

  const handleSwapExercise = (newExercise: any) => {
    const newState = { ...workoutState };
    newState.exercises[currentExerciseIndex].id = newExercise.id;
    newState.exercises[currentExerciseIndex].name = newExercise.name;
    newState.exercises[currentExerciseIndex].isCustom = false;
    newState.exercises[currentExerciseIndex].isProgressionSuggested = false;

    setWorkoutState(newState);
    updateWorkoutState(newState).catch(console.error);

    setShowSwapModal(false);
    setAlternatives([]);
    toast.success(`Swapped to ${newExercise.name}`, { icon: "🔄" });
  };

  const handleUpdateSet = (field: string, value: string | boolean | number) => {
    if (currentSetIndex === -1) return;
    const newState = { ...workoutState };
    newState.exercises[currentExerciseIndex].sets[currentSetIndex][field] =
      value;
    setWorkoutState(newState);
  };

  const handleGoBack = () => {
    const newState = { ...workoutState };

    if (currentSetIndex > 0) {
      const prevSet =
        newState.exercises[currentExerciseIndex].sets[currentSetIndex - 1];
      prevSet.completed = false;
      prevSet.isSkipped = false;
    } else if (currentExerciseIndex > 0) {
      newState.currentExerciseIndex -= 1;
      const prevEx = newState.exercises[newState.currentExerciseIndex];
      if (prevEx.sets.length > 0) {
        const lastSet = prevEx.sets[prevEx.sets.length - 1];
        lastSet.completed = false;
        lastSet.isSkipped = false;
      }
    } else {
      return;
    }

    setWorkoutState(newState);
    setRestTimeLeft(null);
  };

  const handleSkipSet = async () => {
    if (currentSetIndex === -1) return;
    const newState = { ...workoutState };
    const set = newState.exercises[currentExerciseIndex].sets[currentSetIndex];
    set.completed = true;
    set.isSkipped = true;

    const nextSetIndex = newState.exercises[
      currentExerciseIndex
    ].sets.findIndex((s: any) => !s.completed);

    if (nextSetIndex === -1) {
      if (currentExerciseIndex < exercises.length - 1) {
        newState.currentExerciseIndex += 1;
      }
    }
    setWorkoutState(newState);

    updateWorkoutState(newState).catch(console.error);

    const isWorkoutFinished =
      newState.currentExerciseIndex === exercises.length - 1 &&
      newState.exercises[newState.currentExerciseIndex].sets.findIndex(
        (s: any) => !s.completed
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
      setRestTimeLeft(null);
    }
  };

  const handleCompleteSet = async () => {
    if (currentSetIndex === -1) return;

    const newState = { ...workoutState };
    const exercise = newState.exercises[currentExerciseIndex];
    const set = exercise.sets[currentSetIndex];
    
    // Check if cardio exercise to loosen validation
    const isCardio = exercise.category === 'Cardio';

    if (!isCardio && (!set.reps || !set.weight)) {
      playBuzzer();
      toast.error("Enter weight and reps!");
      return;
    }

    if (isCardio && !set.duration) {
      playBuzzer();
      toast.error("Enter duration!");
      return;
    }

    set.completed = true;

    if (set.isWarmup) {
      newState.exercises[currentExerciseIndex].sets.push({
        reps: set.reps,
        weight: set.weight,
        duration: set.duration,
        speed: set.speed,
        incline: set.incline,
        level: set.level,
        completed: false,
      });
    }

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

    updateWorkoutState(newState).catch(console.error);

    if (coopSessionId) {
      updateCoopStatus(coopSessionId, "LIFTING", currentExercise.name, 15);
      toast.success("+15 Team XP", { icon: "🔥", position: "top-center" });
    }

    const isWorkoutFinished =
      newState.currentExerciseIndex === exercises.length - 1 &&
      newState.exercises[newState.currentExerciseIndex].sets.findIndex(
        (s: any) => !s.completed
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

  const currentSet =
    currentSetIndex !== -1 && currentExercise
      ? currentExercise.sets[currentSetIndex]
      : null;

  const previousWorkingSets =
    currentExercise && currentSetIndex !== -1
      ? currentExercise.sets
          .slice(0, currentSetIndex)
          .filter((s: any) => !s.isWarmup && !s.isSkipped).length
      : 0;

  const totalWorkingSets = currentExercise
    ? currentExercise.sets.filter((s: any) => !s.isWarmup && !s.isSkipped)
        .length
    : 0;

  const isLastSet =
    currentSetIndex !== -1 &&
    currentExercise &&
    currentSetIndex === currentExercise.sets.length - 1;
  const nextExercise = exercises?.[currentExerciseIndex + 1];
  const hasPreviousSet = currentExerciseIndex > 0 || currentSetIndex > 0;

  return {
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
    totalSets,
    completedSets,
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
  };
}
