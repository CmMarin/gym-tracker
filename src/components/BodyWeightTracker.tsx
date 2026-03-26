"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { addBodyWeightLog } from "@/app/actions/profile-actions";
import { Scale, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function BodyWeightTracker({ data }: { data: { weight: number, date: string }[] }) {
  const [weightStr, setWeightStr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const w = parseFloat(weightStr);
    if (!w || isNaN(w)) return;
    setLoading(true);
    await addBodyWeightLog(w);
    setWeightStr("");
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-[0_4px_0_theme(colors.gray.200)] border-2 border-gray-100 mb-8">
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
        <Scale className="mr-2 text-indigo-500" size={24} />
        Body Weight
      </h2>

      <div className="flex gap-2 mb-6">
        <input
          type="number"
          step="0.1"
          placeholder="Enter weight (kg)"
          value={weightStr}
          onChange={(e) => setWeightStr(e.target.value)}
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-indigo-500 hover:opacity-90 text-white p-3 rounded-2xl font-bold shadow-[0_4px_0_theme(colors.indigo.200)] active:shadow-none active:translate-y-1 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      {data.length > 0 ? (
        <div className="h-48 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-indigo-500)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-indigo-500)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{fontSize: 12, fill: 'var(--color-slate-500)'}} tickLine={false} axisLine={false} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
              <Tooltip
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-white)' }}
                labelStyle={{ fontWeight: 'bold', color: 'var(--color-slate-800)' }}
                itemStyle={{ color: 'var(--color-indigo-500)' }}
              />
              <Area type="monotone" dataKey="weight" stroke="var(--color-indigo-500)" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-center text-slate-500 font-medium py-8">No weight data yet.</p>
      )}
    </div>
  );
}
