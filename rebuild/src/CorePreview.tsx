import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  Modal,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import { AppState, useApp, blends, type SavedMix } from "./State";
import { Scenes, MixSheets, type Scene } from "./Scenes";
import { useSoundMix } from "./useSoundMix";
import { Welcome } from "./Welcome";
import { Toggle as Switch } from "./Toggle";
import { ToneImage } from "./ToneImage";
import type { LightAssetKey } from "./lightAssets";
const sounds = ["rain", "ocean", "wind", "cafe", "forest", "piano"] as const;
const labels = {
  rain: ["비", "Rain"],
  ocean: ["바다", "Ocean"],
  wind: ["바람", "Wind"],
  cafe: ["카페", "Café"],
  forest: ["숲", "Forest"],
  piano: ["피아노", "Piano"],
} as const;
const descriptions = {
  rain: ["차분히 내리는 빗소리", "Soft, soothing rainfall"],
  ocean: ["잔잔한 파도 소리", "Gentle ocean waves"],
  wind: ["부드럽게 스치는 바람", "A soft passing breeze"],
  cafe: ["따뜻한 카페의 생활음", "A warm café ambience"],
  forest: ["맑은 숲속의 자연 소리", "Peaceful woodland sounds"],
  piano: ["감성적인 피아노 선율", "Gentle piano melodies"],
} as const;
const presets = [
  {
    asset: "preset_rain_bedroom",
    ko: "달빛 아래의 비",
    en: "Rain under Moonlight",
    sub: ["비 · 피아노", "Rain · Piano"],
  },
  {
    asset: "preset_cafe",
    ko: "포근한 카페의 밤",
    en: "A Cozy Café Night",
    sub: ["카페 · 비", "Café · Rain"],
  },
  {
    asset: "preset_forest",
    ko: "안개 낀 숲속",
    en: "Misty Forest",
    sub: ["숲 · 바람", "Forest · Wind"],
  },
  {
    asset: "preset_ocean",
    ko: "잔잔한 바다의 꿈",
    en: "A Quiet Ocean Dream",
    sub: ["바다 · 피아노", "Ocean · Piano"],
  },
];
const purple = "#282781",
  muted = "#8882c0";
function Copy({
  children,
  style,
  ...props
}: React.ComponentProps<typeof Text>) {
  const { state } = useApp();
  return (
    <Text
      {...props}
      style={[
        styles.copy,
        state.dark && { color: "#eee8fc" },
        style,
        state.dark &&
          [muted, purple].includes(
            String(StyleSheet.flatten(style)?.color),
          ) && { color: "#d3c9e2" },
      ]}
    >
      {children}
    </Text>
  );
}
function Icon({
  name,
  size = 26,
  white = false,
}: {
  name: string;
  size?: number;
  white?: boolean;
}) {
  return (
    <View>
      <ToneImage
        asset={`ui_icons_${name}` as LightAssetKey}
        theme={white ? "dark" : undefined}
        fit="contain"
        style={{ width: size, height: size }}
      />
    </View>
  );
}
function IconButton({
  name,
  label,
  onPress,
  size = 27,
  white = false,
}: {
  name: string;
  label: string;
  onPress: () => void;
  size?: number;
  white?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.iconButton}
    >
      <Icon name={name} size={size} white={white} />
    </Pressable>
  );
}
function CTA({
  title,
  onPress,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { state } = useApp();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <LinearGradient
        colors={
          state.dark
            ? ["#dfb0ca", "#c59bca", "#a58bc4"]
            : ["#8d9cff", "#9b83df", "#edbdd9"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cta}
      >
        <Copy style={{ color: "white", fontSize: 17, textAlign: "center" }}>
          {title}
        </Copy>
      </LinearGradient>
    </Pressable>
  );
}
export default function CorePreview() {
  const [font] = useFonts({
    Pretendard: require("../../assets/fonts/Pretendard-Regular.otf"),
    PretendardSemiBold: require("../../assets/fonts/Pretendard-SemiBold.otf"),
  });
  return (
    <SafeAreaProvider>
      <AppState>{font ? <Core /> : <View />}</AppState>
    </SafeAreaProvider>
  );
}
function Core() {
  const { state, update, ready } = useApp();
  const { en, dark } = state;
  const [screen, setScreen] = useState<Scene>("home");
  const [query, setQuery] = useState("");
  const [volumes, setVolumes] = useState([70, 50, 30, 40, 60, 45]);
  const [enabled, setEnabled] = useState([true, true, true, true, true, true]);
  const [selected, setSelected] = useState(0);
  const [message, setMessage] = useState("");
  const [repeat, setRepeat] = useState(true);
  const [sheet, setSheet] = useState<"save" | "timer" | null>(null);
  const [editing, setEditing] = useState<SavedMix | null>(null);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const audio = useSoundMix(volumes, enabled, repeat, deadline, state.fade);
  const mixId = editing?.id ?? `preset-${selected}`;
  const liked = state.favorites.includes(mixId);
  const setLiked = (v: boolean) =>
    update({
      favorites: v
        ? [...new Set([...state.favorites, mixId])]
        : state.favorites.filter((x) => x !== mixId),
    });
  useEffect(() => {
    if (!deadline) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (!left) {
        audio.stop();
        setDeadline(null);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const t = (ko: string, enText: string) => (en ? enText : ko);
  const ix = en ? 1 : 0;
  const play = () => {
    const result = audio.toggle();
    if (result === "missing")
      setMessage(
        t("아직 연결된 음원이 없습니다.", "No audio source is connected yet."),
      );
    if (result === "loading")
      setMessage(
        t(
          "음원을 불러오는 중입니다. 잠시 후 다시 시도해주세요.",
          "Audio is loading. Please try again shortly.",
        ),
      );
  };
  const open = (i: number) => {
    setEditing(null);
    setSelected(i);
    setVolumes([...blends[i]]);
    setEnabled(blends[i].map((v) => v > 0));
    setScreen("player");
  };
  const cover = (i: number, style: object) => (
    <ToneImage
      asset={`backgrounds_covers_${presets[i].asset}` as LightAssetKey}
      style={style}
    />
  );
  const title = (i: number) => (en ? presets[i].en : presets[i].ko);
  const sectionHeader = (title: string) => (
    <View style={styles.header}>
      <IconButton
        name="back"
        label={t("뒤로", "Back")}
        onPress={() => setScreen("home")}
      />
      <Copy style={styles.headerTitle}>{title}</Copy>
      <View style={{ width: 44 }} />
    </View>
  );
  const nav = (
    <View
      style={[
        styles.nav,
        {
          marginBottom: Math.max(insets.bottom, 8),
          backgroundColor: dark ? "#5a4c66cc" : "#ffffffa8",
        },
      ]}
    >
      {[
        { id: "home", icon: "home", text: t("홈", "Home") },
        { id: "mixer", icon: "mixer", text: t("믹서", "Mixer") },
        { id: "player", icon: "play", text: "" },
        { id: "library", icon: "bookmark", text: t("보관함", "Library") },
        { id: "my", icon: "user", text: t("마이", "My") },
      ].map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={item.text || t("플레이어 열기", "Open player")}
          onPress={() => setScreen(item.id as Scene)}
          style={styles.navItem}
        >
          {item.id === "player" ? (
            <LinearGradient
              colors={
                dark
                  ? ["#e2b4ce", "#bf97ce", "#9b84b8"]
                  : ["#95c7ed", "#a390e7", "#dba7d4"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.centerPlay}
            >
              <Icon name="play" size={30} white />
            </LinearGradient>
          ) : (
            <>
              <Icon name={item.icon} size={28} />
              <Copy style={{ fontSize: 10, color: muted }}>{item.text}</Copy>
            </>
          )}
        </Pressable>
      ))}
    </View>
  );
  if (!ready) return <View />;
  if (!state.onboarded) return <Welcome />;
  return (
    <View style={styles.outer}>
      <View
        style={[
          styles.phone,
          {
            paddingTop: insets.top,
            backgroundColor: dark ? "#2d293c" : "#f1edf8",
          },
        ]}
      >
        {screen === "home" && (
          <>
            <ToneImage
              asset="backgrounds_covers_home_clouds"
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={
                dark
                  ? ["#27223130", "#312b4010", "#383044", "#342c42"]
                  : ["#b8b4e830", "#ece9fc10", "#f5eef8", "#e9e2fa"]
              }
              locations={[0, 0.35, 0.65, 1]}
              style={StyleSheet.absoluteFill}
            />
            <ScrollView contentContainerStyle={{ paddingBottom: 5 }}>
              <View
                style={{
                  height: Math.max(265, height * 0.34),
                  paddingHorizontal: 20,
                }}
              >
                <View
                  style={[
                    styles.row,
                    { justifyContent: "space-between", marginTop: 10 },
                  ]}
                >
                  <Copy style={{ fontSize: 13, color: "#fff" }}>
                    SOUND ROOM
                  </Copy>
                  <View style={styles.row}>
                    <IconButton
                      name="search"
                      label={t("검색", "Search")}
                      onPress={() => setScreen("explore")}
                    />
                    <ToneImage
                      asset="backgrounds_covers_profile_crescent"
                      style={{
                        width: 31,
                        height: 31,
                        borderRadius: 17,
                        borderWidth: 1,
                        borderColor: "#fff",
                      }}
                    />
                  </View>
                </View>
                <View style={{ marginTop: 47, paddingRight: 42 }}>
                  <Copy style={{ fontSize: 27, color: "#fff" }}>
                    {t("좋은 밤이에요", "Good evening")} ☾
                  </Copy>
                  <Copy
                    style={{
                      color: "#fff",
                      fontSize: 14,
                      marginTop: 10,
                      lineHeight: 20,
                    }}
                  >
                    {t(
                      "오늘은 어떤 분위기에 머물고 싶나요?",
                      "What atmosphere feels right tonight?",
                    )}
                  </Copy>
                </View>
                <View style={styles.theme}>
                  <IconButton
                    name="sun"
                    label={t("라이트모드", "Light mode")}
                    onPress={() => update({ dark: false })}
                  />
                  <IconButton
                    name="moon"
                    label={t("다크모드", "Dark mode")}
                    onPress={() => update({ dark: true })}
                  />
                </View>
              </View>
              <View style={{ paddingHorizontal: 18, gap: 9 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={title(0)}
                  onPress={() => open(0)}
                >
                  <ToneImage
                    asset="backgrounds_covers_preset_rain_bedroom"
                    style={{ height: 228, borderRadius: 25 }}
                  >
                    <LinearGradient
                      colors={["transparent", "#211d39d9"]}
                      style={[
                        StyleSheet.absoluteFill,
                        { padding: 19, justifyContent: "flex-end" },
                      ]}
                    >
                      <Copy style={{ fontSize: 12, color: "#e5def4" }}>
                        {t("오늘의 추천", "Recommended tonight")}
                      </Copy>
                      <Copy
                        style={{
                          fontSize: 20,
                          color: "#fff",
                          fontFamily: "PretendardSemiBold",
                          marginTop: 7,
                        }}
                      >
                        {title(0)}
                      </Copy>
                      <Copy
                        style={{
                          fontSize: 12,
                          lineHeight: 18,
                          color: "#fff",
                          marginTop: 6,
                          paddingRight: 56,
                        }}
                      >
                        {t(
                          "조용히 내리는 비와\n부드러운 피아노가 만드는\n평온한 밤",
                          "Soft rain and gentle piano\ncreate a peaceful night.",
                        )}
                      </Copy>
                      <View style={styles.heroPlay}>
                        <Icon name="play" size={25} white />
                      </View>
                    </LinearGradient>
                  </ToneImage>
                </Pressable>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ alignItems: "center", gap: 4 }}
                >
                  {["전체", "비", "카페", "숲", "바다", "바람", "피아노"].map(
                    (name, i) => (
                      <Pressable
                        key={name}
                        style={{
                          paddingHorizontal: 10,
                          minHeight: 36,
                          justifyContent: "center",
                          borderRadius: 18,
                          backgroundColor:
                            i === 0 ? "#ffffffbd" : "transparent",
                        }}
                        onPress={() => setScreen("explore")}
                      >
                        <Copy style={{ fontSize: 11, color: muted }}>
                          {en
                            ? [
                                "All",
                                "Rain",
                                "Café",
                                "Forest",
                                "Ocean",
                                "Wind",
                                "Piano",
                              ][i]
                            : name}
                        </Copy>
                      </Pressable>
                    ),
                  )}
                </ScrollView>
                <View style={[styles.row, { justifyContent: "space-between" }]}>
                  <Copy style={styles.section}>
                    {t("분위기 프리셋", "Atmosphere presets")}
                  </Copy>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setScreen("explore")}
                    style={{ minHeight: 44, justifyContent: "center" }}
                  >
                    <Copy style={{ fontSize: 12, color: muted }}>
                      {t("전체보기", "View all")} ›
                    </Copy>
                  </Pressable>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 9, paddingVertical: 4 }}
                >
                  {presets.map((p, i) => (
                    <Pressable
                      key={p.asset}
                      accessibilityRole="button"
                      accessibilityLabel={title(i)}
                      onPress={() => {
                        open(i);
                        setScreen("detail");
                      }}
                      style={{ width: 95, gap: 4 }}
                    >
                      {cover(i, { height: 125, borderRadius: 17 })}
                      <Copy
                        numberOfLines={1}
                        style={{
                          fontSize: 11,
                          fontFamily: "PretendardSemiBold",
                        }}
                      >
                        {title(i)}
                      </Copy>
                      <Copy style={{ fontSize: 10, color: muted }}>
                        {p.sub[ix]}
                      </Copy>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>
            {nav}
          </>
        )}
        {screen === "mixer" && (
          <>
            <LinearGradient
              colors={
                dark
                  ? ["#2c293b", "#383145", "#3d354a"]
                  : ["#d6d6f3", "#f7f3fb", "#faedf3"]
              }
              style={StyleSheet.absoluteFill}
            />
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: Math.max(16, insets.bottom),
                gap: 5,
              }}
            >
              <View style={styles.header}>
                <IconButton
                  name="back"
                  label={t("뒤로", "Back")}
                  onPress={() => setScreen("home")}
                />
                <Copy style={styles.headerTitle}>
                  {t("나만의 사운드 믹서", "Your Sound Mixer")}
                </Copy>
                <IconButton
                  name="reset"
                  label={t("초기화", "Reset")}
                  onPress={() => {
                    setEditing(null);
                    setVolumes([70, 50, 30, 40, 60, 45]);
                    setEnabled([true, true, true, true, true, true]);
                  }}
                />
              </View>
              <ToneImage
                asset="backgrounds_covers_mixer_cloud_gradient"
                style={{ borderRadius: 24, minHeight: 100, padding: 19 }}
              >
                <Copy
                  style={{
                    fontSize: 15,
                    fontFamily: "PretendardSemiBold",
                    lineHeight: 22,
                  }}
                >
                  {t(
                    "지금, 어떤 소리로\n당신의 공간을 채우고 싶나요?",
                    "What sounds will fill\nyour space tonight?",
                  )}
                </Copy>
                <Copy style={{ fontSize: 10, color: muted, marginTop: 6 }}>
                  {t(
                    "여러 소리를 섞어, 나만의 분위기를 만들어보세요.",
                    "Blend sounds into your own atmosphere.",
                  )}
                </Copy>
              </ToneImage>
              <View
                style={[
                  styles.search,
                  dark && { backgroundColor: "#51485c77" },
                ]}
              >
                <Icon name="search" size={22} />
                <TextInput
                  accessibilityLabel={t("사운드 검색하기", "Search sounds")}
                  placeholder={t("사운드 검색하기", "Search sounds")}
                  placeholderTextColor={muted}
                  value={query}
                  onChangeText={setQuery}
                  style={{
                    flex: 1,
                    fontFamily: "Pretendard",
                    fontSize: 12,
                    color: dark ? "#eee8fc" : purple,
                    minHeight: 42,
                  }}
                />
              </View>
              {sounds.map(
                (id, i) =>
                  labels[id][ix]
                    .toLowerCase()
                    .includes(query.toLowerCase()) && (
                    <View
                      key={id}
                      style={[
                        styles.soundRow,
                        dark && { backgroundColor: "#51485c77" },
                      ]}
                    >
                      <ToneImage
                        asset={`sound_mixer_${id}` as LightAssetKey}
                        fit="contain"
                        style={{ width: 65, height: 65 }}
                      />
                      <View style={{ flex: 1 }}>
                        <View
                          style={[
                            styles.row,
                            { justifyContent: "space-between" },
                          ]}
                        >
                          <View style={{ flex: 1 }}>
                            <Copy
                              style={{
                                fontFamily: "PretendardSemiBold",
                                fontSize: 15,
                              }}
                            >
                              {labels[id][ix]}
                            </Copy>
                            <Copy
                              numberOfLines={1}
                              style={{
                                fontSize: 10,
                                color: muted,
                                marginTop: 2,
                              }}
                            >
                              {descriptions[id][ix]}
                            </Copy>
                          </View>
                          <Switch
                            accessibilityLabel={labels[id][ix]}
                            value={enabled[i]}
                            onValueChange={(v) =>
                              setEnabled((a) =>
                                a.map((x, j) => (j === i ? v : x)),
                              )
                            }
                            trackColor={{
                              true: dark ? "#d6abcd" : "#8c83ed",
                              false: "#d2cde2",
                            }}
                            thumbColor="#fff"
                            style={{ transform: [{ scale: 0.7 }] }}
                          />
                        </View>
                        <View style={styles.row}>
                          <Slider
                            accessibilityLabel={`${labels[id][ix]} ${t("음량", "volume")}`}
                            minimumValue={0}
                            maximumValue={100}
                            step={1}
                            value={volumes[i]}
                            onValueChange={(v) =>
                              setVolumes((a) =>
                                a.map((x, j) => (j === i ? v : x)),
                              )
                            }
                            minimumTrackTintColor="#b29be4"
                            maximumTrackTintColor="#dfdaea"
                            thumbTintColor="#fff"
                            style={{ flex: 1, height: 25 }}
                          />
                          <Copy
                            style={{
                              width: 33,
                              fontSize: 11,
                              color: muted,
                              textAlign: "right",
                            }}
                          >
                            {volumes[i]}%
                          </Copy>
                        </View>
                      </View>
                    </View>
                  ),
              )}
              <Copy style={[styles.section, { marginTop: 5 }]}>
                {t("추천 밸런스", "Suggested blends")}
              </Copy>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 9, paddingBottom: 4 }}
              >
                {presets.map((p, i) => (
                  <Pressable
                    key={p.asset}
                    style={{ width: 83, gap: 4 }}
                    onPress={() => {
                      setEditing(null);
                      setSelected(i);
                      setVolumes(
                        [
                          [70, 0, 20, 0, 0, 45],
                          [30, 0, 0, 60, 0, 25],
                          [0, 0, 30, 0, 70, 0],
                          [0, 65, 20, 0, 0, 30],
                        ][i],
                      );
                      setEnabled(
                        [
                          [true, false, true, false, false, true],
                          [true, false, false, true, false, true],
                          [false, false, true, false, true, false],
                          [false, true, true, false, false, true],
                        ][i],
                      );
                    }}
                  >
                    {cover(i, { height: 59, borderRadius: 12 })}
                    <Copy numberOfLines={1} style={{ fontSize: 9 }}>
                      {title(i)}
                    </Copy>
                  </Pressable>
                ))}
              </ScrollView>
              <CTA
                title={t("이 분위기로 재생하기", "Play this atmosphere")}
                disabled={!enabled.some((v, i) => v && volumes[i] > 0)}
                onPress={() => setScreen("player")}
              />
            </ScrollView>
          </>
        )}
        {screen === "player" && (
          <>
            <ToneImage
              asset="backgrounds_covers_player_moon_ocean"
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={
                dark
                  ? ["transparent", "transparent", "#42374e88", "#382f47"]
                  : ["transparent", "transparent", "#8584bb88", "#797aaf"]
              }
              locations={[0, 0.48, 0.76, 1]}
              style={StyleSheet.absoluteFill}
            />
            <ScrollView
              contentContainerStyle={{
                paddingBottom: Math.max(18, insets.bottom),
                flexGrow: 1,
              }}
            >
              <View style={styles.header}>
                <IconButton
                  white
                  name="down"
                  label={t("뒤로", "Back")}
                  onPress={() => setScreen("home")}
                />
                <Copy style={{ fontSize: 15, color: "#fff" }}>
                  {t("지금 흐르는 분위기", "Now playing")}
                </Copy>
                <IconButton
                  white
                  name="more"
                  label={t("더보기", "More")}
                  onPress={() => setSheet("save")}
                />
              </View>
              <View style={{ height: Math.max(280, height * 0.42) }} />
              <View
                style={{ alignItems: "center", paddingHorizontal: 20, gap: 8 }}
              >
                <Copy
                  style={{ fontSize: 25, color: "#fff", textAlign: "center" }}
                >
                  {editing?.name ?? title(selected)}
                </Copy>
                <Copy
                  style={{
                    fontSize: 13,
                    color: "#eee7fb",
                    lineHeight: 19,
                    textAlign: "center",
                  }}
                >
                  {t(
                    "비와 피아노가 그리는\n조용하고 따뜻한 밤",
                    "Rain and piano weave\na quiet, comforting night",
                  )}
                </Copy>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("좋아요", "Like")}
                  accessibilityState={{ selected: liked }}
                  onPress={() => setLiked(!liked)}
                  style={styles.iconButton}
                >
                  <Icon white name="heart" size={30} />
                </Pressable>
                <ToneImage
                  asset="player_waveform"
                  fit="contain"
                  style={{ width: "100%", height: 49 }}
                />
                <View
                  style={[
                    styles.row,
                    { width: "100%", justifyContent: "space-between" },
                  ]}
                >
                  {sounds.map((id, i) => (
                    <Pressable
                      key={id}
                      accessibilityRole="button"
                      accessibilityLabel={labels[id][ix]}
                      onPress={() => setScreen("mixer")}
                      style={{
                        alignItems: "center",
                        gap: 4,
                        opacity: enabled[i] ? 1 : 0.4,
                      }}
                    >
                      <ToneImage
                        asset={`player_${id}` as LightAssetKey}
                        fit="contain"
                        style={{ width: 46, height: 46 }}
                      />
                      <Copy style={{ fontSize: 10, color: "#fff" }}>
                        {labels[id][ix]}
                      </Copy>
                    </Pressable>
                  ))}
                </View>
                <View
                  style={{
                    width: "100%",
                    height: 3,
                    backgroundColor: "#b6b2d2",
                    marginTop: 8,
                  }}
                />
                <View
                  style={[
                    styles.row,
                    { justifyContent: "space-between", width: "100%" },
                  ]}
                >
                  <Copy style={{ fontSize: 10, color: "#d9d5ee" }}>
                    {Math.floor(audio.elapsed / 60)}:
                    {String(Math.floor(audio.elapsed % 60)).padStart(2, "0")}
                  </Copy>
                  <Copy
                    accessibilityLabel={t("남은 시간", "Time remaining")}
                    style={{ fontSize: 10, color: "#d9d5ee" }}
                  >
                    {deadline
                      ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`
                      : "—"}
                  </Copy>
                </View>
                <View
                  style={[
                    styles.row,
                    {
                      justifyContent: "space-between",
                      width: "100%",
                      marginVertical: 3,
                    },
                  ]}
                >
                  <IconButton
                    white
                    name="shuffle"
                    label={t("믹서", "Mixer")}
                    onPress={() => setScreen("mixer")}
                  />
                  <IconButton
                    white
                    name="previous"
                    label={t("이전", "Previous")}
                    onPress={() => open((selected + 3) % 4)}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      audio.playing ? t("일시정지", "Pause") : t("재생", "Play")
                    }
                    onPress={play}
                    style={styles.play}
                  >
                    <Icon
                      white
                      name={audio.playing ? "pause" : "play"}
                      size={36}
                    />
                  </Pressable>
                  <IconButton
                    white
                    name="next"
                    label={t("다음", "Next")}
                    onPress={() => open((selected + 1) % 4)}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("반복재생", "Repeat")}
                    accessibilityState={{ selected: repeat }}
                    onPress={() => setRepeat(!repeat)}
                    style={{ opacity: repeat ? 1 : 0.4 }}
                  >
                    <Icon white name="repeat" size={28} />
                  </Pressable>
                </View>
                <View style={[styles.row, { gap: 7, width: "100%" }]}>
                  {[
                    ["timer", "타이머", "Timer"],
                    ["infinity", "하루종일", "All day"],
                    ["bookmark", "저장", "Save"],
                    ["heart", "좋아요", "Like"],
                  ].map(([icon, ko, eng]) => (
                    <Pressable
                      key={icon}
                      accessibilityRole="button"
                      accessibilityLabel={t(ko, eng)}
                      onPress={() =>
                        icon === "heart"
                          ? setLiked(!liked)
                          : icon === "infinity"
                            ? setDeadline(null)
                            : setSheet(icon === "timer" ? "timer" : "save")
                      }
                      style={styles.action}
                    >
                      <Icon white name={icon} size={26} />
                      <Copy style={{ color: "#fff", fontSize: 10 }}>
                        {t(ko, eng)}
                      </Copy>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>
          </>
        )}
        <Scenes
          screen={screen}
          navigate={setScreen}
          selected={selected}
          open={open}
          nav={nav}
          notify={setMessage}
          editSaved={(mix) => {
            setEditing(mix);
            setSelected(mix.cover);
            setVolumes([...mix.volumes]);
            setEnabled([...mix.enabled]);
          }}
        />
        {sheet && (
          <MixSheets
            key={sheet}
            sheet={sheet}
            close={() => setSheet(null)}
            volumes={volumes}
            enabled={enabled}
            selected={selected}
            editing={editing}
            onSaved={(mix) => {
              setEditing(mix);
              setScreen("library");
            }}
            onTimer={(minutes) => setDeadline(Date.now() + minutes * 60000)}
          />
        )}
        <Modal
          visible={!!message}
          transparent
          onRequestClose={() => setMessage("")}
        >
          <View style={styles.modal}>
            <View style={styles.dialog}>
              <Copy style={{ lineHeight: 23 }}>{message}</Copy>
              <Pressable
                accessibilityRole="button"
                onPress={() => setMessage("")}
                style={{ padding: 14, alignSelf: "flex-end" }}
              >
                <Copy>{t("닫기", "Close")}</Copy>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  outer: { flex: 1, alignItems: "center", backgroundColor: "#e2dbea" },
  phone: { width: "100%", maxWidth: 440, flex: 1, backgroundColor: "#f1edf8" },
  copy: { fontFamily: "Pretendard", color: purple, fontSize: 14 },
  row: { flexDirection: "row", alignItems: "center" },
  iconButton: {
    width: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 58,
    paddingHorizontal: 5,
  },
  headerTitle: {
    fontFamily: "PretendardSemiBold",
    fontSize: 17,
    flexShrink: 1,
  },
  theme: {
    position: "absolute",
    right: 20,
    top: 108,
    width: 44,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "#eae5ff40",
  },
  heroPlay: {
    position: "absolute",
    right: 18,
    bottom: 20,
    width: 46,
    height: 46,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "#e7e1f19c",
    justifyContent: "center",
    alignItems: "center",
  },
  section: { fontSize: 18, fontFamily: "PretendardSemiBold" },
  nav: {
    flexDirection: "row",
    marginHorizontal: 7,
    borderRadius: 28,
    backgroundColor: "#ffffffa8",
    minHeight: 64,
    alignItems: "center",
    boxShadow: "0 3px 12px #8a80b322",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    minHeight: 48,
    justifyContent: "center",
  },
  centerPlay: {
    width: 58,
    height: 58,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 3px 6px #867ab340",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    minHeight: 43,
    paddingHorizontal: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "#ffffff60",
  },
  soundRow: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    minHeight: 69,
    paddingHorizontal: 8,
    borderRadius: 23,
    backgroundColor: "#ffffff77",
  },
  cta: {
    minHeight: 56,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    padding: 13,
    borderWidth: 1,
    borderColor: "#ffffffb0",
    boxShadow: "0 3px 10px #a38fd14a",
  },
  play: {
    width: 74,
    height: 74,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2d9fa",
    backgroundColor: "#e8e3ff33",
  },
  action: {
    flex: 1,
    minHeight: 67,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbd4ef66",
    backgroundColor: "#c9c4eb22",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  modal: {
    flex: 1,
    backgroundColor: "#29233966",
    justifyContent: "center",
    padding: 25,
  },
  dialog: {
    backgroundColor: "#f4effb",
    padding: 22,
    borderRadius: 24,
    gap: 10,
  },
});
