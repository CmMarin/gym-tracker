import { Dumbbell } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 space-y-8 animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center w-28 h-28 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-[2rem] animate-pulse">
        <Dumbbell className="w-12 h-12 text-indigo-500 animate-bounce shadow-indigo-500" strokeWidth={2.5} />
      </div>
      <div className="flex space-x-3">
        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
      </div>
      <div className="w-full max-w-md space-y-4 mt-8 opacity-50">
        <div className="w-full bg-gray-200 dark:bg-zinc-800/80 rounded-2xl h-32 animate-pulse" />
        <div className="w-full bg-gray-200 dark:bg-zinc-800/80 rounded-2xl h-48 animate-pulse" />
      </div>
    </div>
  );
}
