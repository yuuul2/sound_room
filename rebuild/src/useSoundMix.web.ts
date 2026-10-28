import { useEffect, useRef, useState } from "react";
import { Asset } from "expo-asset";
import { audioSources } from "./audioSources";
type Engine = {
  context: AudioContext;
  buffers: AudioBuffer[];
  sources: AudioBufferSourceNode[];
  gains: GainNode[];
  master: GainNode;
  offset: number;
  started: number;
  running: boolean;
};
/** Web Audio gain nodes support independent volume on mobile Safari as well as Chrome.
 * The audio clock schedules timer completion even if browser JS timers are throttled. */
export function useSoundMix(
  volumes: number[],
  enabled: boolean[],
  repeat: boolean,
  deadline: number | null,
  fade: boolean,
) {
  const ref = useRef<Engine | null>(null);
  const intent = useRef(0);
  const settings = useRef({ volumes, enabled, repeat, deadline, fade });
  settings.current = { volumes, enabled, repeat, deadline, fade };
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const available =
    enabled.some((v, i) => v && volumes[i] > 0) &&
    enabled.every((v, i) => !v || volumes[i] === 0 || audioSources[i] !== null);
  const release = (e: Engine) => {
    e.sources.forEach((s) => {
      s.onended = null;
      try {
        s.stop();
      } catch {}
      s.disconnect();
    });
    e.gains.forEach((g) => g.disconnect());
    e.sources = [];
    e.gains = [];
  };
  const position = (e: Engine) =>
    e.running
      ? Math.max(0, e.offset + e.context.currentTime - e.started)
      : e.offset;
  const stop = () => {
    intent.current++;
    const e = ref.current;
    if (e) {
      e.offset = position(e) % 48;
      e.running = false;
      release(e);
    }
    setPlaying(false);
  };
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    let engine: Engine | null = null;
    try {
      const context = new AudioContext();
      const master = context.createGain();
      master.gain.value = 0.65;
      master.connect(context.destination);
      engine = {
        context,
        master,
        buffers: [],
        sources: [],
        gains: [],
        offset: 0,
        started: 0,
        running: false,
      };
      ref.current = engine;
      Promise.all(
        audioSources.map(async (source) => {
          if (!source) throw Error("missing");
          const asset = Asset.fromModule(source as number);
          const response = await fetch(asset.uri, {
            signal: controller.signal,
          });
          if (!response.ok) throw Error("download");
          return context.decodeAudioData(await response.arrayBuffer());
        }),
      )
        .then((buffers) => {
          if (!cancelled && engine) {
            engine.buffers = buffers;
            setReady(true);
          }
        })
        .catch(() => {
          if (!cancelled) setError("audio-load");
        });
    } catch {
      setError("audio-unavailable");
    }
    return () => {
      cancelled = true;
      controller.abort();
      intent.current++;
      if (engine) {
        release(engine);
        void engine.context.close();
      }
      ref.current = null;
    };
  }, []);
  const schedule = (e: Engine) => {
    const { volumes, enabled, deadline, fade, repeat } = settings.current;
    const now = e.context.currentTime;
    const end =
      deadline === null
        ? null
        : now + Math.max(0, (deadline - Date.now()) / 1000);
    e.gains.forEach((g, i) => {
      g.gain.cancelScheduledValues(now);
      g.gain.setTargetAtTime(
        enabled[i] ? Math.max(0, Math.min(1, volumes[i] / 100)) : 0,
        now,
        0.025,
      );
    });
    e.sources.forEach((s) => {
      s.loop = repeat;
    });
    e.master.gain.cancelScheduledValues(now);
    if (end !== null) {
      const seconds = Math.max(0, end - now);
      e.master.gain.setValueAtTime(
        fade ? 0.65 * Math.min(1, seconds / 30) : 0.65,
        now,
      );
      if (fade) {
        e.master.gain.setValueAtTime(0.65, Math.max(now, end - 30));
        if (seconds < 30)
          e.master.gain.setValueAtTime((0.65 * seconds) / 30, now);
        e.master.gain.linearRampToValueAtTime(0, end);
      } else e.master.gain.setValueAtTime(0, end);
    } else e.master.gain.setTargetAtTime(0.65, now, 0.025);
  };
  const start = () => {
    const e = ref.current;
    if (!e || !ready) return;
    release(e);
    const now = e.context.currentTime + 0.015;
    e.started = now;
    e.running = true;
    e.buffers.forEach((buffer, i) => {
      const source = e.context.createBufferSource();
      source.buffer = buffer;
      source.loop = settings.current.repeat;
      const gain = e.context.createGain();
      gain.gain.value = settings.current.enabled[i]
        ? settings.current.volumes[i] / 100
        : 0;
      source.connect(gain);
      gain.connect(e.master);
      e.sources.push(source);
      e.gains.push(gain);
      if (i === 0)
        source.onended = () => {
          if (e.running && !settings.current.repeat) {
            e.offset = 0;
            e.running = false;
            release(e);
            setPlaying(false);
            setElapsed(0);
          }
        };
      source.start(now, e.offset % buffer.duration);
    });
    schedule(e);
    setPlaying(true);
  };
  useEffect(() => {
    const e = ref.current;
    if (e?.running) {
      schedule(e);
      if (!available) stop();
    }
  }, [volumes, enabled, repeat, deadline, fade, available]);
  useEffect(() => {
    const tick = () => {
      const e = ref.current;
      if (!e) return;
      if (
        settings.current.deadline !== null &&
        Date.now() >= settings.current.deadline
      ) {
        if (e.running) stop();
        return;
      }
      if (e.running) setElapsed(position(e) % 48);
    };
    const timer = setInterval(tick, 200);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);
  return {
    playing,
    available,
    ready,
    error,
    elapsed,
    duration: 48,
    stop,
    seek: (seconds: number) => {
      const e = ref.current;
      if (!e) return;
      const was = e.running;
      release(e);
      e.running = false;
      e.offset = Math.max(0, Math.min(47.99, seconds));
      setElapsed(e.offset);
      if (was) start();
    },
    toggle: () => {
      const e = ref.current;
      if (e?.running) {
        stop();
        return "paused";
      }
      if (!available) return "missing";
      if (!ready || !e) return "loading";
      const ticket = ++intent.current;
      setError(null);
      // Resume directly inside the tap handler: required by iOS Safari's autoplay policy.
      void e.context
        .resume()
        .then(() => {
          if (ticket === intent.current) start();
        })
        .catch(() => setError("playback"));
      return "playing";
    },
  };
}
