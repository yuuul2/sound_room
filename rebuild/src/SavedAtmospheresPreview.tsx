import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Cover, Label } from "./Scenes";
import { presetNames, useApp } from "./State";
import { useBackgroundPlayback } from "./useBackgroundPlayback";

const rowHeight = 78;
const gap = 8;
const cycle = (rowHeight + gap) * presetNames.length;
const pixelsPerSecond = 16;

export function SavedAtmospheresPreview({ active }: { active: boolean }) {
  const { state } = useApp();
  const { running, needsPlay, request } = useBackgroundPlayback(active);
  const [paused, setPaused] = useState(false);
  const translateY = useRef(new Animated.Value(-cycle)).current;
  const playing = running && !paused;
  useEffect(() => {
    if (!playing) return;
    let live = true;
    let animation: Animated.CompositeAnimation | undefined;
    const move = (from: number) => {
      if (!live) return;
      const start = from >= -0.01 ? -cycle : from;
      translateY.setValue(start);
      animation = Animated.timing(translateY, {
        toValue: 0,
        duration: (-start / pixelsPerSecond) * 1000,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== "web",
        isInteraction: false,
      });
      animation.start(({ finished }) => {
        if (finished && live) move(-cycle);
      });
    };
    translateY.stopAnimation((value) => {
      if (live) move(value);
    });
    return () => {
      live = false;
      animation?.stop();
    };
  }, [playing, translateY]);
  const rows = (copy: number) =>
    presetNames.map((name, index) => (
      <View
        key={`${copy}-${index}`}
        style={{ height: rowHeight, marginBottom: gap }}
      >
        <Cover index={index} style={{ height: rowHeight, borderRadius: 16 }} />
        <LinearGradient
          colors={["transparent", "#17142899"]}
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: 16, justifyContent: "center", padding: 14 },
          ]}
        >
          <Label style={{ color: "#fff" }}>{name[state.en ? 1 : 0]}</Label>
        </LinearGradient>
      </View>
    ));
  return (
    <View
      testID="saved-atmospheres-preview"
      style={{
        flex: 1,
        minHeight: 0,
        maxHeight: 390,
        borderRadius: 25,
        padding: 12,
        backgroundColor: state.dark ? "#39314399" : "#ffffff77",
        marginTop: 24,
        gap: 8,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", minHeight: 44 }}
      >
        <Label style={{ flex: 1 }}>
          {state.en ? "Your saved atmospheres" : "내가 저장한 분위기"}
        </Label>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            playing
              ? state.en
                ? "Pause banner motion"
                : "배너 자동 이동 일시정지"
              : state.en
                ? "Play banner motion"
                : "배너 자동 이동 재생"
          }
          onPress={() => {
            if (playing) setPaused(true);
            else {
              request();
              setPaused(false);
            }
          }}
          style={{
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Label style={{ fontSize: 16 }}>{playing ? "Ⅱ" : "▶"}</Label>
        </Pressable>
      </View>
      {needsPlay ? (
        <ScrollView
          testID="saved-atmospheres-static"
          style={{ flex: 1, minHeight: 0 }}
          showsVerticalScrollIndicator={false}
        >
          {rows(0)}
        </ScrollView>
      ) : (
        <View
          testID="saved-atmospheres-window"
          accessible
          accessibilityLabel={presetNames
            .map((name) => name[state.en ? 1 : 0])
            .join(", ")}
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            borderRadius: 16,
          }}
        >
          <Animated.View
            testID="saved-atmospheres-track"
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            aria-hidden
            style={{ transform: [{ translateY }], height: cycle * 2 }}
          >
            {rows(0)}
            {rows(1)}
          </Animated.View>
        </View>
      )}
    </View>
  );
}
