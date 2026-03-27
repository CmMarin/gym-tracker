"use client";

import { useState } from "react";
import { FolderHeart, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import dynamic from "next/dynamic";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { motion } from "framer-motion";

const SavedWorkoutsModal = dynamic(() => import("@/components/SavedWorkoutsModal"), { 
  ssr: false,
});

export default function ProfileClient({ savedWorkouts }: { savedWorkouts: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasOpenedModal, setHasOpenedModal] = useState(false);

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => { setHasOpenedModal(true); setIsModalOpen(true); }}
        className="w-full bg-white rounded-3xl p-6 shadow-[0_4px_0_theme(colors.gray.200)] border-2 border-gray-100 mb-4 active:shadow-none active:translate-y-1 transition-all flex items-center justify-between group cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-pink-100 text-pink-500 rounded-2xl group-hover:scale-110 transition-transform">
            <FolderHeart size={28} />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-black text-slate-800">Saved Routines</h2>
            <p className="text-slate-500 font-medium text-sm">{savedWorkouts.length} templates</p>
          </div>
        </div>
        <div className="bg-gray-50 text-slate-500 font-bold px-3 py-1 rounded-xl">
          View
        </div>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ThemeSwitcher />
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full bg-white rounded-3xl p-6 shadow-[0_4px_0_theme(colors.gray.200)] border-2 border-gray-100 mb-8 active:shadow-none active:translate-y-1 transition-all flex items-center justify-between group cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-500 rounded-2xl group-hover:scale-110 transition-transform">
            <LogOut size={28} />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-black text-red-500">Log Out</h2>
            <p className="text-slate-500 font-medium text-sm">Sign out of your account</p>
          </div>
        </div>
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center mt-12 mb-6"
      >
        <p className="text-gray-400 font-medium text-sm">v0.1.0</p>
      </motion.div>

      {hasOpenedModal && (
        <SavedWorkoutsModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          savedWorkouts={savedWorkouts}
        />
      )}
    </>
  );
}
