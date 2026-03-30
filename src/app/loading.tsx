import { Dumbbell } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 animate-in fade-in duration-500">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative flex items-center justify-center w-32 h-32 bg-primary/10 rounded-full animate-pulse">
          <Dumbbell className="w-16 h-16 text-primary animate-bounce shadow-primary" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-white)] dark:text-[var(--color-white)] drop-shadow-md">
          Buff<span className="text-primary">Budies</span>
        </h1>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}