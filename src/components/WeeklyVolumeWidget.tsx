"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

export default function WeeklyVolumeWidget({ initData }: { initData: any[] }) {
  const [data, setData] = useState(initData);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Vibrant game-like colors
  const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f43f5e", "#f59e0b", "#f97316", "#14b8a6", "#06b6d4"];

  return (
    <div className="bg-[var(--color-white)] rounded-3xl p-6 shadow-[0_4px_0_var(--color-theme-shadow)] border-2 border-indigo-50 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
          <PieChartIcon size={24} className="stroke-[3]" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800">Weekly Muscle Volume</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Measured in Sets</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 font-medium bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          No workouts logged this week
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend 
                iconType="circle"
                wrapperStyle={{ 
                  fontFamily: 'inherit',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
