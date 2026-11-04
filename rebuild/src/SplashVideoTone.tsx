import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
/** Display-only grading based on the onboarding lavender palette.
 * Applied equally to the movie and poster; source media and foreground text stay unchanged.
 */
export function SplashVideoTone({ dark }: { dark: boolean }) {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={
        dark
          ? ["#2b263f66", "#39314633", "#3a344c99"]
          : ["#e7e4f6a6", "#aebff08c", "#bfb4e4bf"]
      }
      locations={[0, 0.45, 1]}
      style={[
        StyleSheet.absoluteFill,
        { mixBlendMode: dark ? "normal" : "screen" },
      ]}
      testID="splash-video-tone"
    />
  );
}
