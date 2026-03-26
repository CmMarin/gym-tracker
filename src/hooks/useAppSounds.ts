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
  const [playPop] = useSound(POP_SOUND_URL, { volume: 0.5 });
  const [playDing] = useSound(DING_SOUND_URL, { volume: 0.5 });
  const [playBuzzer] = useSound(BUZZER_SOUND_URL, { volume: 0.5 });

  return {
    playPop,
    playDing,
    playBuzzer
  };
}