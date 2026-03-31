"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ChevronDown } from "lucide-react";

export default function RecentPRsWidget({ prs }: { prs: any[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!prs || prs.length === 0) return null;

  const displayedPrs = isExpanded ? prs : prs.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[var(--color-white)] rounded-[2rem] p-6 shadow-sm border-2 border-indigo-50 w-full max-w-md"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Trophy className="text-yellow-500" />
          Recent PRs
          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-xl block ml-2">
            {prs.length} Total
          </span>
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {displayedPrs.map((pr) => (
            <motion.div
              key={pr.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between p-4 rounded-2xl border-2 border-indigo-50 bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg bg-yellow-100 text-yellow-600">
                  {pr.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {pr.isMe ? "You" : pr.username}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-500">
                    {pr.exercise}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-slate-800 text-lg">
                  {pr.weight}kg
                </div>
                <div className="text-xs font-bold text-slate-400">
                  {pr.reps} reps
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {prs.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 w-full py-3 bg-gray-50 rounded-2xl font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            {isExpanded ? (
              <>
                Show Less{" "}
                <ChevronDown
                  className="rotate-180 transition-transform"
                  size={18}
                />
              </>
            ) : (
              <>
                View All ({prs.length}) <ChevronDown size={18} />
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
