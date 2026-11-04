import React, { useEffect, useRef, useState } from "react";
import { Asset } from "expo-asset";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useApp } from "./State";
import { SplashVideoTone } from "./SplashVideoTone";
import { useBackgroundPlayback } from "./useBackgroundPlayback";
const source = Asset.fromModule(require("../video/splash-star.mp4")).uri;
const poster = Asset.fromModule(require("../video/splash-star-poster.jpg")).uri;
export function SplashVideo({ active }: { active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const { state } = useApp();
  const { running, needsPlay, request } = useBackgroundPlayback(active);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let live = true;
    if (running) {
      video.muted = true;
      video
        .play()
        .then(() => {
          if (live) setBlocked(false);
        })
        .catch(() => {
          if (live) setBlocked(true);
        });
    } else video.pause();
    return () => {
      live = false;
      video.pause();
    };
  }, [running]);
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <img
        src={poster}
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />
      {!failed && (
        <video
          ref={ref}
          data-testid="splash-video"
          src={source}
          poster={poster}
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          aria-hidden="true"
          tabIndex={-1}
          onError={() => setFailed(true)}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
          }}
        />
      )}
      <SplashVideoTone dark={state.dark} />
      {active && !failed && (needsPlay || blocked) && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            state.en ? "Play background video" : "배경 영상 재생"
          }
          onPress={(event) => {
            event.stopPropagation();
            request();
            ref.current
              ?.play()
              .then(() => setBlocked(false))
              .catch(() => setBlocked(true));
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
            borderWidth: 1,
            borderColor: "#ffffff66",
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
