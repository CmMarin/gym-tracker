"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ActiveWorkout from "./ActiveWorkout";
import { Dumbbell, Calendar, Play, UploadCloud, Users, X } from "lucide-react";
import { startOrResumeWorkout } from "@/app/actions/active-workout-actions";
import { createCoopSession, joinCoopSession } from "@/app/actions/coop-actions";
import Link from "next/link";
import toast from "react-hot-toast";

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

  const [showCoopModal, setShowCoopModal] = useState(false);
  const [selectedPlanForCoop, setSelectedPlanForCoop] = useState<Plan | null>(null);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [isCoopLoading, setIsCoopLoading] = useState(false);

  const handleStart = async (plan: Plan, coopSessionId?: string) => {
    setLoadingPlan(plan.id);
    try {
      const res = await startOrResumeWorkout(plan.id, coopSessionId);
      if (res.success && res.activeWorkout) {
        setActiveState(res.activeWorkout);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to start workout");
    }
    setLoadingPlan(null);
  };

  const handleHostCoop = async () => {
    if (!selectedPlanForCoop) return;
    setIsCoopLoading(true);
    try {
      const res = await createCoopSession(selectedPlanForCoop.id);
      if (res.success) {
        toast.success("Co-Op Session Created! Code: " + res.inviteCode, { duration: 5000 });
        await handleStart(selectedPlanForCoop, res.sessionId);
        setShowCoopModal(false);
      }
    } catch (e) {
      toast.error("Failed to create Co-Op session");
    }
    setIsCoopLoading(false);
  };

  const handleJoinCoop = async () => {
    if (!selectedPlanForCoop || !inviteCodeInput) return;
    setIsCoopLoading(true);
    try {
      const res = await joinCoopSession(inviteCodeInput.toUpperCase());
      if (res.success) {
        toast.success("Joined Co-Op Session!");
        await handleStart(selectedPlanForCoop, res.sessionId);
        setShowCoopModal(false);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to join Co-Op session");
    }
    setIsCoopLoading(false);
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

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setSelectedPlanForCoop(plan);
                    setShowCoopModal(true);
                  }}
                  disabled={loadingPlan !== null}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-600 font-bold p-3 rounded-2xl shadow-sm transition-all flex justify-center items-center"
                >
                  <Users size={20} />
                </button>
                <button
                  onClick={() => handleStart(plan)}
                  disabled={loadingPlan !== null}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-2xl shadow-[0_4px_0_theme(colors.green.600)] transition-all flex-1 text-center flex justify-center items-center gap-2"
                >
                  {loadingPlan === plan.id ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Play fill="white" size={16} /> START
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCoopModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex flex-col justify-end sm:justify-center p-4">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-xl w-full max-w-md mx-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-slate-800">
                  <Users className="text-blue-500" />
                  <h2 className="text-2xl font-black">Co-Op Workout</h2>
                </div>
                <button onClick={() => setShowCoopModal(false)} className="p-2 bg-gray-100 rounded-full text-slate-500">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleHostCoop}
                  disabled={isCoopLoading}
                  className="w-full bg-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_4px_0_theme(colors.blue.600)] active:shadow-none active:translate-y-1"
                >
                  {isCoopLoading ? "Starting..." : "Host New Session"}
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="mx-4 text-slate-400 font-bold text-sm">OR</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Enter Invite Code"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value)}
                    className="flex-1 bg-gray-100 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    maxLength={6}
                  />
                  <button 
                    onClick={handleJoinCoop}
                    disabled={isCoopLoading || !inviteCodeInput}
                    className="bg-slate-800 text-white font-bold px-6 rounded-xl shadow-[0_4px_0_theme(colors.slate.900)] active:shadow-none active:translate-y-1 disabled:opacity-50"
                  >
                    Join
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
