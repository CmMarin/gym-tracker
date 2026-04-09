"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Activity } from "lucide-react";
import { format } from "date-fns";

export type IronGridDay = {
  date: string;
  count: number;
  level: number;
};

export default function IronGridCalendar({ data }: { data: IronGridDay[] }) {
  const [isOpen, setIsOpen] = useState(false);

  // Group data into weeks (7 days per column)
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  // To display the latest days on the right, but keep standard LTR reading
  // we render normally, but our data is 365 days generated back-to-front. 
  // Let's actually reverse the whole weeks array so the oldest week is first (left).
  const displayWeeks = [...weeks].reverse();

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-[var(--color-gray-200)]";
      case 1:
        return "bg-[var(--color-indigo-200)]";
      case 2:
        return "bg-[var(--color-indigo-300)]";
      case 3:
        return "bg-[var(--color-indigo-500)] shadow-sm";
      case 4:
        return "bg-[var(--color-indigo-700)] shadow-md";
      default:
        return "bg-[var(--color-gray-200)]";
    }
  };

  return (
    <div className="bg-[var(--color-white)] rounded-3xl overflow-hidden shadow-[0_4px_0_var(--color-theme-shadow)] border-2 border-indigo-50 mb-4 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 sm:p-6 active:bg-gray-50 focus:outline-none transition-colors"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-2xl shadow-sm">
            <Activity size={24} />
          </div>
          <div className="flex flex-col items-start gap-0.5">
            <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none m-0 p-0">
              Iron Grid
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none m-0 p-0 mt-1">
              365 Days of XP
            </p>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown size={20} className="text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t-2 border-indigo-50"
          >
            <div className="p-5">
              <div
                className="w-full overflow-x-auto pb-4 custom-scrollbar flex items-center justify-end"
                // Using justify-end and a flex container to keep it scrolled to the rightmost (recent) edge if possible
              >
                <div className="flex gap-1.5 min-w-max">
                  {displayWeeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1.5">
                      {week.map((day, dIdx) => (
                        <div
                          key={dIdx}
                          title={`${day.count} XP on ${format(
                            new Date(day.date),
                            "MMM d, yyyy"
                          )}`}
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] shrink-0 transition-opacity duration-200 hover:opacity-75 ${getLevelColor(
                            day.level
                          )}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-1 mr-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Less
                </span>
                <div className="w-3 h-3 rounded-sm bg-[var(--color-gray-200)]" />
                <div className="w-3 h-3 rounded-sm bg-[var(--color-indigo-200)]" />
                <div className="w-3 h-3 rounded-sm bg-[var(--color-indigo-300)]" />
                <div className="w-3 h-3 rounded-sm bg-[var(--color-indigo-500)]" />
                <div className="w-3 h-3 rounded-sm bg-[var(--color-indigo-700)]" />
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  More
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
