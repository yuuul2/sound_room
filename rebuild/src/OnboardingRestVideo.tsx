import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useBackgroundPlayback } from "./useBackgroundPlayback";
export function OnboardingRestVideo({ active }: { active: boolean }) {
  const { running } = useBackgroundPlayback(active);
  const [firstFrame, setFirstFrame] = useState(false);
  const [failed, setFailed] = useState(false);
  const player = useVideoPlayer(require("../video/onboarding-dark-rest.mp4"), (player) => {
    player.loop = true;
    player.muted = true;
    player.audioMixingMode = "mixWithOthers";
  });
  useEffect(() => {
    const subscription = player.addListener("statusChange", ({ status }) => {
      setFailed(status === "error");
      if (status === "readyToPlay" && running) player.play();
    });
    return () => subscription.remove();
  }, [player, running]);
  useEffect(() => {
    if (running) player.play(); else player.pause();
  }, [running, player]);
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <Image source={require("../video/onboarding-dark-rest-poster.jpg")} resizeMode="cover" style={StyleSheet.absoluteFill} />
    <VideoView player={player} onFirstFrameRender={() => setFirstFrame(true)} nativeControls={false} contentFit="cover" playsInline pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: firstFrame && !failed ? 1 : 0 }]} />
  </View>;
}
