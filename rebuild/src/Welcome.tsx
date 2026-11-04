import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Animated,
  AccessibilityInfo,
  PanResponder,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { SplashVideo } from "./SplashVideo";
import { ToneImage } from "./ToneImage";
import { useApp, presetNames } from "./State";
import { Button, Cover, Label } from "./Scenes";
export function Welcome({ onComplete }: { onComplete?: () => void }) {
  const { width } = useWindowDimensions();
  const { state } = useApp();
  const [page, setPage] = useState(0);
  const pageRef = useRef(0);
  const progress = useRef(new Animated.Value(0)).current;
  const position = useRef(0);
  const dragStart = useRef(0);
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    let live = true;
    const id = progress.addListener(({ value }) => {
      position.current = value;
    });
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (live) setReduceMotion(value);
      })
      .catch(() => {});
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      live = false;
      progress.removeListener(id);
      listener?.remove();
      progress.stopAnimation();
    };
  }, [progress]);
  const goTo = (next: number) => {
    const bounded = Math.max(0, Math.min(3, next));
    progress.stopAnimation();
    Animated.timing(progress, {
      toValue: bounded,
      duration: reduceMotion ? 0 : 420,
      easing: Easing.bezier(0.22, 0.61, 0.36, 1),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        pageRef.current = bounded;
        setPage(bounded);
      }
    });
  };
  const gestures = PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, g) =>
      Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.3,
    onPanResponderGrant: () => {
      progress.stopAnimation();
      dragStart.current = position.current;
    },
    onPanResponderMove: (_, g) =>
      progress.setValue(
        Math.max(0, Math.min(3, dragStart.current - g.dx / width)),
      ),
    onPanResponderRelease: (_, g) => {
      const direction = g.dx < 0 ? 1 : -1;
      const moved = Math.abs(g.dx) > width * 0.18 || Math.abs(g.vx) > 0.45;
      goTo(
        moved
          ? Math.round(dragStart.current) + direction
          : Math.round(dragStart.current),
      );
    },
    onPanResponderTerminate: () => goTo(pageRef.current),
  });
  return (
    <View
      testID="welcome-pager"
      {...gestures.panHandlers}
      ref={(node) => {
        const element = node as unknown as HTMLElement | null;
        if (typeof element?.setAttribute === "function")
          element.style.touchAction = "pan-y";
      }}
      style={{ flex: 1, overflow: "hidden" }}
    >
      {[0, 1, 2, 3].map((index) => {
        const opacity = progress.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, 1, 0],
          extrapolate: "clamp",
        });
        const textX = progress.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [reduceMotion ? 0 : 20, 0, reduceMotion ? 0 : -20],
          extrapolate: "clamp",
        });
        const backgroundOpacity =
          index === 0
            ? 1
            : progress.interpolate({
                inputRange: [index - 1, index],
                outputRange: [0, 1],
                extrapolate: "clamp",
              });
        const layers = (
          <>
            <Animated.View
              testID={`welcome-background-${index}`}
              style={[StyleSheet.absoluteFill, { opacity: backgroundOpacity }]}
            >
              <WelcomeBackground step={index - 1} active={page === index} />
            </Animated.View>
            <Animated.View
              pointerEvents={index === 0 ? "none" : "box-none"}
              style={{ flex: 1, opacity, transform: [{ translateX: textX }] }}
            >
              <WelcomePage
                step={index - 1}
                setStep={(step) => goTo(step + 1)}
                onComplete={onComplete}
              />
            </Animated.View>
          </>
        );
        return (
          <View
            key={index}
            testID={`welcome-scene-${index}`}
            ref={(node) => {
              const element = node as unknown as HTMLElement | null;
              if (typeof element?.setAttribute === "function") {
                if (page === index) element.removeAttribute("inert");
                else element.setAttribute("inert", "");
              }
            }}
            pointerEvents={page === index ? "auto" : "none"}
            accessibilityElementsHidden={page !== index}
            importantForAccessibility={
              page === index ? "auto" : "no-hide-descendants"
            }
            aria-hidden={page !== index}
            style={StyleSheet.absoluteFill}
          >
            {index === 0 ? (
              <Pressable
                style={{ flex: 1 }}
                accessibilityRole="button"
                accessibilityLabel={
                  state.en ? "Start onboarding" : "온보딩 시작"
                }
                onPress={() => goTo(1)}
              >
                {layers}
              </Pressable>
            ) : (
              layers
            )}
          </View>
        );
      })}
    </View>
  );
}
function WelcomeBackground({
  step,
  active,
}: {
  step: number;
  active: boolean;
}) {
  const { state } = useApp();
  if (step === -1) return <SplashVideo active={active} />;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
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
    </View>
  );
}
function WelcomePage({
  step,
  setStep,
  onComplete,
}: {
  step: number;
  setStep: (step: number) => void;
  onComplete?: () => void;
}) {
  const { state, update } = useApp();
  const insets = useSafeAreaInsets();
  const finish = () => {
    update({ onboarded: true });
    onComplete?.();
  };
  const t = (ko: string, en: string) => (state.en ? en : ko);
  if (step === -1)
    return (
      <View
        pointerEvents="none"
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <View
          pointerEvents="none"
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
    >
      <View style={{ alignItems: "flex-end", padding: 12 }}>
        <Pressable
          accessibilityRole="button"
          onPress={finish}
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
          onPress={() => (step === 2 ? finish() : setStep(step + 1))}
        />
      </View>
    </View>
  );
}
