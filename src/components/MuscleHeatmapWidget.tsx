"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Activity } from "lucide-react";

// Dynamically import react-body-highlighter to avoid SSR issues
const Model = dynamic(() => import("react-body-highlighter").then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center text-slate-400 font-medium bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
      Loading body map...
    </div>
  )
});

export default function MuscleHeatmapWidget({ fatigueData }: { fatigueData: Record<string, number> }) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"anterior" | "posterior">("anterior");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Let's generate data for react-body-highlighter
  // react-body-highlighter expects an array of exercises:
  // e.g. [{ name: 'High Fatigue', muscles: ['chest', 'triceps'] }, { name: 'Med Fatigue', ... }]
  // However, `react-body-highlighter` colors are static for standard usage where you specify one color, 
  // wait, or you can map an array of data and an array of colors?
  // Checking typical react-body-highlighter usage over different colors per muscle.
  // Actually, wait, react-body-highlighter `data` is `IExerciseData[]`.
  // It computes frequency of muscles within the `data` array and automatically assigns
  // graduated colors from `highlightedColors` array. So the more an exercise targets a muscle 
  // (or the more it appears), it progresses through the color palette!
  //
  // Let's construct a mock array where muscles appear multiple times to build "frequency".
  // E.g. if load is 10, add that muscle 10 times in dummy exercises.

  const mockData: any[] = [];
  
  Object.keys(fatigueData).forEach((muscle) => {
    const rawLoad = Math.round(fatigueData[muscle] || 0);
    if (rawLoad > 0) {
      mockData.push({
        name: `${muscle} Load`,
        muscles: [muscle],
        frequency: rawLoad // Uses frequency correctly instead of mapping multiple times
      });
    }
  });

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_4px_0_theme(colors.gray.200)] border-2 border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
            <Activity size={24} className="stroke-[3]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Muscle Recovery</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Fatigue Heatmap</p>
          </div>
        </div>
        <button 
          onClick={() => setView(view === "anterior" ? "posterior" : "anterior")}
          className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl active:scale-95 transition-transform"
        >
          Turn {view === "anterior" ? "Back" : "Front"}
        </button>
      </div>

      <div className="w-full flex justify-center">
        <Model
          data={mockData}
          style={{ width: "16rem", padding: "1rem" }}
          type={view}
          // Highlight palette: Light green -> Yellow -> Orange -> Red
          highlightedColors={["#a7f3d0", "#fef08a", "#fbbf24", "#f97316", "#ef4444", "#b91c1c"]}
        />
      </div>
      
      <div className="flex justify-between items-center px-4 mt-6 text-xs font-bold text-slate-500 uppercase">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-200"></div> Fresh
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400"></div> Active
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500"></div> Fatigued
        </div>
      </div>
    </div>
  );
}
