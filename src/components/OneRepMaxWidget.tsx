"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type OneRMData = {
  exercise: string;
  data: { date: string; oneRM: number }[];
};

export default function OneRepMaxWidget({ compoundData }: { compoundData: OneRMData[] }) {
  const [selectedExercise, setSelectedExercise] = useState<string>(
    compoundData.length > 0 ? compoundData[0].exercise : ""
  );

  if (!compoundData || compoundData.length === 0) return null;

  const currentData = compoundData.find((d) => d.exercise === selectedExercise)?.data || [];

  return (
    <div className="w-full bg-[var(--color-white)] rounded-3xl p-6 shadow-[0_4px_0_var(--color--)] border-2 border-indigo-50 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <Activity className="mr-2 text-rose-500" size={24} />
          Estimated 1RM
        </h2>
        
        {compoundData.length > 1 && (
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="bg-gray-100 text-slate-700 font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500 text-sm"
          >
            {compoundData.map((d) => (
              <option key={d.exercise} value={d.exercise}>
                {d.exercise}
              </option>
            ))}
          </select>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedExercise}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="h-48 w-full -ml-4"
        >
          {currentData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData}>
                <defs>
                  <linearGradient id="color1RM" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-rose-500)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-rose-500)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--color-slate-500)" }} tickLine={false} axisLine={false} />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                <Tooltip
                  contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", backgroundColor: "var(--color-white)" }}
                  labelStyle={{ fontWeight: "bold", color: "var(--color-slate-800)" }}
                  itemStyle={{ color: "var(--color-rose-500)", fontWeight: "bold" }}
                  formatter={(value: any) => [`${value} kg`, "Est. 1RM"]}
                />
                <Area type="monotone" dataKey="oneRM" stroke="var(--color-rose-500)" strokeWidth={3} fillOpacity={1} fill="url(#color1RM)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 font-medium">
              Not enough data.
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
