"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { toPng } from "html-to-image";
import { Download, X, Target, Zap, Trophy, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";

const Model = dynamic(
  () => import("react-body-highlighter").then((mod) => mod.default),
  { ssr: false }
);

interface WorkoutWrappedCardProps {
  summary: any;
  workoutState: any;
  onClose: () => void;
}

export default function WorkoutWrappedCard({ summary, workoutState, onClose }: WorkoutWrappedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [showFront, setShowFront] = useState(true);

  // Compute Volume & Heatmap Data
  let totalVolume = 0;
  let totalSets = 0;
  const fatigueData: Record<string, number> = {};

  workoutState.exercises?.forEach((ex: any) => {
    ex.sets?.forEach((set: any) => {
      if (set.completed) {
        totalSets++;
        const weight = parseFloat(set.weight) || 0;
        const reps = parseInt(set.reps) || 0;
        const volume = weight * reps;
        totalVolume += volume;

        // Add to heatmap
        if (ex.name) {
          // A very basic extraction for heatmap if we don't have exact targeted muscle mapping,
          // but let's assume `targetMuscle` might exist or we just map everything to "chest" for testing.
          // Usually we'd map exercise name -> muscle
          const muscle = (ex.targetMuscle || ex.name.includes("Bench") ? "chest" : 
                         ex.name.includes("Squat") ? "gluteal" :
                         ex.name.includes("Curl") ? "biceps" : "front-deltoids").toLowerCase();
          
          fatigueData[muscle] = (fatigueData[muscle] || 0) + volume;
        }
      }
    });
  });

  const mockHeatmapData: any[] = [];
  Object.keys(fatigueData).forEach((muscle) => {
    const rawLoad = Math.max(1, Math.round(fatigueData[muscle] / 100)); // Normalize
    mockHeatmapData.push({ 
      name: `${muscle} mock`, 
      muscles: [muscle],
      frequency: rawLoad
    });
  });

  const durationMin = summary?.durationMinutes || 0;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        style: {
          backgroundColor: "#0f172a",
        },
        skipFonts: true, // Fix for oklch parser bug in library fonts
      });
      const link = document.createElement("a");
      link.download = `workout-wrapped-${new Date().toISOString().split("T")[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("image generation error", e);
    }
    setDownloading(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-hidden"
      >
        {/* Full screen flipping container */}
        <motion.div
            initial={{ scale: 0.8, rotateY: 90 }}
            animate={{ scale: 1, rotateY: 0 }}
            exit={{ scale: 0.8, rotateY: -90 }}
            transition={{ type: "spring", damping: 15, stiffness: 80 }}
            className="w-full max-w-sm flex-1 flex flex-col justify-center"
        >
          {/* Card Element to Capture */}
          <div 
            ref={cardRef}
            className="relative bg-slate-900 rounded-3xl p-6 shadow-2xl overflow-hidden border border-slate-700 w-full text-white"
            style={{ minHeight: '520px' }}
          >
            {/* Background Decor */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-40 mix-blend-screen" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-30 mix-blend-screen" />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="text-center mb-6 pt-4">
                <h2 className="text-3xl font-black italic tracking-tighter bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent uppercase flex flex-col items-center leading-none">
                  <span>Workout</span>
                  <span className="text-4xl mt-1">Wrapped</span>
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-[#94a3b8] font-semibold px-3 py-1 bg-slate-800 rounded-full text-xs">
                    {workoutState.name || "Custom Workout"}
                  </span>
                  <span className="text-[#94a3b8] font-semibold px-3 py-1 bg-slate-800 rounded-full text-xs flex items-center gap-1">
                    ⏱️ {durationMin} min
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700 flex flex-col items-center justify-center text-center shadow-inner">
                  <Zap className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] mb-2" size={24} />
                  <div className="text-2xl font-black tabular-nums tracking-tight">{totalVolume.toLocaleString()}</div>
                  <div className="text-[10px] text-[#94a3b8] uppercase tracking-widest font-bold mt-1">Total Vol (kg)</div>
                </div>
                
                <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700 flex flex-col items-center justify-center text-center shadow-inner">
                  <Target className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] mb-2" size={24} />
                  <div className="text-2xl font-black tabular-nums tracking-tight">{totalSets}</div>
                  <div className="text-[10px] text-[#94a3b8] uppercase tracking-widest font-bold mt-1">Sets Done</div>
                </div>

                <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700 flex flex-col items-center justify-center text-center shadow-inner">
                  <TrendingUp className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)] mb-2" size={24} />
                  <div className="text-2xl font-black tabular-nums tracking-tight text-[#dbeafe]">+{summary?.xpEarned || 0}</div>
                  <div className="text-[10px] text-[#94a3b8] uppercase tracking-widest font-bold mt-1">XP Earned</div>
                </div>

                <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
                  <Trophy className="text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)] mb-2 relative z-10" size={24} />
                  <div className="text-2xl font-black tabular-nums tracking-tight relative z-10">{summary?.prs?.length || 0}</div>
                  <div className="text-[10px] text-[#94a3b8] uppercase tracking-widest font-bold mt-1 relative z-10">New PRs</div>
                  {summary?.prs?.length > 0 && (
                    <div className="absolute inset-0 bg-purple-500/10 blur-xl z-0 pointer-events-none animate-pulse" />
                  )}
                </div>
              </div>
              {/* Heatmap Mini */}
              <div className="relative z-10 bg-[#1e293b] flex justify-center items-center rounded-2xl p-4 border border-slate-700/50 h-56 overflow-hidden mb-6 shadow-inner">
                 {mockHeatmapData.length > 0 ? (
                   <div className="transform scale-[0.85] opacity-95 pointer-events-none mt-10">
                     <Model
                        data={mockHeatmapData}
                        style={{ width: "16rem", color: "inherit" }}
                        highlightedColors={["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"]}
                     />
                   </div>
                 ) : (
                    <div className="text-slate-500 font-medium text-sm">No fatigue data</div>
                 )}
              </div>
              {/* Achievements & Level Up */}
              <div className="flex-1 flex flex-col justify-end gap-3 mb-2">
                {summary?.didLevelUp && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="relative bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-xl p-3 flex items-center justify-center gap-3 backdrop-blur-sm"
                  >
                    <span className="text-2xl">🔥</span>
                    <div className="text-left">
                      <div className="text-yellow-400 font-bold leading-tight">Level Up!</div>
                      <div className="text-yellow-200/80 text-xs font-semibold">You reached Level {summary.newLevel}!</div>
                    </div>
                  </motion.div>
                )}

                {summary?.earnedAchievements?.length > 0 && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center justify-center gap-2 text-sm font-bold text-purple-200 bg-purple-900/40 border border-purple-500/30 rounded-xl py-3 px-4 shadow-inner backdrop-blur-sm"
                  >
                    <Trophy size={16} className="text-purple-400" />
                    Unlocked {summary.earnedAchievements.length} new {summary.earnedAchievements.length === 1 ? 'trophy' : 'trophies'}!
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons - Outside of the cardRef so they aren't included in the screenshot */}
        <div className="mt-8 flex gap-4 w-full max-w-sm">
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-indigo-600/20 border border-indigo-500/50"
          >
            {downloading ? "Saving..." : <><Download size={18} /> Save Card</>}
          </button>
          
          <button 
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition active:scale-95 border border-slate-700 shadow-xl"
            aria-label="Close"
          >
            <X size={20} /> Close
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}





