import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center p-6 space-y-8 pb-32 animate-pulse">
      {/* Competition Dashboard Skeleton */}
      <div className="w-full max-w-md bg-zinc-900/50 rounded-xl p-6 h-64 border border-zinc-800" />
      
      {/* Active Workout Skeleton */}
      <div className="w-full max-w-md bg-zinc-900/50 rounded-xl p-6 h-28 border border-zinc-800" />
      
      {/* Friend Activity Skeleton */}
      <div className="w-full max-w-md bg-zinc-900/50 rounded-xl p-6 h-48 border border-zinc-800" />
      
      {/* Recent PRs Skeleton */}
      <div className="w-full max-w-md bg-zinc-900/50 rounded-xl p-6 h-64 border border-zinc-800" />
      
      {/* Friends Widget Skeleton */}
      <div className="w-full max-w-md bg-zinc-900/50 rounded-xl p-6 h-32 border border-zinc-800" />
    </div>
  );
}