"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

const themes = [
  { id: "light", name: "Default (Light)" },
  { id: "dark", name: "Dark" },
  { id: "blue-dark", name: "Baby Blue Dark" },
  { id: "pink-dark", name: "Pink Dark" },
  { id: "pink-light", name: "Pink & White" },
  { id: "purple-dark", name: "Purple Dark" },
];

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved;
    }
    return "light";
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", currentTheme);
    }
  }, [currentTheme]);

  const changeTheme = (id: string) => {
    setCurrentTheme(id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[var(--color-white)] rounded-3xl p-6 shadow-[0_4px_0_var(--color-button-shadow)] border-2 border-indigo-50 mb-4 active:shadow-none active:translate-y-1 transition-all flex items-center justify-between group cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-500 rounded-2xl group-hover:scale-110 transition-transform">
            <Palette size={28} />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-black text-slate-800">Theme</h2>
            <p className="text-slate-500 font-medium text-sm">
              {themes.find((t) => t.id === currentTheme)?.name || "Light"}
            </p>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full top-full mt-2 bg-[var(--color-white)] rounded-2xl shadow-xl border border-indigo-50 p-2 grid grid-cols-2 gap-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => changeTheme(theme.id)}
              className={`p-3 rounded-xl text-sm font-bold text-left transition-colors ${
                currentTheme === theme.id
                  ? "bg-indigo-500 text-[var(--color-white)]"
                  : "bg-gray-50 text-slate-700 hover:bg-gray-100"
              }`}
            >
              {theme.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
