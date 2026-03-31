"use client";

import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Check, Settings2, Plus, ArrowLeft, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const DAYS = [
  { key: "mondayId", label: "Monday", short: "Mon" },
  { key: "tuesdayId", label: "Tuesday", short: "Tue" },
  { key: "wednesdayId", label: "Wednesday", short: "Wed" },
  { key: "thursdayId", label: "Thursday", short: "Thu" },
  { key: "fridayId", label: "Friday", short: "Fri" },
  { key: "saturdayId", label: "Saturday", short: "Sat" },
  { key: "sundayId", label: "Sunday", short: "Sun" },
] as const;

const SCOPES = [
  { id: "ONGOING", title: "Ongoing", desc: "Keep this schedule until I change it." },
  { id: "THIS_MONTH", title: "This Month", desc: "Reset at the end of the month." },
  { id: "THIS_WEEK", title: "This Week", desc: "Just for the current week." }
];

export default function WorkoutSplitWizard({
  isOpen,
  onClose,
  savedWorkouts,
  onSaveComplete
}: {
  isOpen: boolean;
  onClose: () => void;
  savedWorkouts: any[];
  onSaveComplete?: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [trainingDays, setTrainingDays] = useState<number>(3);
  
  // Holds the assigned workout plan IDs
  const [schedule, setSchedule] = useState<Record<string, string | null>>({
    mondayId: null, tuesdayId: null, wednesdayId: null,
    thursdayId: null, fridayId: null, saturdayId: null, sundayId: null
  });

  const [scope, setScope] = useState("ONGOING");
  const [isSaving, setIsSaving] = useState(false);

  // Sub-view for picking a workout for a specific day
  const [pickingForDay, setPickingForDay] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    // Reset wizard when opened
    if (isOpen) {
      setStep(1);
      setPickingForDay(null);
    }
  }, [isOpen]);

  const autoFillDays = (days: number) => {
    let actives: string[] = [];
    if (days === 1) actives = ["wednesdayId"];
    else if (days === 2) actives = ["tuesdayId", "thursdayId"];
    else if (days === 3) actives = ["mondayId", "wednesdayId", "fridayId"];
    else if (days === 4) actives = ["mondayId", "tuesdayId", "thursdayId", "fridayId"];
    else if (days === 5) actives = ["mondayId", "tuesdayId", "wednesdayId", "fridayId", "saturdayId"];
    else if (days === 6) actives = ["mondayId", "tuesdayId", "wednesdayId", "thursdayId", "fridayId", "saturdayId"];
    else if (days === 7) actives = DAYS.map(d => d.key);

    const defaultWorkoutId = savedWorkouts.length > 0 ? savedWorkouts[0].id : "placeholder";

    const newSchedule: Record<string, string | null> = {};
    DAYS.forEach(d => {
      newSchedule[d.key] = actives.includes(d.key) ? defaultWorkoutId : null;
    });
    setSchedule(newSchedule);
  };

  const handleNextFromStep1 = () => {
    // Initialize schedule based on selected days if not already set or heavily empty
    const currentActiveDays = Object.values(schedule).filter(v => v !== null).length;
    if (currentActiveDays !== trainingDays) {
      autoFillDays(trainingDays);
    }
    setStep(2);
  };

  const saveSchedule = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...schedule,
          scope
        })
      });

      if (!res.ok) throw new Error("Failed to save schedule");

      toast.success("Workout Schedule Updated!");
      onSaveComplete?.();
      onClose();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-white)] w-full max-w-lg rounded-[32px] flex flex-col h-[85vh] sm:h-[650px] sm:max-h-[85vh] overflow-hidden relative animate-in zoom-in-95 duration-200 shadow-2xl">
        
        {/* HEADER */}
        {!pickingForDay && (
          <div className="p-6 border-b border-[var(--color-gray-100)] flex items-center justify-between shrink-0 bg-[var(--color-white)] z-10">
            <div className="flex items-center gap-3">
              {step > 1 ? (
                <button onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)} className="p-2 bg-[var(--color-gray-100)] text-[var(--color-slate-600)] hover:bg-[var(--color-gray-200)] rounded-full transition-colors">
                  <ArrowLeft size={20} />
                </button>
              ) : (
                <div className="w-10 h-10 bg-[var(--color-indigo-100)] text-[var(--color-indigo-500)] rounded-full flex items-center justify-center">
                  <CalendarIcon size={20} />
                </div>
              )}
              <div>
                <h2 className="text-xl font-black text-[var(--color-slate-800)]">Set Your Split</h2>
                <div className="flex items-center gap-1 mt-1">
                  <div className={`h-1.5 w-6 rounded-full transition-colors ${step >= 1 ? "bg-[var(--color-indigo-500)]" : "bg-[var(--color-gray-200)]"}`} />
                  <div className={`h-1.5 w-6 rounded-full transition-colors ${step >= 2 ? "bg-[var(--color-indigo-500)]" : "bg-[var(--color-gray-200)]"}`} />
                  <div className={`h-1.5 w-6 rounded-full transition-colors ${step >= 3 ? "bg-[var(--color-indigo-500)]" : "bg-[var(--color-gray-200)]"}`} />
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-[var(--color-gray-100)] text-[var(--color-slate-500)] rounded-full hover:bg-[var(--color-gray-200)] transition-colors">
              <X size={20} />
            </button>
          </div>
        )}

        {/* STEP 1: Total Days */}
        {step === 1 && !pickingForDay && (
          <div className="p-6 flex-1 overflow-y-auto no-scrollbar flex flex-col justify-center bg-[var(--color-white)]">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-black text-[var(--color-slate-800)] mb-3">How many days<br/>do you train?</h3>
              <p className="text-[var(--color-slate-500)] font-medium">Select your training frequency.<br/>We&apos;ll auto-distribute rest days.</p>
            </div>

              <div className="flex flex-wrap justify-center gap-3 max-w-[300px] mx-auto w-full mb-10">
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <button
                    key={num}
                    onClick={() => setTrainingDays(num)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl text-2xl font-black transition-all ${
                      trainingDays === num
                        ? "bg-[var(--color-indigo-500)] text-[var(--color-white)] shadow-[0_4px_0_var(--color-button-shadow)] translate-y-[-2px]"
                        : "bg-[var(--color-gray-50)] text-[var(--color-slate-600)] hover:bg-[var(--color-gray-100)] border-2 border-[var(--color-gray-200)]"
                    }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextFromStep1}
              className="w-full py-4 rounded-2xl font-black text-lg text-[var(--color-white)] bg-[var(--color-indigo-500)] shadow-[0_4px_0_var(--color-button-shadow)] active:translate-y-1 active:shadow-none transition-all"
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 2: Assign Workouts */}
        {step === 2 && !pickingForDay && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
            <div className="p-4 bg-[var(--color-gray-50)] flex-1 min-h-0">
               <p className="text-[var(--color-slate-500)] text-sm font-bold mb-4 text-center max-w-[260px] mx-auto">Tap a day to assign a routine or mark it as rest.</p>
              
              <div className="space-y-3 pb-[80px]">
                {DAYS.map(day => {
                  const assignedId = schedule[day.key];
                  const workout = savedWorkouts.find(w => w.id === assignedId);
                  const isRest = !assignedId;

                  return (
                    <button
                      key={day.key}
                      onClick={() => setPickingForDay(day.key)}
                      className={`w-full text-left p-4 rounded-2xl flex items-center justify-between transition-all group ${
                        isRest 
                          ? "bg-[var(--color-white)] border-2 border-dashed border-[var(--color-gray-300)] opacity-80 hover:opacity-100" 
                          : "bg-[var(--color-white)] border-2 border-[var(--color-gray-100)] hover:border-[var(--color-indigo-200)] shadow-sm"
                      }`}
                    >
                      <div className="flex gap-4 items-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${
                          isRest ? "bg-[var(--color-gray-100)] text-[var(--color-slate-400)]" : "bg-[var(--color-indigo-50)] text-[var(--color-indigo-500)]"
                        }`}>
                          {day.short}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--color-slate-400)] uppercase tracking-wider mb-0.5">{day.label}</p>
                          <p className={`font-bold ${isRest ? "text-[var(--color-slate-400)]" : "text-[var(--color-slate-800)]"}`}>
                            {assignedId === "placeholder" ? "Needs Routine" : isRest ? "Rest Day" : workout?.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                      <Settings2 size={18} className={`${isRest ? "text-[var(--color-slate-300)]" : "text-[var(--color-slate-400)]"} group-hover:text-[var(--color-indigo-500)] transition-colors`} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-[var(--color-white)] shrink-0 border-t border-[var(--color-gray-100)] z-10 absolute bottom-0 left-0 right-0">
              <button
                onClick={() => {
                  if (Object.values(schedule).includes("placeholder")) {
                    toast.error("Please select actual routines for your active days.");
                    return;
                  }
                  setStep(3);
                }}
                className="w-full py-4 rounded-2xl font-black text-lg text-[var(--color-white)] bg-[var(--color-indigo-500)] shadow-[0_4px_0_var(--color-button-shadow)] active:translate-y-1 active:shadow-none transition-all"
              >
                Confirm Setup
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Scope Selection */}
        {step === 3 && !pickingForDay && (
          <div className="p-6 flex-1 flex flex-col justify-center bg-[var(--color-white)]">
            <h3 className="text-2xl font-black text-[var(--color-slate-800)] mb-2 text-center">How long for?</h3>
            <p className="text-[var(--color-slate-500)] font-medium text-center mb-8">Define the timeframe for this schedule.</p>

            <div className="space-y-4 mb-8">
              {SCOPES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setScope(s.id)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                    scope === s.id
                      ? "bg-[var(--color-indigo-50)] border-[var(--color-indigo-500)] shadow-sm"
                      : "bg-[var(--color-white)] border-[var(--color-gray-100)] hover:border-[var(--color-gray-200)]"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h4 className={`font-black text-lg ${scope === s.id ? "text-[var(--color-indigo-700)]" : "text-[var(--color-slate-800)]"}`}>
                      {s.title}
                    </h4>
                    {scope === s.id && <Check size={20} className="text-[var(--color-indigo-500)]" />}
                  </div>
                  <p className="text-[var(--color-slate-500)] font-medium text-sm">{s.desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={saveSchedule}
              disabled={isSaving}
              className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 text-[var(--color-white)] bg-[var(--color-indigo-500)] shadow-[0_4px_0_var(--color-button-shadow)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_var(--color-button-shadow)]"
            >
              {isSaving ? (
                 <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Check size={22} className="stroke-[3]" />
              )}
              {isSaving ? "Saving..." : "Start Split"}
            </button>
          </div>
        )}

        {/* SUB-VIEW: Pick Workout Drawer Overlay */}
        {pickingForDay && (
          <div className="flex flex-col h-full absolute inset-0 bg-[var(--color-white)] z-20 animate-in slide-in-from-right-8 duration-200">
            <div className="p-4 border-b border-[var(--color-gray-100)] flex items-center gap-3 shrink-0 bg-[var(--color-white)]">
              <button 
                onClick={() => setPickingForDay(null)} 
                className="p-2 bg-[var(--color-gray-100)] text-[var(--color-slate-600)] hover:bg-[var(--color-gray-200)] rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h3 className="font-black text-[var(--color-slate-800)] text-lg">
                Assign {DAYS.find(d => d.key === pickingForDay)?.label}
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-[var(--color-gray-50)] no-scrollbar space-y-3">
              <button
                onClick={() => {
                  setSchedule(prev => ({ ...prev, [pickingForDay]: null }));
                  setPickingForDay(null);
                }}
                className="w-full bg-[var(--color-white)] text-left p-5 rounded-2xl border-2 border-[var(--color-gray-200)] hover:border-[var(--color-slate-400)] transition-all flex items-center gap-4"
              >
                <div className="p-3 bg-[var(--color-gray-100)] rounded-xl text-[var(--color-slate-500)]">
                  <RefreshCcw size={20} />
                </div>
                <div>
                  <h4 className="font-black text-[var(--color-slate-800)]">Rest Day</h4>
                  <p className="text-sm font-bold text-[var(--color-slate-400)]">Take a break.</p>
                </div>
              </button>

              <div className="px-1 py-3 text-sm font-bold text-[var(--color-slate-400)] uppercase tracking-wider">
                Saved Routines
              </div>

              {savedWorkouts.length === 0 ? (
                <div className="text-center py-10 bg-[var(--color-white)] border border-dashed border-[var(--color-gray-300)] rounded-2xl">
                  <p className="text-[var(--color-slate-500)] font-bold">No saved routines.</p>
                  <p className="text-sm text-[var(--color-slate-400)] mt-1">Create one first to assign it.</p>
                </div>
              ) : (
                savedWorkouts.map(workout => (
                  <button
                    key={workout.id}
                    onClick={() => {
                      setSchedule(prev => ({ ...prev, [pickingForDay]: workout.id }));
                      setPickingForDay(null);
                    }}
                    className="w-full bg-[var(--color-white)] text-left p-5 rounded-2xl border-2 border-[var(--color-gray-100)] hover:border-[var(--color-indigo-200)] hover:bg-[var(--color-indigo-50)] transition-all flex items-center gap-4 group"
                  >
                    <div className="p-3 bg-[var(--color-indigo-50)] text-[var(--color-indigo-500)] rounded-xl group-hover:bg-[var(--color-white)] transition-colors">
                      <Plus size={20} className="stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="font-black text-[var(--color-slate-800)] group-hover:text-[var(--color-indigo-700)] transition-colors">{workout.name}</h4>
                      <p className="text-sm font-bold text-[var(--color-slate-400)]">{workout.planExercises?.length || 0} exercises</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

