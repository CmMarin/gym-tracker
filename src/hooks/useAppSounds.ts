"use client";

// To pick your sounds:
// Go to mixkit.co or zapsplat.com and download 3 .mp3 files.
// Place them in the "public" folder of your app.
// Update the filenames below to match your files!

const POP_SOUND_URL = "/pop.mp3";
const DING_SOUND_URL = "/ding.wav";
const BUZZER_SOUND_URL = "/buzzer.wav";

const isSoundEnabled = () => {
  if (typeof window === "undefined") return true;
  const stored = window.localStorage.getItem("soundEnabled");
  return stored !== "false";
};

const playNativeSound = (url: string, volume: number = 0.5) => {
  if (typeof window !== "undefined") {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(() => {
      // Silently ignore auto-play restrictions or missing file errors
    });
  }
};

export function useAppSounds() {
  const triggerVibration = (pattern: number | number[]) => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch {
        // ignore vibration failures
      }
    }
  };

  const playPop = (vibrate = true) => {
    if (!isSoundEnabled()) return;
    playNativeSound(POP_SOUND_URL, 0.5);
    if (vibrate) triggerVibration(50);
  };

  const playDing = () => {
    if (!isSoundEnabled()) return;
    playNativeSound(DING_SOUND_URL, 0.5);
    triggerVibration([50, 100, 50]);
  };

  const playBuzzer = () => {
    if (!isSoundEnabled()) return;
    playNativeSound(BUZZER_SOUND_URL, 0.5);
    triggerVibration([100, 50, 100]);
  };

  return {
    playPop,
    playDing,
    playBuzzer
  };
}