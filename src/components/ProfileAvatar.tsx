"use client";

import { useState } from "react";
import { updateUserImage } from "@/app/actions/profile-actions";
import { Camera, X } from "lucide-react";

const avatars = [
  "https://api.dicebear.com/8.x/big-smile/svg?seed=Aidan", // cool guy
  "https://api.dicebear.com/8.x/big-smile/svg?seed=Brian", // duck
  "https://api.dicebear.com/8.x/big-smile/svg?flip=true&seed=Liam", // cat
  "https://api.dicebear.com/9.x/toon-head/svg?eyes=happy,humble,wide,wink&mouth=agape,angry,laugh,smile&skinColor=f1c3a5&seed=Valentina", // dog
  "https://api.dicebear.com/8.x/big-smile/svg?seed=Sheba", // girl
  "https://api.dicebear.com/8.x/big-smile/svg?seed=Bandit", // boy
];

export default function ProfileAvatar({
  currentImage,
  username,
}: {
  currentImage: string | null;
  username: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectAvatar = async (url: string) => {
    setLoading(true);
    await updateUserImage(url);
    setLoading(false);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative z-10 w-full mb-6 max-w-sm group">
        <button
          onClick={() => setIsOpen(true)}
          className="relative inline-block hover:scale-105 transition-transform"
        >
          {currentImage ? (
            <img
              src={currentImage}
              alt={username}
              width={100}
              height={100}
              className="rounded-[2rem] mx-auto border-4 border-[var(--color-white)] shadow-lg ring-4 ring-indigo-50 bg-indigo-50"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[2rem] mx-auto flex items-center justify-center border-4 border-[var(--color-white)] shadow-lg ring-4 ring-indigo-50 text-[var(--color-white)] font-black text-3xl shadow-[0_4px_0_var(--color-theme-shadow)] pb-1">
              {username[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 bg-slate-800 text-[var(--color-white)] p-2 rounded-xl border-2 border-[var(--color-white)] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={16} />
          </div>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-white)] w-full max-w-sm rounded-[2rem] p-6 relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-800">
                Choose Avatar
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-gray-100 text-slate-500 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {avatars.map((url) => (
                <button
                  key={url}
                  disabled={loading}
                  onClick={() => selectAvatar(url)}
                  className={`relative aspect-square rounded-2xl border-4 ${currentImage === url ? "border-indigo-500 bg-indigo-50" : "border-indigo-50 bg-gray-50 hover:border-indigo-200"} transition-all overflow-hidden flex items-center justify-center`}
                >
                  <img
                    src={url}
                    alt="Avatar option"
                    className="w-full h-full p-2 object-contain"
                  />
                </button>
              ))}
            </div>

            <button
              onClick={() => selectAvatar("")}
              disabled={loading}
              className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-slate-600 font-bold transition-colors"
            >
              Remove Image
            </button>
          </div>
        </div>
      )}
    </>
  );
}
