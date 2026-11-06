import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useApp } from "./State";
import { SplashVideoTone } from "./SplashVideoTone";
import { useBackgroundPlayback } from "./useBackgroundPlayback";
export function SplashVideo({ active }: { active: boolean }) {
  const { state } = useApp();
  return <SplashVideoContent key={state.dark ? "dark" : "light"} active={active} />;
}
function SplashVideoContent({ active }: { active: boolean }) {
  const { state } = useApp();
  const [firstFrame, setFirstFrame] = useState(false);
  const { running, needsPlay, request } = useBackgroundPlayback(active);
  const player = useVideoPlayer(
    state.dark ? require("../video/splash-star-flow-loop.mp4") : require("../video/splash-light-flow-loop.mp4"),
    (player) => {
      player.loop = true;
      player.muted = true;
      player.audioMixingMode = "mixWithOthers";
    },
  );
  useEffect(() => {
    if (running) player.play();
    else player.pause();
  }, [running, player]);
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Image
        source={state.dark ? require("../video/splash-star-flow-poster.jpg") : require("../video/splash-light-flow-poster.jpg")}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      />
      <VideoView
        player={player}
        onFirstFrameRender={() => setFirstFrame(true)}
        nativeControls={false}
        contentFit="cover"
        playsInline
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { opacity: firstFrame ? 1 : 0 }]}
      />
      <SplashVideoTone dark={state.dark} />
      {needsPlay && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            state.en ? "Play background video" : "배경 영상 재생"
          }
          onPress={(event) => {
            event.stopPropagation();
            request();
          }}
          style={{
            position: "absolute",
            bottom: 24,
            right: 20,
            minHeight: 44,
            paddingHorizontal: 16,
            justifyContent: "center",
            borderRadius: 22,
            backgroundColor: "#332d4b99",
          }}
        >
          <Text
            style={{ fontFamily: "Pretendard", fontSize: 13, color: "#fff" }}
          >
            {state.en ? "Play background video" : "배경 영상 재생"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
