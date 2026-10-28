import { useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";
import { audioSources } from "./audioSources";
/** Six independent tracks. Never claims to play while a required track is missing or unloaded. */
export function useSoundMix(
  volumes: number[],
  enabled: boolean[],
  repeat: boolean,
  deadline: number | null,
  fade: boolean,
) {
  const rain = useAudioPlayer(audioSources[0]);
  const ocean = useAudioPlayer(audioSources[1]);
  const wind = useAudioPlayer(audioSources[2]);
  const cafe = useAudioPlayer(audioSources[3]);
  const forest = useAudioPlayer(audioSources[4]);
  const piano = useAudioPlayer(audioSources[5]);
  const players = useMemo(
    () => [rain, ocean, wind, cafe, forest, piano],
    [rain, ocean, wind, cafe, forest, piano],
  );
  const statuses = [
    useAudioPlayerStatus(rain),
    useAudioPlayerStatus(ocean),
    useAudioPlayerStatus(wind),
    useAudioPlayerStatus(cafe),
    useAudioPlayerStatus(forest),
    useAudioPlayerStatus(piano),
  ];
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const active = enabled.map((v, i) => v && volumes[i] > 0);
  const available =
    active.some(Boolean) &&
    active.every((v, i) => !v || audioSources[i] !== null);
  const ready = available && active.every((v, i) => !v || statuses[i].isLoaded);
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "doNotMix",
    }).catch(() => setError("audio-mode"));
  }, []);
  useEffect(() => {
    if (!deadline) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    const sub = AppState.addEventListener("change", () => setNow(Date.now()));
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [deadline]);
  const gain =
    deadline && fade ? Math.max(0, Math.min(1, (deadline - now) / 30000)) : 1;
  useEffect(() => {
    try {
      players.forEach((p, i) => {
        p.loop = repeat;
        p.volume = active[i]
          ? Math.max(0, Math.min(1, volumes[i] / 100)) * gain * 0.65
          : 0;
        if (
          !requested ||
          !ready ||
          !active[i] ||
          (deadline !== null && deadline <= now)
        )
          p.pause();
        else if (!p.playing) p.play();
      });
      if (deadline !== null && deadline <= now) setRequested(false);
    } catch {
      setRequested(false);
      setError("playback");
    }
  }, [
    players,
    volumes,
    enabled,
    repeat,
    requested,
    ready,
    deadline,
    now,
    gain,
  ]);
  // When a non-repeating mix reaches its end, clear intent so later volume changes cannot restart it.
  const ended =
    active.some(Boolean) &&
    active.every(
      (v, i) =>
        !v ||
        statuses[i].didJustFinish ||
        (statuses[i].duration > 0 &&
          statuses[i].currentTime >= statuses[i].duration),
    );
  useEffect(() => {
    if (!repeat && ended) setRequested(false);
  }, [repeat, ended]);
  return {
    duration: Math.max(48, ...statuses.map((s) => s.duration || 0)),
    seek: (seconds: number) => {
      players.forEach((p) => {
        void p.seekTo(Math.max(0, Math.min(47.99, seconds)));
      });
    },
    playing: statuses.some((s, i) => active[i] && s.playing),
    available,
    ready,
    error,
    elapsed: Math.max(0, ...statuses.map((s) => s.currentTime || 0)),
    toggle: () => {
      if (requested) {
        setRequested(false);
        return "paused";
      }
      if (!available) return "missing";
      if (!ready) return "loading";
      setError(null);
      players.forEach((p, i) => {
        if (active[i]) {
          p.loop = repeat;
          p.volume = (volumes[i] / 100) * gain * 0.65;
          if (p.currentTime >= p.duration) void p.seekTo(0);
          p.play();
        }
      });
      setRequested(true);
      return "playing";
    },
    stop: () => setRequested(false),
  };
}
