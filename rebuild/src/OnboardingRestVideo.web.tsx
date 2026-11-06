import React, { useEffect, useRef, useState } from "react";
import { Asset } from "expo-asset";
import { StyleSheet, View } from "react-native";
import { useBackgroundPlayback } from "./useBackgroundPlayback";
const source = Asset.fromModule(require("../video/onboarding-dark-rest.mp4")).uri;
const poster = Asset.fromModule(require("../video/onboarding-dark-rest-poster.jpg")).uri;
export function OnboardingRestVideo({ active }: { active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const { running } = useBackgroundPlayback(active);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let live = true;
    let pending = false;
    let retries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if (!live || !running || timer || retries >= 3) return;
      retries += 1;
      timer = setTimeout(() => { timer = undefined; attempt(); }, 150 * retries);
    };
    const attempt = () => {
      if (!live || !running || pending || !video.paused) return;
      pending = true;
      video.muted = true;
      video.defaultMuted = true;
      video.play().catch(schedule).finally(() => { pending = false; });
    };
    // Retry transient startup failures when media becomes ready. A poster must
    // not hide the video with opacity:0 while mobile autoplay waits for visibility.
    video.addEventListener("loadeddata", attempt);
    video.addEventListener("canplay", attempt);
    video.addEventListener("pause", schedule);
    if (running) attempt(); else video.pause();
    return () => {
      live = false;
      if (timer) clearTimeout(timer);
      video.removeEventListener("loadeddata", attempt);
      video.removeEventListener("canplay", attempt);
      video.removeEventListener("pause", schedule);
      video.pause();
    };
  }, [running]);
  const style: React.CSSProperties = { position: "absolute", width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" };
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <img src={poster} alt="" aria-hidden="true" style={style} />
    {!failed && <video ref={ref} data-testid="onboarding-rest-video" src={source} poster={poster} muted loop playsInline preload="auto" controls={false} aria-hidden="true" tabIndex={-1} onError={() => setFailed(true)} style={style} />}
  </View>;
}
