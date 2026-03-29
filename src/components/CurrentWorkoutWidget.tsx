import Link from "next/link";
import { Play } from "lucide-react";

export default function CurrentWorkoutWidget({ workoutName }: { workoutName: string }) {
  return (
    <div className="w-full max-w-md bg-indigo-500 rounded-3xl p-6 shadow-[0_4px_0_var(--color--)] text-[var(--color-white)] flex flex-col sm:flex-row justify-between items-center gap-4">
      <div>
        <h2 className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-1">In Progress</h2>
        <p className="text-xl font-black">{workoutName}</p>
      </div>
      <Link href="/workout" className="bg-[var(--color-white)] text-indigo-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-2xl shadow-[0_4px_0_var(--color--)] transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
        <Play fill="currentColor" size={16} /> RESUME
      </Link>
    </div>
  );
}
