"use client";

import { Trophy } from "lucide-react";

const getTierInfo = (name: string, weight: number) => {
  // Simple heuristic for demo. Real logic depends on exercise standards per weight class
  if (weight < 20) return { tier: "Wood", color: "text-amber-800", bg: "bg-amber-100", border: "border-amber-900", progress: 20 };
  if (weight < 40) return { tier: "Bronze", color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-600", progress: 40 };
  if (weight < 60) return { tier: "Iron", color: "text-slate-500", bg: "bg-gray-200", border: "border-slate-500", progress: 60 };
  if (weight < 80) return { tier: "Gold", color: "text-yellow-500", bg: "bg-yellow-100", border: "border-yellow-500", progress: 80 };
  if (weight < 120) return { tier: "Diamond", color: "text-cyan-500", bg: "bg-cyan-100", border: "border-cyan-500", progress: 95 };
  return { tier: "Titan", color: "text-red-600", bg: "bg-red-100", border: "border-red-600", progress: 100 };
};

export default function ExerciseTiers({ prs }: { prs: { name: string; maxWeight: number }[] }) {
  if (!prs || prs.length === 0) return null;

  return (
    <div className="w-full mb-8">
      <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
        <Trophy className="text-yellow-500" />
        Power Tiers
      </h2>
      <div className="flex flex-col gap-4">
        {prs.map(pr => {
          const info = getTierInfo(pr.name, pr.maxWeight);
          return (
            <div key={pr.name} className={`bg-white rounded-3xl p-5 border-2 ${info.border} shadow-[0_4px_0_theme(colors.gray.200)] relative overflow-hidden`}>
              <div className="flex justify-between items-center mb-2 z-10 relative">
                <span className="font-bold text-slate-800">{pr.name}</span>
                <span className={`font-black uppercase text-sm ${info.color} px-2 py-1 ${info.bg} rounded-xl`}>
                  {info.tier} {pr.maxWeight}kg
                </span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mt-3 z-10 relative">
                <div
                  className={`h-full ${info.bg.replace('100', '400')} rounded-full transition-all duration-1000`}
                  style={{ width: `${info.progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
