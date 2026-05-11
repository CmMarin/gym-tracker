"use client";

import { motion } from "framer-motion";
import { Timer } from "lucide-react";
import NumberTicker from "@/components/NumberTicker";

type RestTimerPanelProps = {
  restTimeLeft: number;
  setRestTimeLeft: (updateFn: any) => void;
  onSkipRest: () => void;
};

export default function RestTimerPanel({
  restTimeLeft,
  setRestTimeLeft,
  onSkipRest,
}: RestTimerPanelProps) {
  return (
    <motion.div
      key="rest-timer-panel"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[var(--color-white)] p-8 rounded-[2rem] shadow-xl w-full max-w-md border-b-4 border-gray-200 flex flex-col items-center"
    >
      <Timer size={64} className="text-indigo-500 mb-6" />
      <h2 className="text-3xl font-extrabold text-[var(--color-slate-800)] mb-2 text-center">
        Rest Timer
      </h2>
      <div className="text-7xl font-black text-[var(--color-slate-700)] mb-10 tabular-nums tracking-tighter flex items-center justify-center">
        <NumberTicker value={Math.floor(restTimeLeft / 60)} />:
        <NumberTicker
          value={(restTimeLeft % 60).toString().padStart(2, "0")}
        />
      </div>

      <div className="flex w-full gap-4">
        <button
          onClick={() => setRestTimeLeft((prev: any) => (prev || 0) + 10)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold text-xl py-5 rounded-2xl transition-all"
        >
          +10s
        </button>
        <button
          onClick={onSkipRest}
          className="flex-[2] bg-indigo-500 hover:bg-indigo-400 text-[var(--color-white)] font-black text-xl py-5 rounded-2xl shadow-[0_6px_0_0_var(--color-indigo-600)] active:translate-y-[6px] active:shadow-none transition-all flex justify-center items-center gap-2"
        >
          <span>SKIP REST</span>
        </button>
      </div>
    </motion.div>
  );
}
