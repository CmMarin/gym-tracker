"use client";

import { useState } from "react";
import { Plus, CalendarDays, Dumbbell, MoreHorizontal, Settings2, ChevronDown, ChevronUp } from "lucide-react";
import WorkoutSplitWizard from "./WorkoutSplitWizard";

const DAYS_SHORT = [
  { key: "mondayId", n: "Mon" },
  { key: "tuesdayId", n: "Tue" },
  { key: "wednesdayId", n: "Wed" },
  { key: "thursdayId", n: "Thu" },
  { key: "fridayId", n: "Fri" },
  { key: "saturdayId", n: "Sat" },
  { key: "sundayId", n: "Sun" }
];

export default function WeeklyPlannerWidget({ 
  initialSchedule, 
  savedWorkouts 
}: { 
  initialSchedule: any; 
  savedWorkouts: any[] 
}) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Derive today's day key to highlight it
  const todayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday...
  const todayKey = todayIndex === 0 ? "sundayId" : DAYS_SHORT[todayIndex - 1].key;

  return (
    <>
      <div className="w-full max-w-md bg-[var(--color-white)] rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--color-gray-100)] flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-indigo-50)] text-[var(--color-indigo-500)] flex items-center justify-center">
              <CalendarDays size={20} />
            </div>
            <div>
              <h3 className="font-black text-lg text-[var(--color-slate-800)]">Workout Split</h3>
              <p className="text-sm font-bold text-[var(--color-slate-400)]">
                {initialSchedule ? "Your weekly routine" : "No split assigned"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {initialSchedule && (
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 text-[var(--color-slate-400)] hover:text-[var(--color-indigo-500)] hover:bg-[var(--color-indigo-50)] rounded-full transition-all"
                title={isCollapsed ? "Show full week" : "Show today only"}
              >
                {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
            )}
            <button 
              onClick={() => setIsWizardOpen(true)}
              className="p-2 text-[var(--color-slate-400)] hover:text-[var(--color-indigo-500)] hover:bg-[var(--color-indigo-50)] rounded-full transition-all"
            >
              <Settings2 size={20} />
            </button>
          </div>
        </div>

        {!initialSchedule ? (
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="w-full py-4 border-2 border-dashed border-[var(--color-gray-200)] hover:border-[var(--color-indigo-300)] hover:bg-[var(--color-indigo-50)] text-[var(--color-slate-500)] hover:text-[var(--color-indigo-600)] font-bold rounded-2xl transition-all flex justify-center items-center gap-2 group"
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" />
            Set Workout Split
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            {DAYS_SHORT.map((day) => {
              const assignedId = initialSchedule[day.key];
              const isToday = day.key === todayKey;
              
              if (isCollapsed && !isToday) return null;

              const workout = savedWorkouts.find(w => w.id === assignedId);

              return (
                <div 
                  key={day.key} 
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                    isToday 
                      ? "bg-[var(--color-indigo-500)] text-[var(--color-white)] shadow-[0_4px_0_var(--color-button-shadow)] translate-y-[-2px] mb-1" 
                      : assignedId 
                        ? "bg-[var(--color-gray-50)] text-[var(--color-slate-800)]" 
                        : "bg-[var(--color-white)] border-2 border-dashed border-[var(--color-gray-200)] opacity-75"
                  }`}
                >
                  <div className={`w-12 text-center font-black ${isToday ? "text-[var(--color-indigo-100)]" : "text-[var(--color-slate-400)]"}`}>
                    {day.n}
                  </div>
                  
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <div className="truncate pr-2">
                      {assignedId ? (
                        <>
                          <h4 className={`font-black truncate ${isToday ? "text-[var(--color-white)]" : "text-[var(--color-slate-800)]"}`}>
                            {workout?.name || "Workout"}
                          </h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? "text-[var(--color-indigo-200)]" : "text-[var(--color-slate-400)]"}`}>
                            Planned
                          </span>
                        </>
                      ) : (
                        <span className={`font-bold ${isToday ? "text-[var(--color-indigo-50)]" : "text-[var(--color-slate-400)]"}`}>
                          Rest Day
                        </span>
                      )}
                    </div>
                    {assignedId && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isToday ? "bg-[var(--color-indigo-600)] text-[var(--color-white)]" : "bg-[var(--color-white)] text-[var(--color-indigo-500)] shadow-sm"
                      }`}>
                        <Dumbbell size={14} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <WorkoutSplitWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        savedWorkouts={savedWorkouts}
      />
    </>
  );
}

