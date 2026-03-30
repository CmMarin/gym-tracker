"use client";

import { X, Trash2, Plus, ArrowLeft, Dumbbell, Save, Activity } from "lucide-react";
import ExpandableWorkoutCard from "./ExpandableWorkoutCard";
import { useState, useEffect } from "react";
import { clearAllWorkoutPlans, saveWorkoutPlan } from "@/app/actions/profile-actions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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
  const [view, setView] = useState<"list" | "edit">("list");
  const [editPlanId, setEditPlanId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editExercises, setEditExercises] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [allExercises, setAllExercises] = useState<any[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [exerciseFilter, setExerciseFilter] = useState<"all" | "standard" | "custom">("all");

  useEffect(() => {
    if (!isOpen) {
      setView("list");
      setIsPicking(false);
    }
  }, [isOpen]);

  const loadExercises = async () => {
    setLoadingExercises(true);
    try {
      const [stdRes, cstRes] = await Promise.all([
        fetch("/api/exercises"),
        fetch("/api/custom-exercises")
      ]);
      const std = stdRes.ok ? await stdRes.json() : [];
      const cst = cstRes.ok ? await cstRes.json() : [];
      const combined = [
        ...std.map((e: any) => ({ ...e, isCustom: false })),
        ...cst.map((e: any) => ({ ...e, isCustom: true }))
      ];
      setAllExercises(combined);
    } catch (e) {
      console.error(e);
    }
    setLoadingExercises(false);
  };

  const handleEdit = (plan: any) => {
    setEditPlanId(plan.id);
    setEditName(plan.name);
    setEditExercises(plan.exercises.map((e: any) => ({
      id: e.id || Math.random().toString(),
      exerciseId: e.isCustom ? null : e.exerciseId,
      customExerciseId: e.isCustom ? e.customExerciseId : null,
      name: e.name,
      targetSets: e.targetSets,
      targetReps: e.targetReps,
      isCustom: e.isCustom
    })));
    setView("edit");
  };

  const handleCreateNew = () => {
    setEditPlanId(null);
    setEditName("");
    setEditExercises([]);
    setView("edit");
  };

  const addExerciseToPlan = (ex: any) => {
    setEditExercises([...editExercises, {
      exerciseId: ex.isCustom ? null : ex.id,
      customExerciseId: ex.isCustom ? ex.id : null,
      name: ex.name,
      targetSets: 3,
      targetReps: 10,
      isCustom: ex.isCustom
    }]);
    setIsPicking(false);
  };

  const updateSetRep = (index: number, field: "targetSets" | "targetReps", value: number) => {
    const copy = [...editExercises];
    copy[index][field] = value;
    setEditExercises(copy);
  };

  const removeExercise = (index: number) => {
    setEditExercises(editExercises.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!editName.trim()) return toast.error("Please enter a routine name");
    if (editExercises.length === 0) return toast.error("Please add at least one exercise");
    
    setIsSaving(true);
    const res = await saveWorkoutPlan(editPlanId, editName, editExercises);
    setIsSaving(false);
    
    if (res?.success) {
      toast.success("Routine saved!");
      router.refresh();
      setView("list");
    } else {
      toast.error("Failed to save routine");
    }
  };

  const executeClearAll = async (toastId: string) => {
    toast.dismiss(toastId);
    setClearing(true);
    await clearAllWorkoutPlans();
    setClearing(false);
    setView("list");
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

  if (!isOpen) return null;

  const filteredExercises = allExercises.filter(ex => {
    if (exerciseFilter === "custom" && !ex.isCustom) return false;
    if (exerciseFilter === "standard" && ex.isCustom) return false;
    return (ex.name || "").toLowerCase().includes((searchQuery || "").toLowerCase());
  }).sort((a, b) => {
    // Sort custom exercises to the top when viewing 'all'
    if (exerciseFilter === "all" && a.isCustom !== b.isCustom) {
      return a.isCustom ? -1 : 1;
    }
    return (a.name || "").localeCompare(b.name || "");
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-[var(--color-white)] w-full max-w-lg rounded-[32px] flex flex-col h-[85vh] sm:h-[600px] sm:max-h-[85vh] overflow-hidden relative animate-in zoom-in-95 duration-200 shadow-2xl">
        {view === "list" && (
          <>
            <div className="p-6 bg-[var(--color-slate-800)] text-[var(--color-white)] shrink-0 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black mb-1">Saved Routines</h2>
                <p className="text-[var(--color-indigo-200)] text-sm font-medium">{savedWorkouts.length} templates available</p>
              </div>
              <button onClick={onClose} className="p-2 bg-[var(--color-white)]/20 hover:bg-[var(--color-white)]/30 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto bg-[var(--color-gray-50)] no-scrollbar">
              <button
                onClick={handleCreateNew}
                className="w-full bg-[var(--color-indigo-500)] text-[var(--color-white)] p-4 rounded-2xl font-bold flex items-center justify-center gap-2 mb-6 shadow-[0_4px_0_var(--color-button-shadow)] active:translate-y-1 active:shadow-none transition-all"
              >
                <Plus size={20} className="stroke-[3]" />
                Make Custom Workout
              </button>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-[var(--color-slate-800)]">Your Templates</h3>
                {savedWorkouts.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    disabled={clearing}
                    className="text-sm font-bold text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                  >
                    {clearing ? "Clearing..." : "Clear All"}
                  </button>
                )}
              </div>
              {savedWorkouts.length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center opacity-60">
                  <Dumbbell size={48} className="mb-4 text-[var(--color-slate-400)]" />
                  <p className="text-[var(--color-slate-500)] font-bold">No saved routines yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 pb-6">
                  {savedWorkouts.map((workout: any) => (
                    <div key={workout.id} className="relative">
                      <ExpandableWorkoutCard plan={workout} onEdit={() => handleEdit(workout)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        
        {view === "edit" && (
          <>
            <div className="p-6 border-b border-[var(--color-gray-100)] flex items-center justify-between bg-[var(--color-white)] shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setView("list")} className="p-2 bg-[var(--color-gray-100)] text-[var(--color-slate-600)] hover:bg-[var(--color-gray-200)] rounded-full transition-colors">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-black text-[var(--color-slate-800)]">{editPlanId ? "Edit Routine" : "New Routine"}</h2>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[var(--color-indigo-500)] text-[var(--color-white)] px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-[0_4px_0_var(--color-button-shadow)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_var(--color-button-shadow)]"
              >
                <Save size={16} className="stroke-[3]" />
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto bg-[var(--color-white)] no-scrollbar space-y-6">
              <div>
                <label className="block text-sm font-bold text-[var(--color-slate-500)] mb-2 ml-2">Routine Name</label>
                <input
                  type="text"
                  placeholder="e.g. Push Day Heavy"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[var(--color-gray-50)] border-2 border-[var(--color-gray-200)] focus:border-[var(--color-indigo-500)] text-[var(--color-slate-800)] font-bold rounded-2xl p-4 transition-colors outline-none"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-3 ml-2">
                  <label className="text-sm font-bold text-[var(--color-slate-500)]">Exercises</label>
                  <span className="text-xs font-bold text-[var(--color-indigo-500)] bg-[var(--color-indigo-100)] px-2 py-1 rounded-md">{editExercises.length} added</span>
                </div>
                <div className="space-y-3">
                  <AnimatePresence>
                    {editExercises.map((ex, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[var(--color-gray-50)] border-2 border-[var(--color-gray-200)] rounded-2xl p-4 flex flex-col gap-3 group relative"
                      >
                        <div className="flex justify-between items-start pr-8">
                          <h4 className="font-black text-[var(--color-slate-800)]">{ex.name}</h4>
                          {ex.isCustom && <span className="text-[10px] uppercase font-black tracking-wider bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md">Custom</span>}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[var(--color-slate-500)]">Sets</span>
                            <div className="flex items-center bg-[var(--color-white)] rounded-lg border-2 border-[var(--color-gray-200)] overflow-hidden">
                              <button onClick={() => updateSetRep(i, "targetSets", Math.max(1, ex.targetSets - 1))} className="px-3 py-1 hover:bg-[var(--color-gray-100)] font-bold text-[var(--color-slate-600)] transition-colors">-</button>
                              <div className="w-8 text-center font-black text-[var(--color-slate-800)] text-sm">{ex.targetSets}</div>
                              <button onClick={() => updateSetRep(i, "targetSets", ex.targetSets + 1)} className="px-3 py-1 hover:bg-[var(--color-gray-100)] font-bold text-[var(--color-slate-600)] transition-colors">+</button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[var(--color-slate-500)]">Reps</span>
                            <div className="flex items-center bg-[var(--color-white)] rounded-lg border-2 border-[var(--color-gray-200)] overflow-hidden">
                              <button onClick={() => updateSetRep(i, "targetReps", Math.max(1, ex.targetReps - 1))} className="px-3 py-1 hover:bg-[var(--color-gray-100)] font-bold text-[var(--color-slate-600)] transition-colors">-</button>
                              <div className="w-8 text-center font-black text-[var(--color-slate-800)] text-sm">{ex.targetReps}</div>
                              <button onClick={() => updateSetRep(i, "targetReps", ex.targetReps + 1)} className="px-3 py-1 hover:bg-[var(--color-gray-100)] font-bold text-[var(--color-slate-600)] transition-colors">+</button>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeExercise(i)}
                          className="absolute top-3 right-3 p-1.5 text-[var(--color-slate-300)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <button
                    onClick={() => {
                      if (allExercises.length === 0) loadExercises();
                      setIsPicking(true);
                      setSearchQuery("");
                      setExerciseFilter("all");
                    }}
                    className="w-full border-2 border-dashed border-[var(--color-gray-300)] text-[var(--color-slate-500)] font-bold rounded-2xl py-4 flex justify-center items-center gap-2 hover:bg-[var(--color-gray-50)] hover:text-[var(--color-slate-700)] hover:border-[var(--color-slate-400)] transition-all"
                  >
                    <Plus size={20} className="stroke-[3]" />
                    Add Exercise
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        
        {view === "edit" && isPicking && (
          <div className="flex flex-col h-full absolute inset-0 bg-[var(--color-white)] z-10 animate-in slide-in-from-right-8 duration-200">
            <div className="p-4 border-b border-[var(--color-gray-100)] flex items-center gap-3 shrink-0">
              <button onClick={() => setIsPicking(false)} className="p-2 bg-[var(--color-gray-100)] text-[var(--color-slate-600)] hover:bg-[var(--color-gray-200)] rounded-full transition-colors">
                <ArrowLeft size={20} />
              </button>
              <input
                type="text"
                autoFocus
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-[var(--color-gray-50)] border-none outline-none text-[var(--color-slate-800)] font-bold rounded-xl px-4 py-2"
              />
            </div>
            
            <div className="px-4 pt-3 flex gap-2 shrink-0">
              {(["all", "custom", "standard"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setExerciseFilter(filter)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-colors ${
                    exerciseFilter === filter
                      ? "bg-[var(--color-indigo-500)] text-[var(--color-white)]"
                      : "bg-[var(--color-gray-100)] text-[var(--color-slate-600)] hover:bg-[var(--color-gray-200)]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loadingExercises ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredExercises.map((ex, idx) => (
                    <button
                      key={idx}
                      onClick={() => addExerciseToPlan(ex)}
                      className="w-full text-left p-4 rounded-xl border-2 border-[var(--color-gray-100)] hover:border-[var(--color-indigo-200)] hover:bg-[var(--color-indigo-50)] transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--color-white)] text-[var(--color-indigo-400)] rounded-lg shadow-sm border border-[var(--color-gray-100)]">
                          {ex.isCustom ? <Activity size={18} /> : <Dumbbell size={18} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-[var(--color-slate-800)]">{ex.name}</h4>
                          <span className="text-xs font-bold text-[var(--color-slate-400)]">{ex.isCustom ? "Custom Exercise" : ex.category || "General"}</span>
                        </div>
                      </div>
                      <Plus size={18} className="text-[var(--color-slate-300)] group-hover:text-[var(--color-indigo-500)]" />
                    </button>
                  ))}
                  {filteredExercises.length === 0 && (
                    <p className="text-center text-slate-500 font-medium py-10">No exercises found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
