"use client";

import { useState } from "react";
import { FolderHeart, Settings } from "lucide-react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import SettingsModal from "@/components/SettingsModal";

const SavedWorkoutsModal = dynamic(() => import("@/components/SavedWorkoutsModal"), { 
  ssr: false,
});

export default function ProfileClient({ savedWorkouts }: { savedWorkouts: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasOpenedModal, setHasOpenedModal] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => { setHasOpenedModal(true); setIsModalOpen(true); }}
        className="w-full bg-[var(--color-white)] rounded-3xl p-6 shadow-[0_4px_0_var(--color-button-shadow)] border-2 border-[var(--color-gray-100)] mb-4 active:shadow-none active:translate-y-1 transition-all flex items-center justify-between group cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[var(--color-indigo-100)] text-[var(--color-indigo-500)] rounded-2xl group-hover:scale-110 transition-transform">
            <FolderHeart size={28} />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-black text-[var(--color-slate-800)]">Saved Routines</h2>
            <p className="text-[var(--color-slate-500)] font-medium text-sm">{savedWorkouts.length} templates</p>
          </div>
        </div>
        <div className="bg-[var(--color-gray-50)] text-[var(--color-slate-500)] font-bold px-3 py-1 rounded-xl">
          View
        </div>
      </motion.button>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => setIsSettingsOpen(true)}
        className="w-full bg-[var(--color-white)] rounded-3xl p-6 shadow-[0_4px_0_var(--color-button-shadow)] border-2 border-[var(--color-gray-100)] mb-8 active:shadow-none active:translate-y-1 transition-all flex items-center justify-between group cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[var(--color-indigo-100)] text-[var(--color-indigo-500)] rounded-2xl group-hover:scale-110 transition-transform">
            <Settings size={28} />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-black text-[var(--color-slate-800)]">Settings</h2>
            <p className="text-[var(--color-slate-500)] font-medium text-sm">Theme, notifications, and more</p>
          </div>
        </div>
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mt-12 mb-6"
      >
        <p className="text-[var(--color-slate-400)] font-medium text-sm">v0.1.0</p>
      </motion.div>

      {hasOpenedModal && (
        <SavedWorkoutsModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          savedWorkouts={savedWorkouts}
        />
      )}

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
