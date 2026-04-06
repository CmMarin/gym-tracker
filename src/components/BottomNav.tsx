"use client";

import { Home, Dumbbell, User, Users, LineChart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSounds } from "@/hooks/useAppSounds";

export default function BottomNav() {
  const pathname = usePathname();
  const { playPop } = useAppSounds();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 w-full bg-[var(--color-white)]/85 backdrop-blur-md border-t-2 border-indigo-50 pb-safe z-50">
      <div className="flex justify-around items-center h-20 max-w-xl mx-auto px-4">
        <Link
          href="/dashboard"
          onClick={() => playPop(false)}
          className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
            isActive("/dashboard") ? "text-indigo-500" : "text-slate-400"
          }`}
        >
          <Home size={26} strokeWidth={isActive("/dashboard") ? 3 : 2} />
          <span className="text-[10px] uppercase font-bold mt-1">Home</span>
        </Link>

        <Link
          href="/friends"
          onClick={() => playPop(false)}
          className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
            isActive("/friends") ? "text-indigo-500" : "text-slate-400"
          }`}
        >
          <Users size={26} strokeWidth={isActive("/friends") ? 3 : 2} />
          <span className="text-[10px] uppercase font-bold mt-1">Friends</span>
        </Link>

        {/* Floating Action Button for workout */}
        <div className="relative -top-6 mx-2">
          <Link
            href="/workout"
            onClick={() => playPop(false)}
            className="flex items-center justify-center w-16 h-16 bg-indigo-500 rounded-full shadow-[0_6px_0_0_var(--color-button-shadow)] active:shadow-none active:translate-y-[6px] transition-all text-[var(--color-white)] hover:bg-indigo-400 border-4 border-[var(--color-white)]"
          >
            <Dumbbell size={30} strokeWidth={3} />
          </Link>
        </div>

        <Link
          href="/progress"
          onClick={() => playPop(false)}
          className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
            isActive("/progress") ? "text-indigo-500" : "text-slate-400"
          }`}
        >
          <LineChart size={26} strokeWidth={isActive("/progress") ? 3 : 2} />
          <span className="text-[10px] uppercase font-bold mt-1">Progress</span>
        </Link>

        <Link
          href="/profile"
          onClick={() => playPop(false)}
          className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
            isActive("/profile") ? "text-indigo-500" : "text-slate-400"
          }`}
        >
          <User size={26} strokeWidth={isActive("/profile") ? 3 : 2} />
          <span className="text-[10px] uppercase font-bold mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
}
