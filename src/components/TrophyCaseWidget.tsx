"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, PlusCircle, Lock } from "lucide-react";

type AchievementType = string;

type UserAchievement = {
  id: string;
  type: AchievementType;
  achievedAt: Date;
};

// --- SVG TROPHY FIGURES ---
// Complex 2D Trophies that change appearance intensely based on tier.
export const TrophyFigure = ({ tier, isLocked }: { tier: string; isLocked: boolean }) => {
  const isIron = tier === "IRON";
  const isGold = tier === "GOLD";
  const isMythic = tier === "MYTHIC";

  // If locked, we apply a hard gray wash filter.
  const filterStyle = isLocked ? { filter: "grayscale(100%) opacity(40%)" } : {};

  return (
    <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-lg" style={filterStyle}>
      <defs>
        {/* Gradients */}
        <linearGradient id="grad-iron" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d1d5db" />
          <stop offset="100%" stopColor="#6b7280" />
        </linearGradient>
        <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
        <linearGradient id="grad-diamond" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cffafe" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="grad-ruby" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fecdd3" />
          <stop offset="50%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#9f1239" />
        </linearGradient>
        <linearGradient id="grad-mythic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e879f9" />
          <stop offset="25%" stopColor="#c084fc" />
          <stop offset="75%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>

        <linearGradient id="grad-base" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>

        <filter id="glow-mythic" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* RURAL / BASE PLATFORM */}
      <path d="M 25 90 L 75 90 L 80 100 L 20 100 Z" fill="url(#grad-base)" />
      <path d="M 35 80 L 65 80 L 75 90 L 25 90 Z" fill="url(#grad-base)" opacity="0.8" />
      <rect x="45" y="65" width="10" height="15" fill="url(#grad-base)" opacity="0.9" />

      {/* CORE TROPHY CUP (changes by tier) */}
      {(() => {
        const fillId = `url(#grad-${tier.toLowerCase()})`;
        const glow = isMythic && !isLocked ? { filter: "url(#glow-mythic)" } : {};
        
        switch (tier) {
          case "IRON":
          case "GOLD":
            return (
              <g {...glow}>
                {/* Handles */}
                <path d="M 30 30 Q 10 30 20 50 Q 30 60 40 50" fill="none" stroke={fillId} strokeWidth="5" />
                <path d="M 70 30 Q 90 30 80 50 Q 70 60 60 50" fill="none" stroke={fillId} strokeWidth="5" />
                {/* Cup */}
                <path d="M 25 20 Q 50 80 75 20 Z" fill={fillId} />
                <ellipse cx="50" cy="20" rx="25" ry="5" fill="#facc15" opacity={isGold ? 1 : 0} />
                <ellipse cx="50" cy="20" rx="25" ry="5" fill="#e5e7eb" opacity={isIron ? 1 : 0} />
              </g>
            );
          case "DIAMOND":
            return (
              <g {...glow}>
                {/* Angular Sharp Trophy */}
                <path d="M 35 15 L 65 15 L 75 50 L 50 70 L 25 50 Z" fill={fillId} />
                <polygon points="35,15 65,15 50,35" fill="rgba(255,255,255,0.4)" />
                <polygon points="25,50 75,50 50,70" fill="rgba(0,0,0,0.2)" />
              </g>
            );
          case "RUBY":
            return (
              <g {...glow}>
                {/* Sweeping elegant curves */}
                <path d="M 40 10 L 60 10 Q 80 30 50 70 Q 20 30 40 10 Z" fill={fillId} />
                {/* Inner Gem shape */}
                <path d="M 45 20 L 55 20 L 50 60 Z" fill="rgba(255,255,255,0.3)" />
                {/* Wings/Ornaments */}
                <path d="M 20 40 Q 5 20 30 25" fill="none" stroke={fillId} strokeWidth="4" />
                <path d="M 80 40 Q 95 20 70 25" fill="none" stroke={fillId} strokeWidth="4" />
              </g>
            );
          case "MYTHIC":
            return (
              <g {...glow}>
                {/* Majestic Star/Crown Hybrid */}
                <path d="M 20 20 L 30 40 L 10 50 L 35 55 L 50 80 L 65 55 L 90 50 L 70 40 L 80 20 L 50 35 Z" fill={fillId} />
                <circle cx="50" cy="45" r="10" fill="white" opacity="0.6" />
              </g>
            );
          default:
            return <circle cx="50" cy="40" r="20" fill="gray" />;
        }
      })()}
    </svg>
  );
};

// Global Configuration
export const CONFIG: Record<string, { tier: string, title: string, desc: string }> = {
  FIRST_WORKOUT: { tier: "IRON", title: "First Blood", desc: "Complete your first workout" },
  WORKOUT_10: { tier: "IRON", title: "Consistent", desc: "Complete 10 workouts" },
  WORKOUT_50: { tier: "GOLD", title: "Dedicated", desc: "Complete 50 workouts" },
  WORKOUT_100: { tier: "DIAMOND", title: "Century Club", desc: "Complete 100 workouts" },
  
  STREAK_7_DAYS: { tier: "IRON", title: "On Fire", desc: "7 workouts in a week" },
  STREAK_30_DAYS: { tier: "GOLD", title: "Unstoppable", desc: "30-day streak" },
  STREAK_100_DAYS: { tier: "DIAMOND", title: "Immortal", desc: "100-day streak" },
  
  PR_HIT: { tier: "GOLD", title: "Record Breaker", desc: "Hit your first PR" },
  LIFT_1000_KG: { tier: "MYTHIC", title: "Heavyweight", desc: "Lift 1,000 kg total in one session" },
  CLUB_100_KG: { tier: "GOLD", title: "100kg Club", desc: "Lift 100kg on a compound lift" },
  
  NIGHT_OWL: { tier: "IRON", title: "Night Owl", desc: "Workout after 10 PM" },
  EARLY_BIRD: { tier: "IRON", title: "Early Bird", desc: "Workout before 6 AM" },
  IRON_STREAK: { tier: "DIAMOND", title: "Iron Will", desc: "Squat, Bench, and Deadlift in one week" },
  
  LEAGUE_PLATINUM: { tier: "RUBY", title: "Platinum Rank", desc: "Reach Platinum League" },
  LEAGUE_GOLD: { tier: "GOLD", title: "Gold Rank", desc: "Reach Gold League" },
  LEAGUE_SILVER: { tier: "IRON", title: "Silver Rank", desc: "Reach Silver League" },
  LEAGUE_BRONZE: { tier: "IRON", title: "Bronze Rank", desc: "Reach Bronze League" },

  SOCIAL_START: { tier: "IRON", title: "Friendly", desc: "Add your first friend" },
  GYM_BRO: { tier: "DIAMOND", title: "Gym Bro", desc: "Add 5 friends" },
  CREATOR: { tier: "RUBY", title: "Creator", desc: "Create a custom exercise" }
};
const ALL_TYPES = Object.keys(CONFIG);

export default function TrophyCaseWidget({
  userAchievements,
}: {
  userAchievements: UserAchievement[];
}) {
  const [pinned, setPinned] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const unlockedMap = new Set(userAchievements.map(a => a.type));

  // Init Pinned State
  useEffect(() => {
    // Avoid double execution on mount cascade
    try {
      const saved = localStorage.getItem("gymTracker_pinnedTrophies");
      
      const unlockedArr = userAchievements.map(a => a.type);
      const rarityRank: Record<string, number> = { MYTHIC: 5, RUBY: 4, DIAMOND: 3, GOLD: 2, IRON: 1 };
      unlockedArr.sort((a, b) => rarityRank[CONFIG[b]?.tier || "IRON"] - rarityRank[CONFIG[a]?.tier || "IRON"]);
      const top3 = unlockedArr.slice(0, 3);
      
      if (saved) {
        const parsed = JSON.parse(saved);
        if (JSON.stringify(pinned) !== JSON.stringify(parsed)) {
          setPinned(parsed);
        }
      } else {
        if (JSON.stringify(pinned) !== JSON.stringify(top3)) {
          setPinned(top3);
        }
      }
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAchievements]);

  if (!pinned) return null;

  const togglePin = (type: string) => {
    if (!unlockedMap.has(type)) return; // Prevents pinning locked items
    let nextPinned = [...pinned];
    if (nextPinned.includes(type)) {
      nextPinned = nextPinned.filter(t => t !== type);
    } else {
      if (nextPinned.length >= 3) nextPinned.pop(); // Remove last one if full
      nextPinned.unshift(type);
    }
    setPinned(nextPinned);
    localStorage.setItem("gymTracker_pinnedTrophies", JSON.stringify(nextPinned));
  };

  return (
    <>
      {/* 
        SMALLER WIDGET FOR PROFILE SCREEN 
        Shows only 3 neatly styled slots. 
      */}
      <div className="bg-[var(--color-white)] rounded-[32px] p-5 shadow-sm border border-[var(--color-indigo-50)] mb-2 flex flex-col items-center relative overflow-hidden">
         
         <div className="w-full flex items-center justify-between mb-4 z-10">
           <div className="flex flex-col">
             <h2 className="font-black text-lg text-[var(--color-slate-800)] pl-2">Display Case</h2>
             <span className="text-[10px] font-bold text-[var(--color-slate-400)] pl-2 uppercase tracking-wide">
               {unlockedMap.size} Unlocked
             </span>
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="text-xs font-bold text-[var(--color-indigo-500)] flex items-center bg-[var(--color-indigo-50)] px-3 py-1.5 rounded-full hover:bg-[var(--color-indigo-100)] active:scale-95 transition-all"
           >
             Manage <ChevronRight size={14} className="ml-1" />
           </button>
         </div>

         {/* 3 Slots */}
         <div className="flex gap-4 w-full justify-around items-end h-28 z-10 px-2 mt-2">
           {[0, 1, 2].map((idx) => {
             const type = pinned[idx];
             if (!type) {
               return (
                 <div key={idx} className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-[var(--color-gray-200)] rounded-2xl opacity-50 cursor-pointer hover:bg-[var(--color-gray-50)] transition-colors" onClick={() => setIsModalOpen(true)}>
                   <PlusCircle size={20} className="text-[var(--color-slate-400)] mb-1"/>
                   <span className="text-[10px] font-bold text-[var(--color-slate-400)]">Empty</span>
                 </div>
               );
             }

             const cfg = CONFIG[type];
             return (
               <motion.div key={idx} whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center w-24 relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
                 {/* Soft glow behind trophy */}
                 <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-indigo-100)] to-transparent opacity-0 group-hover:opacity-100 rounded-full blur-xl transition-opacity"></div>
                 <TrophyFigure tier={cfg.tier} isLocked={false} />
                 <span className="text-[10px] font-black mt-2 text-center text-[var(--color-slate-800)] line-clamp-2 leading-tight">
                    {cfg.title}
                 </span>
               </motion.div>
             );
           })}
         </div>
         {/* Background Decor */}
         <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--color-indigo-50)] rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      </div>

      {/* 
        MODAL - FULL ACHIEVEMENTS LIST
        Scrollable grid to not clog the profile visually. 
      */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[var(--color-gray-50)] rounded-t-[32px] sm:rounded-[32px] w-full max-w-md shadow-2xl flex flex-col h-[85vh] sm:h-[80vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-start p-6 pb-4 bg-[var(--color-white)] rounded-t-[32px] border-b border-[var(--color-gray-100)] sticky top-0 z-20">
                <div>
                  <h3 className="text-2xl font-black text-[var(--color-slate-800)]">Trophy Vault</h3>
                  <p className="text-[11px] text-[var(--color-slate-500)] font-bold mt-1">
                    {unlockedMap.size} of {ALL_TYPES.length} UNLOCKED. TAP TO PIN (MAX 3).
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2.5 bg-[var(--color-gray-100)] text-[var(--color-slate-600)] hover:bg-[var(--color-gray-200)] rounded-full transition-colors active:scale-95">
                  <X size={18} strokeWidth={3} />
                </button>
              </div>

              {/* Scrollable List */}
              <div className="p-4 overflow-y-auto no-scrollbar flex-1 relative bg-[var(--color-white)]">
                <div className="grid grid-cols-2 gap-4 pb-20 mt-2">
                  {ALL_TYPES.map((type) => {
                    const cfg = CONFIG[type];
                    const isLocked = !unlockedMap.has(type);
                    const isPinned = pinned.includes(type);

                    return (
                      <motion.div 
                        key={type}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => togglePin(type)}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all ${
                          isLocked 
                          ? "border-[var(--color-gray-100)] bg-[var(--color-gray-50)] cursor-not-allowed opacity-[0.65]" 
                          : isPinned 
                            ? "border-[var(--color-indigo-500)] bg-white shadow-[0_8px_20px_-8px_var(--color-indigo-300)] cursor-pointer"
                            : "border-[var(--color-gray-100)] bg-white hover:border-[var(--color-indigo-200)] shadow-sm cursor-pointer"
                        }`}
                      >
                        {/* Pinned badge */}
                        {isPinned && (
                          <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 bg-[var(--color-indigo-500)] text-white rounded-full shadow-md z-10 transition-transform">
                            <PlusCircle size={14} className="rotate-45" />
                          </div>
                        )}

                        <div className="relative w-16 h-16 mb-2 flex items-center justify-center">
                          <TrophyFigure tier={cfg.tier} isLocked={isLocked} />
                          {isLocked && (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                               <Lock size={20} className="text-[var(--color-slate-600)] drop-shadow-md bg-white/70 p-1 rounded-full" />
                            </div>
                          )}
                        </div>
                        
                        <h4 className="text-xs font-black text-center mt-1 text-[var(--color-slate-800)] leading-tight">
                          {cfg.title}
                        </h4>
                        {!isLocked && (
                           <div className="mt-1 px-2 py-0.5 bg-[var(--color-gray-100)] rounded-full text-[9px] font-bold text-[var(--color-slate-500)]">
                             {cfg.tier}
                           </div>
                        )}
                        {isLocked && (
                           <p className="text-[9px] font-bold text-center mt-1.5 text-[var(--color-slate-400)] leading-tight px-1">
                             {cfg.desc}
                           </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}