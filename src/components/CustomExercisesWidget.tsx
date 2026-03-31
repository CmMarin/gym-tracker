"use client";
import { useState, useEffect } from "react";
import { Plus, Dumbbell, Activity } from "lucide-react";
import dynamic from "next/dynamic";
import { useAppSounds } from "@/hooks/useAppSounds";

const CustomExerciseModal = dynamic(() => import("./CustomExerciseModal"), {
  ssr: false,
});

type CustomExercise = {
  id: string;
  name: string;
  category: string;
  targetMuscles: string[];
};

export default function CustomExercisesWidget() {
  const [exercises, setExercises] = useState<CustomExercise[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasOpenedModal, setHasOpenedModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { playPop } = useAppSounds();

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/custom-exercises", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setExercises(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void fetchExercises();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const prefetchExercises = () => {
    if (loading) return;
    if (exercises.length > 0) return;
    void fetchExercises();
  };

  return (
    <div className="bg-[var(--color-white)] rounded-3xl p-6 shadow-[0_4px_0_var(--color-theme-shadow)] border-2 border-indigo-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
            <Activity size={24} className="stroke-[3]" />
          </div>
          <h2 className="text-xl font-black text-slate-800">My Exercises</h2>
        </div>
        <button
          onMouseDown={prefetchExercises}
          onTouchStart={prefetchExercises}
          onClick={() => {
            playPop();
            setHasOpenedModal(true);
            setIsModalOpen(true);
          }}
          className="bg-indigo-500 hover:bg-indigo-600 active:translate-y-1 active:shadow-none text-[var(--color-white)] p-2 rounded-xl shadow-[0_4px_0_var(--color-button-shadow)] transition-all"
        >
          <Plus size={20} className="stroke-[3]" />
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse flex flex-col gap-3">
          <div className="h-16 bg-slate-100 rounded-2xl"></div>
          <div className="h-16 bg-slate-100 rounded-2xl"></div>
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-slate-500 font-medium">No custom exercises yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className="p-4 bg-[var(--color-gray-50)] rounded-2xl border-2 border-[var(--color-gray-100)] flex items-center justify-between"
            >
              <div>
                <h3 className="font-bold text-slate-800">{ex.name}</h3>
                <div className="flex gap-1 mt-1">
                  {ex.targetMuscles.map((m) => (
                    <span
                      key={m}
                      className="text-[10px] uppercase font-black bg-indigo-100 text-indigo-500 px-2 py-0.5 rounded-md"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <Dumbbell size={20} className="text-slate-400" />
            </div>
          ))}
        </div>
      )}

      {hasOpenedModal && (
        <CustomExerciseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={fetchExercises}
        />
      )}
    </div>
  );
}
