"use client";

import { useSession } from "next-auth/react";
import { Flame, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TopNav() {
  const { data: session } = useSession();
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // In a real app this would use SWR or React Query, but we will simply fetch the authenticated users latest stats
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/user/stats`);
        if (res.ok) {
          const data = await res.json();
          setXp(data.xp);
          setStreak(data.streakDays);
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

  if (!session) return null;

  return (
    <div className="sticky top-0 z-50 w-full bg-white border-b-2 border-gray-100 flex items-center justify-between px-4 py-3 shadow-sm">
      <Link href="/dashboard" className="font-black text-xl text-slate-800 tracking-tight">
        gym<span className="text-blue-500">tracker</span>
      </Link>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center text-orange-500 font-bold">
          <Flame fill="currentColor" size={24} className="mr-1" />
          <span className="text-lg">{streak}</span>
        </div>
        
        <div className="flex items-center text-blue-500 font-bold bg-blue-50 px-3 py-1 rounded-xl border-2 border-blue-100">
          <Zap fill="currentColor" size={20} className="mr-1 text-yellow-400" />
          <span>{xp}</span>
        </div>
      </div>
    </div>
  );
}
