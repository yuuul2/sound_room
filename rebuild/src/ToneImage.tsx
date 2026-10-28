import React, { useId, useState } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Svg, {
  Defs,
  Filter,
  FeColorMatrix,
  Image as SvgImage,
} from "react-native-svg";
import { lightAssets, type LightAssetKey } from "./lightAssets";
import { darkAssets } from "./darkAssets";
import { useApp } from "./State";
import { lightTones, darkTones } from "./tones";
/** Render-only saturation: no source pixel, alpha, file-size or geometry changes. */
export function ToneImage({
  asset,
  style,
  fit = "cover",
  saturation,
  theme,
  children,
}: {
  asset: LightAssetKey;
  style?: StyleProp<ViewStyle>;
  fit?: "cover" | "contain";
  saturation?: number;
  theme?: "light" | "dark";
  children?: React.ReactNode;
}) {
  const { state } = useApp();
  const dark = theme ? theme === "dark" : state.dark;
  const id = "tone" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const [size, setSize] = useState({ width: 0, height: 0 });
  const value =
    saturation ?? (dark ? darkTones[asset] : lightTones[asset]) ?? 1;
  return (
    <View
      style={[{ overflow: "hidden" }, style]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize((s) =>
          s.width === width && s.height === height ? s : { width, height },
        );
      }}
    >
      {size.width > 0 && size.height > 0 && (
        <Svg
          pointerEvents="none"
          accessible={false}
          width={size.width}
          height={size.height}
          style={StyleSheet.absoluteFill}
        >
          <Defs>
            <Filter id={id} x="0%" y="0%" width="100%" height="100%">
              <FeColorMatrix type="saturate" values={[value]} />
            </Filter>
          </Defs>
          <SvgImage
            href={(dark ? darkAssets : lightAssets)[asset]}
            width={size.width}
            height={size.height}
            preserveAspectRatio={
              fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"
            }
            filter={`url(#${id})`}
          />
        </Svg>
      )}
      {children}
    </View>
  );
}
