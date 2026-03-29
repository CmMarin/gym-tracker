"use client";
import { Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type FriendActivity = {
  username: string;
  workoutName: string;
};

export default function FriendActivityWidget({ activities }: { activities: FriendActivity[] }) {
  if (activities.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-[var(--color-white)] rounded-3xl p-6 shadow-[0_4px_0_var(--color-theme-shadow)] border-2 border-indigo-50 mb-6"
    >
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Activity className="text-indigo-500" />
        Live Activity
      </h2>
      <div className="space-y-4">
        <AnimatePresence>
          {activities.map((act, i) => (
            <motion.div
              key={act.username}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 bg-gray-50 border-2 border-indigo-50 p-4 rounded-2xl"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <div>
                <p className="text-sm font-bold text-slate-800">{act.username} <span className="text-slate-500 font-normal">is currently doing</span></p>
                <p className="text-md font-black text-indigo-500">{act.workoutName}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
