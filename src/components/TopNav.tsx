"use client";

import { useSession } from "next-auth/react";
import { Flame, Zap, Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TopNav() {
  const { data: session } = useSession();
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // In a real app this would use SWR or React Query, but we will simply fetch the authenticated users latest stats
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/user/stats`);
        if (res.ok) {
          const data = await res.json();
          setXp(data.xp);
          setStreak(data.streakDays);
          setUnreadCount(data.unreadNotifications || 0);
        }
      } catch {
        // Handle error silently or log if needed
      }
    };
    
    if (session) {
       fetchStats();
    }

    // Listen for custom event to refetch when stats update
    window.addEventListener('user-stats-updated', fetchStats);
    return () => window.removeEventListener('user-stats-updated', fetchStats);
  }, [session]);

  

  return (
    <div className="sticky top-0 z-50 w-full bg-[var(--color-white)] border-b-2 border-indigo-50 flex items-center justify-between px-4 py-3 shadow-sm">
      <Link href="/dashboard" className="font-black text-xl text-slate-800 tracking-tight">
        Buff<span className="text-indigo-500">Buddies</span>
      </Link>

      <div className="flex items-center space-x-3">
        <Link href="/notifications" className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell size={24} strokeWidth={2.5} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[var(--color-white)]"></span>
          )}
        </Link>

        <div className="flex items-center text-orange-500 font-bold">
          <Flame fill="currentColor" size={24} className="mr-1" />
          <span className="text-lg">{streak}</span>
        </div>
        
        <div className="flex items-center text-indigo-500 font-bold bg-indigo-50 px-3 py-1 rounded-xl border-2 border-indigo-100">
          <Zap fill="currentColor" size={20} className="mr-1 text-yellow-400" />
          <span>{xp}</span>
        </div>
      </div>
    </div>
  );
}
