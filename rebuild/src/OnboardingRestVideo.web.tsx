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
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let live = true;
    if (running) {
      video.muted = true;
      video.play().then(() => { if (live) setVisible(true); }).catch(() => { if (live) setVisible(false); });
    } else video.pause();
    return () => { live = false; video.pause(); };
  }, [running]);
  const style: React.CSSProperties = { position: "absolute", width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" };
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <img src={poster} alt="" aria-hidden="true" style={style} />
    {!failed && <video ref={ref} data-testid="onboarding-rest-video" src={source} poster={poster} muted loop playsInline preload="auto" controls={false} aria-hidden="true" tabIndex={-1} onError={() => setFailed(true)} style={{ ...style, opacity: visible ? 1 : 0 }} />}
  </View>;
}
