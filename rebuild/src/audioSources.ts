import type { AudioSource } from "expo-audio";
/** Recorded public-domain/CC0 sounds. Provenance and processing: rebuild/AUDIO_SOURCES.md. */
export const audioSources: ReadonlyArray<AudioSource | null> = [
  require("../audio/rain.mp3"),
  require("../audio/ocean.mp3"),
  require("../audio/wind.mp3"),
  require("../audio/cafe.mp3"),
  require("../audio/forest.mp3"),
  require("../audio/piano.mp3"),
];
