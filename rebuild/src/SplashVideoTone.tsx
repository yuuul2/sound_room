import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
/** Dark-only display grading; the uploaded light movie is displayed without grading.
 * Applied equally to the movie and poster; source media and foreground text stay unchanged.
 */
export function SplashVideoTone({ dark }: { dark: boolean }) {
  if (!dark) return null;
  return (
    <LinearGradient
      pointerEvents="none"
      colors={
        ["#2b263f66", "#39314633", "#3a344c99"]
      }
      locations={[0, 0.45, 1]}
      style={[
        StyleSheet.absoluteFill,
        { mixBlendMode: "normal" },
      ]}
      testID="splash-video-tone"
    />
  );
}
