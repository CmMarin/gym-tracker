"use client";

import { useEffect, useState } from "react";
import { getCoopSession } from "@/app/actions/coop-actions";
import { motion } from "framer-motion";
import { Users, Zap, CheckCircle2 } from "lucide-react";

export default function CoopPanel({ sessionId, currentExercise }: { sessionId: string, currentExercise: string }) {
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    let interval: any;
    
    const fetchCoopData = async () => {
      try {
        const data = await getCoopSession(sessionId);
        setSessionData(data);
      } catch (e) { }
    };
    
    fetchCoopData();
    interval = setInterval(fetchCoopData, 3000);
    
    return () => clearInterval(interval);
  }, [sessionId]);

  if (!sessionData) return null;

  const progress = Math.min((sessionData.totalXp / sessionData.goalXp) * 100, 100);

  return (
    <div className="w-full max-w-md bg-white border-2 border-blue-100 rounded-3xl p-5 mb-6 shadow-[0_4px_0_0_theme(colors.blue.100)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Users size={20} className="text-blue-500" /> Co-Op: {sessionData.name}
        </h3>
        <span className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-black text-slate-500 tracking-wider">
          CODE: {sessionData.inviteCode}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {sessionData.members.map((m: any) => (
          <div key={m.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {m.user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-slate-700 block">{m.user.username} <span className="text-blue-500">+{m.xpContributed} XP</span></span>
                <span className="text-xs text-slate-400 font-medium">
                  {m.status === "RESTING" ? "Resting..." : String(m.currentExercise || "Starting out").substring(0, 15)}
                </span>
              </div>
            </div>
            {m.status === "RESTING" ? (
               <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
            ) : m.status === "IDLE" ? (
               <div className="w-3 h-3 bg-gray-300 rounded-full" />
            ) : (
               <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            )}
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-bold text-slate-500">Team Goal</span>
          <span className="text-sm font-black text-blue-500 flex items-center">
             {sessionData.totalXp} / {sessionData.goalXp} <Zap size={14} fill="currentColor" className="ml-1"/>
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (sessionData.totalXp / sessionData.goalXp) * 100)}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
