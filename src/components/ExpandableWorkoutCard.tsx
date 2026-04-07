'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Trash2, Edit2, Share2 } from 'lucide-react';
import { deleteWorkoutPlan } from '@/app/actions/profile-actions';
import { createWorkoutBlueprint } from '@/app/actions/blueprint-actions';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type Plan = {
  id: string;
  name: string;
  dayOfWeek: number | null;
  exercises: { id: string; name: string; targetSets: number; targetReps: number; isCustom?: boolean; exerciseId?: string; customExerciseId?: string }[];
};

export default function ExpandableWorkoutCard({ plan, onEdit }: { plan: Plan, onEdit?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
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
          Delete the routine &quot;{plan.name}&quot;?
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

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSharing(true);
    try {
      const res = await createWorkoutBlueprint(plan.id);
      if (res?.success && res.code) {
        const link = typeof window !== "undefined" ? `${window.location.origin}/share/${res.code}` : res.code;
        let copied = false;
        if (navigator?.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(link);
            copied = true;
          } catch {
            copied = false;
          }
        }
        toast.success(copied ? `Share link copied! Code: ${res.code}` : `Share code: ${res.code}\nLink: ${link}`, {
          duration: 7000,
        });
      } else {
        toast.error("Failed to generate share link");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate share link");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="rounded-2xl bg-[var(--color-white)] border-2 border-[var(--color-gray-100)] shadow-[0_4px_0_var(--color-button-shadow)] overflow-hidden transition-all hover:translate-y-[2px] hover:shadow-[0_2px_0_var(--color-button-shadow)]">
      <div className="w-full p-2 pr-4 flex justify-between items-center group">
        <button onClick={() => setIsOpen(!isOpen)} className="flex-1 text-left p-2 rounded-xl hover:bg-[var(--color-gray-50)] transition-colors focus:outline-none">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-black text-[var(--color-slate-800)] text-lg">{plan.name}</h3>
            </div>
            <p className="text-sm text-[var(--color-slate-500)] font-bold">
              {plan.exercises.length} exercises
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 text-[var(--color-slate-400)] hover:text-[var(--color-indigo-500)] hover:bg-[var(--color-indigo-50)] rounded-xl transition-colors"
              title="Edit Routine"
            >
              <Edit2 size={18} />
            </button>
          )}
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="p-2 text-[var(--color-slate-400)] hover:text-[var(--color-indigo-500)] hover:bg-[var(--color-indigo-50)] rounded-xl transition-colors disabled:opacity-60"
            title="Share Routine"
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-[var(--color-slate-400)] hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            title="Delete Routine"
          >
            <Trash2 size={18} />
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="text-[var(--color-slate-400)] p-2 hover:bg-[var(--color-gray-50)] rounded-xl transition-colors ml-1">
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
            className="border-t-2 border-[var(--color-gray-100)] bg-[var(--color-gray-50)]"
          >
            <div className="p-4 space-y-2">
              {plan.exercises.map((ex, index) => (
                <div key={ex.id || index} className="flex justify-between items-center text-sm p-3 rounded-xl border border-[var(--color-gray-200)] bg-[var(--color-white)] last:mb-0 hover:border-[var(--color-indigo-200)] transition-colors shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--color-indigo-400)] font-black w-4 text-xs">{index + 1}.</span>
                    <div>
                       <span className="font-bold text-[var(--color-slate-700)] block">{ex.name}</span>
                       {ex.isCustom && <span className="text-[9px] uppercase font-black text-orange-500">Custom</span>}
                    </div>
                  </div>
                  <span className="text-[var(--color-slate-600)] font-black bg-[var(--color-gray-100)] px-2.5 py-1 rounded-lg border border-[var(--color-gray-200)]">
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
