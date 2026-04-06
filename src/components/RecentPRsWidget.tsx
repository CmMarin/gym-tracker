"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ChevronDown, Flame } from "lucide-react";
import { useAppSounds } from "@/hooks/useAppSounds";
import { sendHypeNotification } from "@/app/actions/profile-actions";

function HypeButton({ isMe, targetUserId, prExercise }: { isMe: boolean, targetUserId: string, prExercise: string }) {
  const [hyped, setHyped] = useState(false);
  const { playDing } = useAppSounds();

  if (isMe) {
    return (
      <div className="p-2 rounded-xl bg-[var(--color-indigo-50)] text-[var(--color-indigo-400)]" title="Your PR!">
        <Flame size={20} />
      </div>
    );
  }

  return (
    <button
      onClick={async (e) => {
        e.stopPropagation();
        if (!hyped) {
          setHyped(true);
          playDing();
          await sendHypeNotification(targetUserId, prExercise);
        }
      }}
      disabled={hyped}
      className={`p-2 rounded-xl transition-all flex items-center justify-center ${
        hyped
          ? "bg-[var(--color-rose-100)] text-[var(--color-rose-500)] scale-110"
          : "bg-[var(--color-gray-100)] text-[var(--color-slate-400)] hover:text-[var(--color-rose-400)]"
      } active:scale-95`}
      title="Hype this PR!"
    >
      <Flame size={20} className={hyped ? "animate-pulse" : ""} />
    </button>
  );
}

export default function RecentPRsWidget({ prs }: { prs: any[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!prs || prs.length === 0) return null;

  const displayedPrs = isExpanded ? prs : prs.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[var(--color-white)] rounded-[2rem] p-6 shadow-sm border-2 border-[var(--color-indigo-50)] w-full max-w-md"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-[var(--color-slate-800)] flex items-center gap-2">
          <Trophy className="text-[var(--color-indigo-500)]" />
          Recent PRs
          <span className="bg-[var(--color-indigo-100)] text-[var(--color-indigo-700)] text-xs px-2 py-1 rounded-xl block ml-2">
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
              className="flex items-center justify-between p-4 rounded-2xl border-2 border-[var(--color-indigo-50)] bg-[var(--color-gray-50)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg bg-[var(--color-indigo-100)] text-[var(--color-indigo-600)]">
                  {pr.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--color-slate-800)]">
                      {pr.isMe ? "You" : pr.username}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[var(--color-slate-500)]">
                    {pr.exercise}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-black text-[var(--color-slate-800)] text-lg">
                    {pr.weight}kg
                  </div>
                  <div className="text-xs font-bold text-[var(--color-slate-400)]">
                    {pr.reps} reps
                  </div>
                </div>
                <HypeButton isMe={pr.isMe} targetUserId={pr.userId} prExercise={pr.exercise} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {prs.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 w-full py-3 bg-[var(--color-gray-50)] rounded-2xl font-bold text-[var(--color-slate-500)] hover:text-[var(--color-slate-800)] transition-colors flex items-center justify-center gap-2"
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
