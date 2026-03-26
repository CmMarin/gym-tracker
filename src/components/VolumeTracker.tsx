"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function VolumeTracker({ data }: { data: { date: string, volume: number }[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white rounded-3xl p-6 shadow-[0_4px_0_theme(colors.gray.200)] border-2 border-gray-100 mb-8"
    >
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
        <Activity className="mr-2 text-indigo-500" size={24} />
        Total Volume (kg)
      </h2>

      {data.length > 0 ? (
        <div className="h-48 w-full -ml-4 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-indigo-500)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-indigo-500)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{fontSize: 12, fill: 'var(--color-slate-500)'}} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-white)' }}
                labelStyle={{ fontWeight: 'bold', color: 'var(--color-slate-800)' }}
                itemStyle={{ color: 'var(--color-indigo-500)', fontWeight: 'bold' }}
                formatter={(value: any) => [`${value} kg`, 'Volume']}
              />
              <Area type="monotone" dataKey="volume" stroke="var(--color-indigo-500)" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-center text-slate-500 font-medium py-8">No volume data yet. Go do some workouts!</p>
      )}
    </motion.div>
  );
}
