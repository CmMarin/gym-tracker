import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ChevronDown } from "lucide-react";
import { useAppSounds } from "@/hooks/useAppSounds";

const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Glutes",
  "Core",
  "Calves",
  "Forearms",
];

export default function CustomExerciseModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Strength");
  const [targetMuscles, setTargetMuscles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { playPop, playBuzzer } = useAppSounds();

  const toggleMuscle = (m: string) => {
    playPop();
    setTargetMuscles((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  };

  const handleSave = async () => {
    if (!name.trim() || targetMuscles.length === 0) {
      playBuzzer();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/custom-exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, targetMuscles }),
      });
      if (res.ok) {
        playPop();
        onSave();
        onClose();
        setName("");
        setTargetMuscles([]);
      } else {
        playBuzzer();
      }
    } catch {
      playBuzzer();
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[var(--color-white)]/85 backdrop-blur-3xl rounded-[2rem] shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-[var(--color-gray-100)]"
          >
            <div className="p-6 border-b border-[var(--color-gray-100)] flex justify-between items-center bg-transparent">
              <h2 className="text-2xl font-black text-[var(--color-slate-800)]">
                New Exercise
              </h2>
              <button
                onClick={onClose}
                className="p-2 bg-[var(--color-gray-100)] text-[var(--color-slate-500)] rounded-full hover:bg-[var(--color-gray-200)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh] md:max-h-[70vh] bg-transparent">
              <div>
                <label className="block text-sm font-bold text-[var(--color-slate-500)] mb-2">
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Decline Bench Press"
                  className="w-full bg-[var(--color-gray-50)] border-2 border-[var(--color-gray-200)] rounded-2xl p-4 text-[var(--color-slate-800)] font-bold focus:outline-none focus:border-[var(--color-indigo-500)] transition-colors placeholder:text-[var(--color-slate-400)]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--color-slate-500)] mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[var(--color-gray-50)] border-2 border-[var(--color-gray-200)] rounded-2xl p-4 pr-12 text-[var(--color-slate-800)] font-bold focus:outline-none focus:border-[var(--color-indigo-500)] transition-colors appearance-none"
                  >
                    <option
                      className="bg-[var(--color-white)] text-[var(--color-slate-800)] font-bold"
                      value="Strength"
                    >
                      Strength
                    </option>
                    <option
                      className="bg-[var(--color-white)] text-[var(--color-slate-800)] font-bold"
                      value="Cardio"
                    >
                      Cardio
                    </option>
                    <option
                      className="bg-[var(--color-white)] text-[var(--color-slate-800)] font-bold"
                      value="Stretching"
                    >
                      Stretching
                    </option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[var(--color-slate-400)]">
                    <ChevronDown size={20} className="stroke-[3]" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--color-slate-500)] mb-2">
                  Target Muscles
                </label>
                <div className="flex flex-wrap gap-2">
                  {MUSCLE_GROUPS.map((m) => {
                    const active = targetMuscles.includes(m);
                    return (
                      <button
                        key={m}
                        onClick={() => toggleMuscle(m)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${active ? "bg-[var(--color-indigo-500)] text-[var(--color-white)] shadow-[0_4px_0_var(--color-button-shadow)] active:translate-y-1 active:shadow-none" : "bg-[var(--color-gray-100)] text-[var(--color-slate-500)] hover:bg-[var(--color-gray-200)]"}`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--color-gray-100)] bg-[var(--color-gray-50)]">
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-[var(--color-green-500)] hover:bg-[var(--color-green-600)] text-[var(--color-white)] font-bold py-4 rounded-2xl shadow-[0_4px_0_var(--color-button-shadow)] active:translate-y-1 active:shadow-none transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_var(--color-button-shadow)]"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-[var(--color-white)] inset-0 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Check size={20} className="stroke-[3]" /> Save Exercise
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
