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
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-2 sm:p-6 bg-[var(--color-gray-50)]/90 backdrop-blur-xl overflow-y-auto"
      >
        {/* Responsive, scrollable container if height is short */}
        <div className="w-full max-w-sm min-h-max flex flex-col justify-center py-4 sm:py-6">
          <motion.div
              initial={{ scale: 0.8, rotateY: 90 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0.8, rotateY: -90 }}
              transition={{ type: "spring", damping: 15, stiffness: 80 }}
              className="w-full flex-1 flex flex-col items-center justify-center"
          >
            {/* Card Element to Capture */}
            <div 
              ref={cardRef}
              className="relative bg-[var(--color-white)]/80 backdrop-blur-2xl rounded-[2rem] p-5 sm:p-6 shadow-2xl overflow-hidden border border-[var(--color-white)] w-full text-[var(--color-slate-800)] flex flex-col shrink-0 scale-95 sm:scale-100 origin-center"
              style={{ minHeight: 'max-content' }}
            >
              {/* Background Decor - utilizing theme colors */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-[var(--color-indigo-400)] rounded-full blur-[80px] opacity-20 pointer-events-none" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[var(--color-indigo-500)] rounded-full blur-[80px] opacity-20 pointer-events-none" />

              {/* Content Container */}
              <div className="relative z-10 flex flex-col h-full gap-4">
                {/* Header */}
                <div className="text-center pt-1">
                  <h2 className="text-[2rem] sm:text-[2.2rem] font-black italic tracking-tighter text-[var(--color-indigo-500)] flex flex-col items-center leading-[0.85] mb-3">
                    <span className="text-[var(--color-slate-800)]">WORKOUT</span>
                    <span>WRAPPED</span>
                  </h2>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[var(--color-slate-600)] font-bold px-4 py-1.5 bg-[var(--color-gray-100)] rounded-xl text-xs uppercase tracking-wide">
                      {workoutState.name || "Custom Workout"}
                    </span>
                    <span className="text-[var(--color-slate-600)] font-bold px-4 py-1.5 bg-[var(--color-gray-100)] rounded-xl text-xs flex items-center gap-1 uppercase tracking-wide">
                      ⏱️ {durationMin} MIN
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="bg-[var(--color-white)]/80 backdrop-blur-md rounded-[1.25rem] p-3 border border-[var(--color-white)] flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mb-1.5 shadow-inner">
                      <Zap className="text-yellow-500" size={16} strokeWidth={3} />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[var(--color-slate-800)] tracking-tight">{totalVolume.toLocaleString()}</div>
                    <div className="text-[9px] sm:text-[10px] text-[var(--color-slate-400)] uppercase tracking-widest font-bold mt-0.5">Total Vol (kg)</div>
                  </div>
                  
                  <div className="bg-[var(--color-white)]/80 backdrop-blur-md rounded-[1.25rem] p-3 border border-[var(--color-white)] flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-1.5 shadow-inner">
                      <Target className="text-emerald-500" size={16} strokeWidth={3} />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[var(--color-slate-800)] tracking-tight">{totalSets}</div>
                    <div className="text-[9px] sm:text-[10px] text-[var(--color-slate-400)] uppercase tracking-widest font-bold mt-0.5">Sets Done</div>
                  </div>

                  <div className="bg-[var(--color-white)]/80 backdrop-blur-md rounded-[1.25rem] p-3 border border-[var(--color-white)] flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-1.5 shadow-inner">
                      <TrendingUp className="text-blue-500" size={16} strokeWidth={3} />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[var(--color-indigo-500)] tracking-tight">+{summary?.xpEarned || 0}</div>
                    <div className="text-[9px] sm:text-[10px] text-[var(--color-slate-400)] uppercase tracking-widest font-bold mt-0.5">XP Earned</div>
                  </div>

                  <div className="bg-[var(--color-white)]/80 backdrop-blur-md rounded-[1.25rem] p-3 border border-[var(--color-white)] flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mb-1.5 shadow-inner relative z-10">
                      <Trophy className="text-purple-500" size={16} strokeWidth={3} />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[var(--color-slate-800)] tracking-tight relative z-10">{summary?.prs?.length || 0}</div>
                    <div className="text-[9px] sm:text-[10px] text-[var(--color-slate-400)] uppercase tracking-widest font-bold mt-0.5 relative z-10">New PRs</div>
                    {summary?.prs?.length > 0 && (
                      <div className="absolute inset-0 bg-purple-100/30 blur-xl z-0 pointer-events-none animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Heatmap Mini */}
                <div className="relative z-10 bg-[var(--color-white)]/50 flex justify-center items-center rounded-[1.25rem] p-2 border border-[var(--color-white)] h-32 sm:h-36 overflow-hidden shadow-sm">
                   {mockHeatmapData.length > 0 ? (
                     <div className="transform scale-[0.55] sm:scale-[0.60] opacity-90 pointer-events-none mt-6 sm:mt-8 w-full flex justify-center">
                       <Model
                          data={mockHeatmapData}
                          style={{ width: "16rem", color: "inherit" }}
                          highlightedColors={["var(--color-indigo-200)", "var(--color-indigo-300)", "var(--color-indigo-400)", "var(--color-indigo-500)"]}
                       />
                     </div>
                   ) : (
                      <div className="text-[var(--color-slate-400)] font-bold text-xs uppercase tracking-widest">No fatigue data</div>
                   )}
                </div>

                {/* Achievements & Level Up */}
                <div className="flex-1 flex flex-col justify-end gap-3 shrink-0">
                  {summary?.didLevelUp && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="relative bg-orange-50 border border-orange-200 rounded-[1.25rem] p-3 flex items-center justify-center gap-3 shadow-sm"
                    >
                      <span className="text-2xl animate-bounce">🔥</span>
                      <div className="text-left">
                        <div className="text-orange-600 font-black leading-tight uppercase tracking-wide">Level Up!</div>
                        <div className="text-orange-500/80 text-xs font-bold">You reached Level {summary.newLevel}!</div>
                      </div>
                    </motion.div>
                  )}

                  {summary?.earnedAchievements?.length > 0 && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="flex items-center justify-center gap-2 text-sm font-bold text-[var(--color-indigo-600)] bg-[var(--color-indigo-50)] border border-[var(--color-indigo-100)] rounded-[1.25rem] py-3 px-4 shadow-sm backdrop-blur-sm"
                    >
                      <Trophy size={16} className="text-[var(--color-indigo-500)]" strokeWidth={3} />
                      Unlocked {summary.earnedAchievements.length} new {summary.earnedAchievements.length === 1 ? 'trophy' : 'trophies'}!
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons - Outside of the cardRef to keep screenshots clean */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full justify-center px-2">
              <button 
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 min-h-[56px] sm:min-h-[60px] bg-[var(--color-indigo-500)] hover:bg-[var(--color-indigo-600)] text-[var(--color-white)] font-black text-lg sm:text-xl py-3 sm:py-4 px-6 rounded-[1.25rem] flex items-center justify-center gap-2 transition-all shadow-[0_6px_0_0_var(--color-button-shadow)] active:shadow-[0_0px_0_0_var(--color-button-shadow)] active:translate-y-[6px] hover:-translate-y-1 disabled:opacity-50 disabled:pointer-events-none"
              >
                {downloading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <><Download size={22} strokeWidth={3} /> Save Card</>
                )}
              </button>
              
              <button 
                onClick={onClose}
                className="bg-[var(--color-white)] hover:bg-[var(--color-gray-100)] text-[var(--color-slate-500)] hover:text-[var(--color-slate-800)] font-black text-lg sm:text-xl py-3 sm:py-4 px-6 rounded-[1.25rem] flex items-center justify-center gap-2 transition-all shadow-[0_6px_0_0_var(--color-gray-200)] active:shadow-[0_0px_0_0_var(--color-gray-200)] active:translate-y-[6px] border border-[var(--color-gray-100)] sm:flex-none"
                aria-label="Close"
              >
                <X size={22} strokeWidth={3} /> Close
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}





