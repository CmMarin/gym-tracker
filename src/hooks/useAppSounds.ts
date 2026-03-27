"use client";

import useSound from "use-sound";

// To pick your sounds:
// Go to mixkit.co or zapsplat.com and download 3 .mp3 files.
// Place them in the "public" folder of your app.
// Update the filenames below to match your files!

const POP_SOUND_URL = "/pop.mp3";
const DING_SOUND_URL = "/ding.wav";
const BUZZER_SOUND_URL = "/buzzer.wav";

export function useAppSounds() {
  const [playPopSound] = useSound(POP_SOUND_URL, { volume: 0.5 });
  const [playDingSound] = useSound(DING_SOUND_URL, { volume: 0.5 });
  const [playBuzzerSound] = useSound(BUZZER_SOUND_URL, { volume: 0.5 });

  const triggerVibration = (pattern: number | number[]) => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  };

  const playPop = (vibrate = true) => {
    playPopSound();
    if (vibrate) triggerVibration(50);
  };

  const playDing = () => {
    playDingSound();
    triggerVibration([50, 100, 50]);
  };

  const playBuzzer = () => {
    playBuzzerSound();
    triggerVibration([100, 50, 100]);
  };

  return {
    playPop,
    playDing,
    playBuzzer
  };
}