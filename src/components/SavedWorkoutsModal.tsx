"use client";

import { X, Trash2 } from "lucide-react";
import ExpandableWorkoutCard from "./ExpandableWorkoutCard";
import { useState } from "react";
import { clearAllWorkoutPlans } from "@/app/actions/profile-actions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SavedWorkoutsModal({
  isOpen,
  onClose,
  savedWorkouts
}: {
  isOpen: boolean;
  onClose: () => void;
  savedWorkouts: any[]
}) {
  const [clearing, setClearing] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const executeClearAll = async (toastId: string) => {
    toast.dismiss(toastId);
    setClearing(true);
    await clearAllWorkoutPlans();
    setClearing(false);
    onClose();
    router.refresh();
    toast.success("All routines deleted.");
  };

  const handleClearAll = () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-[var(--color-slate-800)]">
          Are you sure you want to delete ALL your saved workout routines?
        </p>
        <div className="flex justify-end gap-2">
          <button 
            className="px-3 py-1.5 bg-gray-100 text-slate-600 font-bold rounded-lg text-sm hover:bg-gray-200"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button 
            className="px-3 py-1.5 bg-red-500 text-[var(--color-white)] font-bold rounded-lg text-sm hover:bg-red-600"
            onClick={() => executeClearAll(t.id)}
          >
            Delete All
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-white)] w-full max-w-lg rounded-3xl p-6 max-h-[85vh] overflow-y-auto no-scrollbar relative animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-[var(--color-white)] pb-4 mb-4 border-b border-[var(--color-gray-100)] flex items-center justify-between z-10">
          <h2 className="text-2xl font-black text-[var(--color-slate-800)]">Saved Routines</h2>
          <div className="flex items-center gap-2">
            {savedWorkouts.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-bold text-xs disabled:opacity-50"
              >
                {clearing ? "Clearing..." : (
                  <>
                    <Trash2 size={16} /> Clear All
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 text-[var(--color-slate-500)] rounded-full hover:bg-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {savedWorkouts.length === 0 ? (
          <p className="text-center text-[var(--color-slate-400)] py-10 font-bold">No saved routines yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {savedWorkouts.map((workout: any) => (
              <ExpandableWorkoutCard key={workout.id} plan={workout} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
