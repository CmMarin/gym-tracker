import React from 'react';

export default function ProgressLoading() {
  return (
    <div className="flex flex-col items-center p-6 space-y-6 pb-24 w-full max-w-lg mx-auto animate-pulse">
      <div className="w-full bg-zinc-900/50 rounded-xl p-6 h-64 border border-zinc-800" />
      <div className="w-full bg-zinc-900/50 rounded-xl p-6 h-64 border border-zinc-800" />
      <div className="w-full bg-zinc-900/50 rounded-xl p-6 h-48 border border-zinc-800" />
      <div className="w-full bg-zinc-900/50 rounded-xl p-6 h-96 border border-zinc-800" />
    </div>
  );
}