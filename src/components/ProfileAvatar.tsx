"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { updateUserImage } from "@/app/actions/profile-actions";
import { Camera, X, Wand2, Check } from "lucide-react";

const avatars = [
  "https://api.dicebear.com/8.x/big-smile/svg?seed=Aidan", // cool guy
  "https://api.dicebear.com/8.x/big-smile/svg?seed=Brian", // duck
  "https://api.dicebear.com/8.x/big-smile/svg?flip=true&seed=Liam", // cat
  "https://api.dicebear.com/9.x/toon-head/svg?eyes=happy,humble,wide,wink&mouth=agape,angry,laugh,smile&skinColor=f1c3a5&seed=Valentina", // dog
  "https://api.dicebear.com/8.x/big-smile/svg?seed=Sheba", // girl
  "https://api.dicebear.com/8.x/big-smile/svg?seed=Bandit", // boy
];

type StylePreset = "big-smile" | "toon-head";

const hairOptions: Record<StylePreset, string[]> = {
  "big-smile": ["", "shaggy", "mohawk", "pixie"],
  "toon-head": ["", "shortVoluminous", "curly", "bald", "longCurly"],
};

const eyeOptions: Record<StylePreset, string[]> = {
  "big-smile": ["", "happy", "wink", "wide"],
  "toon-head": ["", "happy", "humble", "wide", "wink"],
};

const mouthOptions: Record<StylePreset, string[]> = {
  "big-smile": ["", "smile", "laugh", "surprised"],
  "toon-head": ["", "smile", "laugh", "agape"],
};

export default function ProfileAvatar({
  currentImage,
  username,
}: {
  currentImage: string | null;
  username: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  const [style, setStyle] = useState<StylePreset>("toon-head");
  const [seed, setSeed] = useState(username || "Avatar");
  const [bgColor, setBgColor] = useState("f1f5f9");
  const [flip, setFlip] = useState(false);
  const [hair, setHair] = useState<string>("");
  const [eyes, setEyes] = useState<string>("");
  const [mouth, setMouth] = useState<string>("");
  const [skin, setSkin] = useState("f1c3a5");

  const customUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("seed", seed || "Avatar");
    if (bgColor) params.set("backgroundColor", bgColor);
    if (flip) params.set("flip", "true");
    if (hair && hairOptions[style].includes(hair)) params.set("hair", hair);
    if (eyes && eyeOptions[style].includes(eyes)) params.set("eyes", eyes);
    if (mouth && mouthOptions[style].includes(mouth)) params.set("mouth", mouth);
    if (style === "toon-head" && skin) params.set("skinColor", skin);
    return `https://api.dicebear.com/${style === "toon-head" ? "9.x" : "8.x"}/${style}/svg?${params.toString()}`;
  }, [seed, bgColor, flip, hair, eyes, mouth, skin, style]);

  const selectAvatar = async (url: string) => {
    setLoading(true);
    await updateUserImage(url);
    setLoading(false);
    setIsOpen(false);
  };

  const applyCustomAvatar = async () => {
    setLoading(true);
    await updateUserImage(customUrl);
    setLoading(false);
    setIsOpen(false);
    setShowBuilder(false);
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

            <div className="grid grid-cols-3 gap-4 mb-6">
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

            <div className="border border-[var(--color-gray-100)] rounded-2xl p-4 bg-[var(--color-gray-50)] space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-[var(--color-slate-800)]">
                  <Wand2 size={18} className="text-[var(--color-indigo-500)]" />
                  Custom Builder
                </div>
                <button
                  onClick={() => setShowBuilder((v) => !v)}
                  className="text-xs font-bold text-[var(--color-indigo-600)]"
                >
                  {showBuilder ? "Hide" : "Open"}
                </button>
              </div>

              {showBuilder && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-[var(--color-slate-500)]">Seed</label>
                      <input
                        value={seed}
                        onChange={(e) => setSeed(e.target.value)}
                        className="w-full mt-1 rounded-xl border-2 border-[var(--color-gray-200)] bg-[var(--color-white)] px-3 py-2 font-bold text-[var(--color-slate-700)] focus:border-[var(--color-indigo-500)] outline-none"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--color-slate-500)]">Flip</label>
                      <button
                        onClick={() => setFlip((v) => !v)}
                        className={`mt-1 px-3 py-2 rounded-xl border-2 font-bold ${flip ? "bg-[var(--color-indigo-500)] text-white border-[var(--color-indigo-500)]" : "bg-[var(--color-white)] text-[var(--color-slate-700)] border-[var(--color-gray-200)]"}`}
                      >
                        {flip ? "Yes" : "No"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[var(--color-slate-500)]">Style</label>
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value as StylePreset)}
                        className="w-full mt-1 rounded-xl border-2 border-[var(--color-gray-200)] bg-[var(--color-white)] px-3 py-2 font-bold text-[var(--color-slate-700)] focus:border-[var(--color-indigo-500)] outline-none"
                      >
                        <option value="big-smile">Big Smile</option>
                        <option value="toon-head">Toon Head</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--color-slate-500)]">Background</label>
                      <select
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-full mt-1 rounded-xl border-2 border-[var(--color-gray-200)] bg-[var(--color-white)] px-3 py-2 font-bold text-[var(--color-slate-700)] focus:border-[var(--color-indigo-500)] outline-none"
                      >
                        <option value="">None</option>
                        <option value="f1f5f9">Gray</option>
                        <option value="dbeafe">Blue</option>
                        <option value="f3e8ff">Purple</option>
                        <option value="fee2e2">Rose</option>
                        <option value="dcfce7">Mint</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--color-slate-500)]">Hair</label>
                      <select
                        value={hair}
                        onChange={(e) => setHair(e.target.value)}
                        className="w-full mt-1 rounded-xl border-2 border-[var(--color-gray-200)] bg-[var(--color-white)] px-3 py-2 font-bold text-[var(--color-slate-700)] focus:border-[var(--color-indigo-500)] outline-none"
                      >
                        {hairOptions[style].map((h) => (
                          <option key={h || "none"} value={h}>{h || "None"}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--color-slate-500)]">Eyes</label>
                      <select
                        value={eyes}
                        onChange={(e) => setEyes(e.target.value)}
                        className="w-full mt-1 rounded-xl border-2 border-[var(--color-gray-200)] bg-[var(--color-white)] px-3 py-2 font-bold text-[var(--color-slate-700)] focus:border-[var(--color-indigo-500)] outline-none"
                      >
                        {eyeOptions[style].map((h) => (
                          <option key={h || "none"} value={h}>{h || "None"}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--color-slate-500)]">Mouth</label>
                      <select
                        value={mouth}
                        onChange={(e) => setMouth(e.target.value)}
                        className="w-full mt-1 rounded-xl border-2 border-[var(--color-gray-200)] bg-[var(--color-white)] px-3 py-2 font-bold text-[var(--color-slate-700)] focus:border-[var(--color-indigo-500)] outline-none"
                      >
                        {mouthOptions[style].map((h) => (
                          <option key={h || "none"} value={h}>{h || "None"}</option>
                        ))}
                      </select>
                    </div>
                    {style === "toon-head" && (
                      <div>
                        <label className="text-xs font-bold text-[var(--color-slate-500)]">Skin</label>
                        <select
                          value={skin}
                          onChange={(e) => setSkin(e.target.value)}
                          className="w-full mt-1 rounded-xl border-2 border-[var(--color-gray-200)] bg-[var(--color-white)] px-3 py-2 font-bold text-[var(--color-slate-700)] focus:border-[var(--color-indigo-500)] outline-none"
                        >
                          <option value="f1c3a5">Peach</option>
                          <option value="d1a17b">Tan</option>
                          <option value="b87d62">Brown</option>
                          <option value="f3d7c6">Fair</option>
                          <option value="8d5b3c">Deep</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl border-2 border-[var(--color-gray-200)] bg-[var(--color-white)] flex items-center justify-center overflow-hidden">
                      <img src={customUrl} alt="Custom preview" className="w-full h-full object-contain" />
                    </div>
                    <button
                      onClick={applyCustomAvatar}
                      disabled={loading}
                      className="flex-1 py-3 bg-[var(--color-indigo-500)] text-white font-bold rounded-xl shadow-[0_4px_0_var(--color-button-shadow)] active:translate-y-1 active:shadow-none disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      <Check size={18} /> Use Custom
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => selectAvatar("")}
              disabled={loading}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-slate-600 font-bold transition-colors"
            >
              Remove Image
            </button>
          </div>
        </div>
      )}
    </>
  );
}
