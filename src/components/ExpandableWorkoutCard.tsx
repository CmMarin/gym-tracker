'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { deleteWorkoutPlan } from '@/app/actions/profile-actions';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type Plan = {
  id: string;
  name: string;
  dayOfWeek: number | null;
  exercises: { id: string; name: string; targetSets: number; targetReps: number }[];
};

export default function ExpandableWorkoutCard({ plan }: { plan: Plan }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const executeDelete = async (toastId: string) => {
    toast.dismiss(toastId);
    setIsDeleting(true);
    const res = await deleteWorkoutPlan(plan.id);
    setIsDeleting(false);
    if (res?.success) {
      toast.success("Routine deleted.");
      router.refresh();
    } else {
      toast.error("Failed to delete routine.");
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-[var(--color-slate-800)]">
          Delete the routine "{plan.name}"?
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1.5 bg-[var(--color-gray-100)] text-[var(--color-slate-600)] font-bold rounded-lg text-sm hover:bg-[var(--color-gray-200)]"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 bg-[var(--color-indigo-500)] text-[var(--color-white)] font-bold rounded-lg text-sm hover:bg-[var(--color-indigo-600)]"
            onClick={() => executeDelete(t.id)}
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  if (isDeleting) return null;

  return (
    <div className="rounded-xl bg-[var(--color-gray-50)] border-2 border-[var(--color-indigo-50)] overflow-hidden">
      <div className="w-full p-2 pr-4 flex justify-between items-center group">
        <button onClick={() => setIsOpen(!isOpen)} className="flex-1 text-left p-2 rounded-lg hover:bg-[var(--color-gray-100)] transition-colors focus:outline-none">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-[var(--color-slate-800)]">{plan.name}</h3>
              {plan.dayOfWeek && (
                <span className="text-xs font-bold bg-[var(--color-indigo-100)] text-[var(--color-indigo-700)] px-2 py-1 rounded-lg shrink-0 border border-[var(--color-indigo-200)]">
                  Day {plan.dayOfWeek}
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--color-slate-500)] font-medium">
              {plan.exercises.length} exercises
            </p>
          </div>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDelete}
            className="p-2 text-[var(--color-slate-400)] hover:text-[var(--color-indigo-500)] hover:bg-[var(--color-indigo-50)] rounded-lg transition-colors"
            title="Delete Routine"
          >
            <Trash2 size={18} />
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="text-[var(--color-slate-400)] p-2 hover:bg-[var(--color-gray-100)] rounded-lg">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t-2 border-[var(--color-indigo-50)]"
          >
            <div className="p-4 space-y-2">
              {plan.exercises.map((ex, index) => (
                <div key={ex.id} className="flex justify-between items-center text-sm p-3 rounded-lg border-b border-[var(--color-gray-100)] last:border-b-0 hover:bg-[var(--color-gray-100)] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--color-slate-400)] font-bold w-4">{index + 1}.</span>
                    <span className="font-medium text-[var(--color-slate-700)]">{ex.name}</span>
                  </div>
                  <span className="text-[var(--color-slate-500)] font-medium bg-[var(--color-gray-100)] px-2 py-1 rounded-md">
                    {ex.targetSets}x{ex.targetReps}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
