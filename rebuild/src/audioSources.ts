import type { AudioSource } from "expo-audio";
/** Only add audio after recording its source and redistribution license in AUDIO_SOURCES.md.
 * The supplied package contains no audio. Null entries intentionally prevent fake playback. */
export const audioSources: ReadonlyArray<AudioSource | null> = [
  null,
  null,
  null,
  null,
  null,
  null,
];
