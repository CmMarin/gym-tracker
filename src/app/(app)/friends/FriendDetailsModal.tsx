"use client";
/* eslint-disable @next/next/no-img-element */

import { motion } from "framer-motion";
import { X, Trophy, Dumbbell, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { TrophyFigure, CONFIG as TROPHY_CONFIG } from "@/components/TrophyCaseWidget";

export default function FriendDetailsModal({
  friendId,
  onClose 
}: {
  friendId: string;
  onClose: () => void
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFriendDetails() {
      try {
        const res = await fetch(`/api/user/profile?userId=${friendId}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchFriendDetails();
  }, [friendId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 50, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 50, scale: 0.95 }}
        className="bg-[var(--color-white)] w-full max-w-md rounded-3xl overflow-hidden relative max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header - Fixed */}
        <div className="bg-[var(--color-white)] p-6 border-b-2 border-indigo-50 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <h2 className="text-xl font-black text-slate-800">Profile</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto no-scrollbar p-6 space-y-6 bg-gray-50">
          {loading ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-32 h-4 rounded-full bg-gray-200 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 rounded-2xl bg-gray-200 animate-pulse" />
                <div className="h-16 rounded-2xl bg-gray-200 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 rounded-full bg-gray-200 animate-pulse w-32" />
                <div className="h-12 rounded-2xl bg-gray-200 animate-pulse" />
                <div className="h-12 rounded-2xl bg-gray-200 animate-pulse" />
              </div>
            </div>
          ) : !data ? (
             <div className="text-center text-slate-500 py-8">Failed to load profile</div>
          ) : (
            <>
              {/* Top Section */}
              <div className="flex flex-col items-center mb-6">
                {data.image ? (
                  <img src={data.image} alt={data.username} className="w-24 h-24 rounded-full border-4 border-indigo-50 shadow-lg object-cover" />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full mx-auto flex items-center justify-center border-4 border-[var(--color-white)] shadow-lg text-[var(--color-white)] font-black text-3xl">
                    {data.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="text-2xl font-black text-slate-800 mt-3 mb-1">{data.username}</h3>
                <div className="flex gap-3 mt-2 flex-wrap justify-center">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-xl text-sm font-bold">
                    Lvl {Math.floor(data.xp / 1000) + 1}
                  </span>
                  {data.streakDays > 0 && (
                    <span className="flex items-center text-sm font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-xl">
                      <Flame size={16} className="mr-1" />
                        {data.streakDays} Wk Streak
                    </span>
                  )}
                  {data.leaderboardRank && data.weeklyXp > 0 && (
                    <span className="flex items-center text-sm font-bold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-xl">
                      <Trophy size={16} className="mr-1" />
                      #{data.leaderboardRank} Rank
                    </span>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--color-white)] rounded-2xl p-4 border-2 border-indigo-50">
                  <div className="text-slate-500 text-sm font-bold mb-1 flex items-center gap-2">
                    <Dumbbell size={16} /> Workouts
                  </div>
                  <div className="text-2xl font-black text-slate-800">{data.totalWorkouts || 0}</div>
                </div>
                <div className="bg-[var(--color-white)] rounded-2xl p-4 border-2 border-indigo-50">
                  <div className="text-slate-500 text-sm font-bold mb-1 flex items-center gap-2">
                    <Trophy size={16} /> Total XP
                  </div>
                  <div className="text-2xl font-black text-slate-800">{data.xp}</div>
                </div>
              </div>

              {/* Best Achievements */}
              <div>
                <h4 className="font-black text-slate-800 mb-3 flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-500" /> Top Achievements
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {data.achievements && data.achievements.length > 0 ? (
                    data.achievements
                      .sort((a: any, b: any) => {
                        const rarityRank: Record<string, number> = { MYTHIC: 5, RUBY: 4, DIAMOND: 3, GOLD: 2, IRON: 1 };
                        return (rarityRank[TROPHY_CONFIG[b.type]?.tier || "IRON"] || 0) - (rarityRank[TROPHY_CONFIG[a.type]?.tier || "IRON"] || 0);
                      })
                      .slice(0, 3)
                      .map((ach: any) => {
                        const cfg = TROPHY_CONFIG[ach.type];
                        if (!cfg) return null;
                        
                        return (
                          <div key={ach.id} className="bg-[var(--color-white)] p-2 rounded-2xl border border-[var(--color-indigo-100)] flex flex-col items-center justify-center shadow-sm">
                            <div className="relative w-12 h-12 flex items-center justify-center">
                              <TrophyFigure tier={cfg.tier} isLocked={false} />
                            </div>
                            <div className="font-black text-[10px] text-center text-slate-800 mt-1 leading-tight line-clamp-2">
                              {cfg.title}
                            </div>
                            <div className="text-[8px] font-bold text-slate-400 mt-0.5">
                              {new Date(ach.achievedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                      );
                    })
                  ) : (
                    <div className="col-span-3 text-sm text-slate-500 font-medium py-2">No achievements yet.</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
