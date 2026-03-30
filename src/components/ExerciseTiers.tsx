"use client";

import { Trophy } from "lucide-react";

const getTierInfo = (name: string, weight: number) => {
  const tiers = [
    { name: "Wood", max: 20 },
    { name: "Bronze", max: 40 },
    { name: "Iron", max: 60 },
    { name: "Gold", max: 80 },
    { name: "Diamond", max: 120 },
    { name: "Titan", max: 9999 },
  ];

  let currentTier = tiers[0];
  let previousMax = 0;
  let nextMax = 20;

  for (let i = 0; i < tiers.length; i++) {
    if (weight < tiers[i].max) {
      currentTier = tiers[i];
      nextMax = tiers[i].max;
      previousMax = i > 0 ? tiers[i - 1].max : 0;
      break;
    }
  }

  if (currentTier.name === "Titan") {
    return { tier: "Titan", current: weight, target: weight, progress: 100 };
  }

  const range = nextMax - previousMax;
  const progressWithinRange = weight - previousMax;
  const progressPercent = Math.max(
    5,
    Math.min(100, Math.round((progressWithinRange / range) * 100)),
  );

  return {
    tier: currentTier.name,
    current: weight,
    target: nextMax,
    progress: progressPercent,
  };
};

export default function ExerciseTiers({
  prs,
}: {
  prs: { name: string; maxWeight: number }[];
}) {
  if (!prs || prs.length === 0) return null;

  return (
    <div className="w-full mb-8">
      <h2 className="text-xl font-black text-[var(--color-slate-800)] mb-4 flex items-center gap-2">
        <Trophy className="text-[var(--color-slate-500)]" />
        Power Tiers
      </h2>
      <div className="flex flex-col gap-4">
        {prs.map((pr) => {
          const info = getTierInfo(pr.name, pr.maxWeight);
          return (
            <div
              key={pr.name}
              className="bg-[var(--color-white)] rounded-3xl p-5 border-2 border-[var(--color-indigo-100)] shadow-[0_4px_0_var(--color-indigo-100)] relative overflow-hidden"
            >
              <div className="flex justify-between items-center z-10 relative">
                <span className="font-bold text-[var(--color-slate-800)]">
                  {pr.name}
                </span>
                <span className="font-black uppercase text-sm text-[var(--color-indigo-700)] px-2 py-1 bg-[var(--color-indigo-100)] rounded-xl">
                  {info.tier} {pr.maxWeight}kg
                </span>
              </div>

              <div className="flex justify-between items-center mt-3 mb-1 px-1">
                <span className="text-xs font-bold text-[var(--color-slate-500)]">
                  {info.current} {info.tier === "Titan" ? "kg" : ""}
                </span>
                {info.tier !== "Titan" && (
                  <span className="text-xs font-bold text-[var(--color-slate-500)]">
                    {info.target} kg to next
                  </span>
                )}
              </div>
              <div className="h-3 w-full bg-[var(--color-gray-100)] rounded-full overflow-hidden z-10 relative shadow-inner border border-[var(--color-gray-200)]">
                <div
                  className="h-full bg-[var(--color-indigo-400)] rounded-full transition-all duration-1000"
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
