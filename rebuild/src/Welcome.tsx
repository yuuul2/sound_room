import React, { useEffect, useRef, useState } from "react";
import { View, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ToneImage } from "./ToneImage";
import { useApp, presetNames } from "./State";
import { Button, Cover, Label } from "./Scenes";
export function Welcome() {
  const { state, update } = useApp();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(-1);
  const touchX = useRef(0);
  const t = (ko: string, en: string) => (state.en ? en : ko);
  useEffect(() => {
    const timer = setTimeout(() => setStep((s) => (s === -1 ? 0 : s)), 1600);
    return () => clearTimeout(timer);
  }, []);
  if (step === -1)
    return (
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <ToneImage
          asset="backgrounds_covers_splash"
          style={StyleSheet.absoluteFill}
        />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Label style={{ fontSize: 40, color: "#fff" }}>Sound Room</Label>
          <Label style={{ color: "#fff" }}>
            {t(
              "소리로 만드는 나만의 작은 꿈속 공간",
              "Your little dreamscape, made of sound",
            )}
          </Label>
        </View>
      </View>
    );
  return (
    <View
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
      onTouchStart={(e) => (touchX.current = e.nativeEvent.pageX)}
      onTouchEnd={(e) => {
        const dx = e.nativeEvent.pageX - touchX.current;
        if (Math.abs(dx) > 65)
          setStep((s) => Math.max(0, Math.min(2, s + (dx < 0 ? 1 : -1))));
      }}
    >
      <ToneImage
        asset={
          step === 0
            ? "backgrounds_covers_onboarding_mixing_room"
            : step === 1
              ? "backgrounds_covers_onboarding_arch_room"
              : "backgrounds_covers_home_clouds"
        }
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={
          state.dark
            ? ["#2b263fcc", "#39314622", "#3a344c"]
            : ["#e7e4f6bb", "#ffffff00", "#bfb4e4"]
        }
        style={StyleSheet.absoluteFill}
      />
      <View style={{ alignItems: "flex-end", padding: 12 }}>
        <Pressable
          accessibilityRole="button"
          onPress={() => update({ onboarded: true })}
          style={{ minHeight: 44, justifyContent: "center", padding: 6 }}
        >
          <Label>{t("건너뛰기", "Skip")}</Label>
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 22 }}
      >
        <Label
          style={{
            fontSize: 26,
            lineHeight: 36,
            textAlign: "center",
            fontFamily: "PretendardSemiBold",
            marginTop: 18,
          }}
        >
          {
            [
              t(
                "자연의 소리를\n자유롭게 섞어보세요",
                "Mix the sounds\nof nature freely",
              ),
              t(
                "지금, 나만의 공간에서\n잠시 쉬어가세요",
                "Take a moment to rest\nin your own space",
              ),
              t(
                "좋아하는 분위기를\n다시 꺼내 들어보세요",
                "Return to your\nfavorite atmospheres",
              ),
            ][step]
          }
        </Label>
        <Label style={{ textAlign: "center", lineHeight: 24, marginTop: 15 }}>
          {
            [
              t(
                "비, 파도, 숲과 바람을 조합해\n나만의 분위기를 만들어요",
                "Blend rain, waves, forests and wind\nto create your own atmosphere",
              ),
              t(
                "소리와 달빛이 흐르는 공간에서\n하루의 속도를 천천히 낮춰보세요",
                "Slow down in a space\nfilled with sound and moonlight",
              ),
              t(
                "이름을 붙여 저장하면 언제든\n나만의 공간으로 돌아올 수 있어요",
                "Name and save a mix\nto return whenever you like",
              ),
            ][step]
          }
        </Label>
        {step === 0 && (
          <ToneImage
            asset="onboarding_onboarding"
            fit="contain"
            style={{ width: "100%", height: 340, marginTop: 42 }}
          />
        )}
        {step === 1 && <View style={{ minHeight: 360, flex: 1 }} />}
        {step === 2 && (
          <View
            style={{
              borderRadius: 25,
              padding: 12,
              backgroundColor: state.dark ? "#39314399" : "#ffffff77",
              marginTop: 24,
              gap: 8,
            }}
          >
            <Label style={{ marginBottom: 4 }}>
              {t("내가 저장한 분위기", "Your saved atmospheres")}
            </Label>
            {presetNames.map((p, i) => (
              <View key={i}>
                <Cover index={i} style={{ height: 78, borderRadius: 16 }} />
                <LinearGradient
                  colors={["transparent", "#17142899"]}
                  style={[
                    StyleSheet.absoluteFill,
                    { borderRadius: 16, justifyContent: "center", padding: 14 },
                  ]}
                >
                  <Label style={{ color: "#fff" }}>{p[state.en ? 1 : 0]}</Label>
                </LinearGradient>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={{ padding: 18, gap: 18 }}>
        <View
          style={{ flexDirection: "row", justifyContent: "center", gap: 12 }}
        >
          {[0, 1, 2].map((i) => (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={`${t("온보딩", "Onboarding")} ${i + 1}`}
              onPress={() => setStep(i)}
              style={{
                width: 24,
                height: 24,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  height: 10,
                  width: 10,
                  borderRadius: 5,
                  backgroundColor: step === i ? "#fff" : "#a9a1c8",
                  borderWidth: 1,
                  borderColor: "#c5b9ef",
                }}
              />
            </Pressable>
          ))}
        </View>
        <Button
          title={step === 2 ? t("시작하기", "Get started") : t("다음", "Next")}
          onPress={() =>
            step === 2 ? update({ onboarded: true }) : setStep(step + 1)
          }
        />
      </View>
    </View>
  );
}
