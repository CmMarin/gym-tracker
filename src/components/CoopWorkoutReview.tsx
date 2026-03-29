"use client";

import { useEffect, useState } from "react";
import { getCoopSession } from "@/app/actions/coop-actions";
import { motion } from "framer-motion";
import { Trophy, Dumbbell, Zap, Skull, TrendingUp, PartyPopper } from "lucide-react";

export default function CoopWorkoutReview({ sessionId }: { sessionId: string }) {
  const [sessionData, setSessionData] = useState<any>(null);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchSession = async () => {
      const data = await getCoopSession(sessionId);
      if (data) {
        setSessionData(data);
        if (data.status === "COMPLETED") {
          clearInterval(interval);
        }
      }
    };

    fetchSession();

    interval = setInterval(fetchSession, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  if (!sessionData) return <div className="text-[var(--color-white)] animate-pulse font-bold mt-10">Loading review...</div>;

  const allFinished = sessionData.status === "COMPLETED";

  // Calculate stats
  // Highest Volume
  const topVolumeMember = [...sessionData.members].sort((a, b) => b.volume - a.volume)[0];
  // Most PRs
  const mostPrsMember = [...sessionData.members].sort((a, b) => b.prsCount - a.prsCount)[0];
  // Most Penalties
  const mostPenaltiesMember = [...sessionData.members].sort((a, b) => b.penalties - a.penalties)[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-indigo-600 p-8 rounded-[2rem] shadow-2xl w-full max-w-md text-center text-[var(--color-white)] border-b-8 border-indigo-800 mt-10"
    >
      <PartyPopper size={80} className="mx-auto mb-4 text-yellow-300 drop-shadow-lg" />
      <h2 className="text-4xl font-black mb-2">Team Review</h2>
      
      {!allFinished ? (
        <p className="text-indigo-200 font-bold mb-6 animate-pulse">Waiting for teammates to finish...</p>
      ) : (
        <p className="text-green-300 font-black mb-6 uppercase tracking-wider text-sm">Everyone is done! ??</p>
      )}

      <div className="space-y-3 text-left">
        {topVolumeMember && topVolumeMember.volume > 0 && (
          <div className="bg-indigo-700/50 rounded-2xl p-4 flex items-center justify-between border-2 border-indigo-500">
            <div className="flex items-center gap-3">
              <Dumbbell className="text-orange-400" size={28} />
              <div>
                <p className="text-[10px] text-indigo-200 uppercase font-black tracking-wider">Heavy Lifter</p>
                <p className="font-bold text-lg leading-tight">{topVolumeMember.user.username}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black">{topVolumeMember.volume.toLocaleString()} <span className="text-sm font-bold text-indigo-300">kg</span></p>
            </div>
          </div>
        )}

        {mostPrsMember && mostPrsMember.prsCount > 0 && (
          <div className="bg-indigo-700/50 rounded-2xl p-4 flex items-center justify-between border-2 border-indigo-500">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-yellow-400" size={28} />
              <div>
                <p className="text-[10px] text-indigo-200 uppercase font-black tracking-wider">PR Machine</p>
                <p className="font-bold text-lg leading-tight">{mostPrsMember.user.username}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black">{mostPrsMember.prsCount} <span className="text-sm font-bold text-indigo-300">PRs</span></p>
            </div>
          </div>
        )}

        {mostPenaltiesMember && mostPenaltiesMember.penalties > 0 && (
          <div className="bg-indigo-700/50 rounded-2xl p-4 flex items-center justify-between border-2 border-indigo-500">
            <div className="flex items-center gap-3">
              <Skull className="text-red-400" size={28} />
              <div>
                <p className="text-[10px] text-indigo-200 uppercase font-black tracking-wider">Most Slack</p>
                <p className="font-bold text-lg leading-tight">{mostPenaltiesMember.user.username}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-red-300">{mostPenaltiesMember.penalties} <span className="text-sm font-bold text-red-400">Slips</span></p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 bg-indigo-800 rounded-2xl p-4 mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-sm font-bold text-indigo-200 mb-1">Team Goal Progress</p>
          <div className="flex justify-between items-center mb-2">
            <span className="text-3xl font-black">{sessionData.totalXp} <span className="text-lg text-indigo-300">PT</span></span>
            <span className="text-lg font-bold text-indigo-300">/ {sessionData.goalXp}</span>
          </div>
          <div className="w-full h-3 bg-indigo-900 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-green-400 rounded-full shadow-[0_0_10px_var(--color--)]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (sessionData.totalXp / sessionData.goalXp) * 100)}%` }}
            />
          </div>
          {sessionData.totalXp >= sessionData.goalXp && (
            <p className="mt-3 text-sm font-black text-green-300 text-center uppercase tracking-widest">+200 XP BONUS UNLOCKED!</p>
          )}
        </div>
      </div>

      <button
        onClick={() => window.location.href = "/dashboard"}
        className="bg-[var(--color-white)] text-indigo-600 font-black text-xl w-full py-4 rounded-2xl shadow-[0_6px_0_0_#bfdbfe] active:translate-y-[6px] active:shadow-none transition-all"
      >
        BACK TO DASHBOARD
      </button>
    </motion.div>
  );
}
