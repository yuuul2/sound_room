import React from "react";
import { Pressable, View, type SwitchProps } from "react-native";
import { useApp } from "./State";
/** Consistent approved pill geometry and a 44px touch target on native and web. */
export function Toggle({
  value,
  onValueChange,
  accessibilityLabel,
  disabled,
}: SwitchProps) {
  const { state } = useApp();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: !!value, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onValueChange?.(!value)}
      style={{
        minHeight: 44,
        minWidth: 48,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <View
        style={{
          width: 40,
          height: 23,
          borderRadius: 12,
          padding: 2,
          backgroundColor: value
            ? state.dark
              ? "#d6abcd"
              : "#9586df"
            : state.dark
              ? "#61576c"
              : "#d4cce2",
          alignItems: value ? "flex-end" : "flex-start",
        }}
      >
        <View
          style={{
            width: 19,
            height: 19,
            borderRadius: 10,
            backgroundColor: "#fff",
            boxShadow: "0 1px 3px #39274333",
          }}
        />
      </View>
    </Pressable>
  );
}
