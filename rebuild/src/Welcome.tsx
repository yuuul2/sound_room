import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { AnimatedSplash } from "./AnimatedSplash";
import { ToneImage } from "./ToneImage";
import { useApp, presetNames } from "./State";
import { Button, Cover, Label } from "./Scenes";
export function Welcome({ onComplete }: { onComplete?: () => void }) {
  const { width: initialWidth } = useWindowDimensions();
  const [width, setWidth] = useState(initialWidth);
  const [page, setPage] = useState(0);
  const pageRef = useRef(0);
  const targetRef = useRef<number | null>(null);
  const pager = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const goTo = (next: number) => {
    const bounded = Math.max(0, Math.min(3, next));
    targetRef.current = bounded;
    pageRef.current = bounded;
    setPage(bounded);
    pager.current?.scrollTo({ x: bounded * width, animated: true });
  };
  // Keep the same page on rotation/resizing; never advance on a timer.
  useEffect(() => {
    pager.current?.scrollTo({ x: pageRef.current * width, animated: false });
  }, [width]);
  return (
    <View
      style={{ flex: 1 }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <ScrollView
        ref={pager}
        testID="welcome-pager"
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        directionalLockEnabled
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{ height: "100%" }}
        onTouchStart={() => {
          targetRef.current = null;
        }}
        onScroll={(e) => {
          if (targetRef.current !== null) {
            if (
              Math.abs(
                e.nativeEvent.contentOffset.x - targetRef.current * width,
              ) > 1
            )
              return;
            targetRef.current = null;
          }
          const next = Math.max(
            0,
            Math.min(3, Math.round(e.nativeEvent.contentOffset.x / width)),
          );
          pageRef.current = next;
          setPage(next);
        }}
      >
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={{ width, height: "100%" }}
            accessibilityElementsHidden={page !== index}
            importantForAccessibility={
              page === index ? "auto" : "no-hide-descendants"
            }
            aria-hidden={page !== index}
          >
            <WelcomePage
              active={page === index}
              step={index - 1}
              setStep={(step) => goTo(step + 1)}
              onComplete={onComplete}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
function WelcomePage({
  active,
  step,
  setStep,
  onComplete,
}: {
  active: boolean;
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("온보딩 시작", "Start onboarding")}
        onPress={() => setStep(0)}
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <AnimatedSplash active={active} />
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
      </Pressable>
    );
  return (
    <View
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
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
