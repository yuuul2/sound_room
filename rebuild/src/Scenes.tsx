import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Toggle as Switch } from "./Toggle";
import { ToneImage } from "./ToneImage";
import { useApp, presetNames, covers, blends, type SavedMix } from "./State";
import type { LightAssetKey } from "./lightAssets";
export type Scene =
  "home" | "mixer" | "player" | "explore" | "detail" | "library" | "my";
export function Label({ style, ...props }: React.ComponentProps<typeof Text>) {
  const { state } = useApp();
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: "Pretendard",
          fontSize: 14,
          color: state.dark ? "#eee8fc" : "#282781",
        },
        style,
      ]}
    />
  );
}
export function Glyph({ name, size = 26 }: { name: string; size?: number }) {
  return (
    <ToneImage
      asset={`ui_icons_${name}` as LightAssetKey}
      fit="contain"
      style={{ width: size, height: size }}
    />
  );
}
export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
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
          secondary
            ? ["#ffffff22", "#ffffff22"]
            : ["#899eee", "#a18adb", "#ddb8d5"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.button}
      >
        <Label style={{ color: "#fff", fontSize: 17, textAlign: "center" }}>
          {title}
        </Label>
      </LinearGradient>
    </Pressable>
  );
}
export function Cover({
  index,
  style,
}: {
  index: number;
  style: React.ComponentProps<typeof ToneImage>["style"];
}) {
  return (
    <ToneImage
      asset={
        `backgrounds_covers_${covers[index] ?? covers[0]}` as LightAssetKey
      }
      style={style}
    />
  );
}
export function Scenes({
  screen,
  navigate,
  selected,
  open,
  nav,
  notify,
  editSaved,
  listen,
}: {
  screen: Scene;
  navigate: (s: Scene) => void;
  selected: number;
  open: (i: number) => void;
  nav: React.ReactNode;
  notify: (s: string) => void;
  editSaved: (mix: SavedMix) => void;
  listen: () => void;
}) {
  const { state, update, storageError } = useApp();
  const t = (ko: string, en: string) => (state.en ? en : ko);
  const ix = state.en ? 1 : 0;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(0);
  const [tab, setTab] = useState(0);
  const [menu, setMenu] = useState<SavedMix | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profile, setProfile] = useState(state.profile);
  const [timerEditing, setTimerEditing] = useState(false);
  const card = {
    backgroundColor: state.dark ? "#393449c9" : "#ffffff9c",
    borderColor: state.dark ? "#b4a6c42f" : "#ffffffb8",
  };
  const name = (i: number) => presetNames[i][ix];
  const header = (title: string) => (
    <View style={s.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("뒤로", "Back")}
        style={s.iconButton}
        onPress={() => navigate("home")}
      >
        <Glyph name="back" />
      </Pressable>
      <Label style={{ fontSize: 20, color: "#fff" }}>{title}</Label>
      <View style={s.iconButton} />
    </View>
  );
  const row = (
    icon: string,
    label: string,
    action: () => void,
    value?: string,
  ) => (
    <Pressable
      accessibilityRole="button"
      onPress={action}
      style={[s.setting, card]}
    >
      <Glyph name={icon} />
      <Label style={{ flex: 1, fontFamily: "PretendardSemiBold" }}>
        {label}
      </Label>
      {value && <Label style={{ fontSize: 12 }}>{value}</Label>}
      <Glyph name="next" size={18} />
    </Pressable>
  );
  const background = (
    <>
      <ToneImage
        asset="backgrounds_covers_home_clouds"
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={
          state.dark ? ["#23213222", "#2e293cdd"] : ["#ece9fa11", "#eee6f4dd"]
        }
        style={StyleSheet.absoluteFill}
      />
    </>
  );
  if (screen === "explore")
    return (
      <>
        {background}
        {header(t("분위기 탐색", "Explore atmospheres"))}
        <View style={[s.search, card]}>
          <Glyph name="search" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            accessibilityLabel={t("분위기 검색", "Search atmospheres")}
            placeholder={t(
              "어떤 분위기를 찾고 있나요?",
              "What atmosphere are you looking for?",
            )}
            placeholderTextColor={state.dark ? "#c7bbdb" : "#8d86bd"}
            style={[
              s.input,
              { flex: 1, color: state.dark ? "#fff" : "#282781" },
            ]}
          />
        </View>
        <View style={s.tabs}>
          {["전체", "수면", "집중", "휴식", "감성"].map((v, i) => (
            <Pressable
              key={v}
              accessibilityRole="button"
              accessibilityState={{ selected: category === i }}
              onPress={() => setCategory(i)}
              style={[
                s.tab,
                card,
                category === i && { backgroundColor: "#aaa0e0" },
              ]}
            >
              <Label style={{ fontSize: 12 }}>
                {state.en ? ["All", "Sleep", "Focus", "Rest", "Mood"][i] : v}
              </Label>
            </Pressable>
          ))}
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
          {presetNames
            .map((p, i) => ({ p, i }))
            .filter(
              ({ p, i }) =>
                p.join(" ").toLowerCase().includes(query.toLowerCase()) &&
                (category === 0 ||
                  [
                    [1, 4],
                    [2, 4],
                    [2, 3],
                    [1, 3],
                  ][i].includes(category)),
            )
            .map(({ i }) => (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={name(i)}
                onPress={() => {
                  open(i);
                  navigate("detail");
                }}
              >
                <Cover index={i} style={{ height: 185, borderRadius: 22 }} />
                <LinearGradient
                  colors={["transparent", "#18152ccc"]}
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      borderRadius: 22,
                      padding: 16,
                      justifyContent: "flex-end",
                    },
                  ]}
                >
                  <Label
                    style={{
                      color: "#fff",
                      fontSize: 18,
                      fontFamily: "PretendardSemiBold",
                    }}
                  >
                    {name(i)}
                  </Label>
                  <Label
                    style={{
                      color: "#fff",
                      fontSize: 12,
                      lineHeight: 18,
                      marginTop: 6,
                    }}
                  >
                    {t(
                      [
                        "조용한 비와 피아노가 만드는 평온한 밤",
                        "따뜻한 커피의 향기와 잔잔한 음악",
                        "맑은 숲속의 자연 소리로 편안해지는 시간",
                        "부드러운 파도 소리와 고요한 휴식",
                      ][i],
                      [
                        "Soft rain and piano for a peaceful night",
                        "Warm café ambience and gentle music",
                        "Unwind with peaceful woodland sounds",
                        "Gentle waves and quiet rest",
                      ][i],
                    )}
                  </Label>
                </LinearGradient>
              </Pressable>
            ))}
          {!presetNames.some(
            (p, i) =>
              p.join(" ").toLowerCase().includes(query.toLowerCase()) &&
              (category === 0 ||
                [
                  [1, 4],
                  [2, 4],
                  [2, 3],
                  [1, 3],
                ][i].includes(category)),
          ) && (
            <Label style={s.empty}>
              {t("검색 결과가 없습니다.", "No atmospheres found.")}
            </Label>
          )}
        </ScrollView>
        {nav}
      </>
    );
  if (screen === "detail")
    return (
      <>
        <ToneImage
          asset="backgrounds_covers_player_moon_ocean"
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={["transparent", state.dark ? "#332e48ee" : "#bcb4e5dd"]}
          style={StyleSheet.absoluteFill}
        />
        {header(t("분위기 상세", "Atmosphere details"))}
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingTop: 260, gap: 12 }}
        >
          <Label style={{ color: "#fff", textAlign: "center", fontSize: 25 }}>
            {name(selected)}
          </Label>
          <Label style={{ color: "#fff", textAlign: "center", lineHeight: 23 }}>
            {t(
              "소리와 밤공기가 어우러진\n조용하고 포근한 공간",
              "A quiet, cozy space\nfilled with sound and evening air",
            )}
          </Label>
          <View style={[s.panel, card]}>
            <Label style={{ fontFamily: "PretendardSemiBold" }}>
              {t("포함된 사운드", "Included sounds")}
            </Label>
            <View
              style={[
                s.inline,
                { justifyContent: "space-around", marginTop: 12 },
              ]}
            >
              {[
                ["rain", "wind", "piano"],
                ["cafe", "rain", "piano"],
                ["forest", "wind"],
                ["ocean", "wind", "piano"],
              ][selected].map((v, i) => (
                <View key={v} style={{ alignItems: "center", gap: 7 }}>
                  <ToneImage
                    asset={
                      `${["rain", "wind", "piano"].includes(v) ? "preset_detail" : "sound_mixer"}_${v}` as LightAssetKey
                    }
                    fit="contain"
                    style={{ width: 72, height: 72 }}
                  />
                  <Label>
                    {
                      (
                        {
                          rain: ["비", "Rain"],
                          wind: ["바람", "Wind"],
                          piano: ["피아노", "Piano"],
                          cafe: ["카페", "Café"],
                          forest: ["숲", "Forest"],
                          ocean: ["바다", "Ocean"],
                        } as Record<string, string[]>
                      )[v][ix]
                    }
                  </Label>
                </View>
              ))}
            </View>
          </View>
          <View style={[s.setting, card]}>
            <Glyph name="moon" />
            <Label>
              {t("추천 시간대 · 잠들기 전", "Suggested time · Before bed")}
            </Label>
          </View>
          <Button
            title={t("지금 이 분위기 듣기", "Listen to this atmosphere")}
            onPress={listen}
          />
          <Button
            title={t("내 취향대로 편집하기", "Customize this mix")}
            secondary
            onPress={() => navigate("mixer")}
          />
        </ScrollView>
      </>
    );
  if (screen === "library") {
    const likedPresets = presetsForFavorites();
    function presetsForFavorites(): SavedMix[] {
      return presetNames.flatMap((p, i) =>
        state.favorites.includes(`preset-${i}`)
          ? [
              {
                id: `preset-${i}`,
                name: p[ix],
                cover: i,
                tag: 0,
                volumes: [...blends[i]],
                enabled: blends[i].map((v) => v > 0),
                created: 0,
              },
            ]
          : [],
      );
    }
    const items = [
      ...state.saved,
      ...likedPresets.filter((p) => !state.saved.some((m) => m.id === p.id)),
    ]
      .filter((m) => tab !== 1 || state.favorites.includes(m.id))
      .sort((a, b) => (tab === 2 ? b.created - a.created : 0));
    return (
      <>
        {background}
        {header(t("나의 라이브러리", "My library"))}
        <View
          style={[s.tabs, { marginHorizontal: 16, borderRadius: 30 }, card]}
        >
          {["전체", "즐겨찾기", "최근 저장"].map((v, i) => (
            <Pressable
              key={v}
              accessibilityRole="button"
              accessibilityState={{ selected: tab === i }}
              onPress={() => setTab(i)}
              style={[s.tab, tab === i && { backgroundColor: "#ffffff77" }]}
            >
              <Label style={{ fontSize: 13 }}>
                {state.en ? ["All", "Favorites", "Recent"][i] : v}
              </Label>
            </Pressable>
          ))}
        </View>
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {items.map((m) => (
            <View
              key={m.id}
              style={[
                { width: "48%", borderRadius: 20, overflow: "hidden" },
                card,
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={m.name}
                onPress={() => {
                  editSaved(m);
                  navigate("player");
                }}
              >
                <Cover index={m.cover} style={{ height: 195 }} />
                <Label
                  numberOfLines={2}
                  style={{ padding: 10, fontFamily: "PretendardSemiBold" }}
                >
                  {m.name}
                </Label>
              </Pressable>
              <View
                style={[
                  s.inline,
                  { justifyContent: "space-between", paddingHorizontal: 6 },
                ]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("즐겨찾기", "Favorite") + " " + m.name}
                  accessibilityState={{
                    selected: state.favorites.includes(m.id),
                  }}
                  onPress={() =>
                    update({
                      favorites: state.favorites.includes(m.id)
                        ? state.favorites.filter((x) => x !== m.id)
                        : [...state.favorites, m.id],
                    })
                  }
                  style={[
                    s.iconButton,
                    { opacity: state.favorites.includes(m.id) ? 1 : 0.45 },
                  ]}
                >
                  <Glyph name="heart" size={23} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("메뉴", "Menu") + " " + m.name}
                  onPress={() => {
                    setMenu(m);
                    setDeleting(false);
                  }}
                  style={s.iconButton}
                >
                  <Glyph name="more" />
                </Pressable>
              </View>
            </View>
          ))}
          {items.length === 0 && (
            <View style={{ width: "100%", paddingVertical: 100, gap: 20 }}>
              <Label style={s.empty}>
                {t(
                  tab === 1
                    ? "즐겨찾기한 분위기가 없습니다."
                    : "아직 저장한 분위기가 없습니다.",
                  tab === 1 ? "No favorite mixes yet." : "No saved mixes yet.",
                )}
              </Label>
              <Button
                title={t("나만의 분위기 만들기", "Create your atmosphere")}
                onPress={() => navigate("mixer")}
              />
            </View>
          )}
        </ScrollView>
        {nav}
        <Modal
          visible={!!menu}
          transparent
          onRequestClose={() => setMenu(null)}
        >
          <View style={s.shade}>
            <View
              style={[
                s.panel,
                {
                  backgroundColor: state.dark ? "#363044" : "#f2edf9",
                  gap: 12,
                },
              ]}
            >
              <Label style={{ fontSize: 18 }}>
                {deleting
                  ? t("이 분위기를 삭제할까요?", "Delete this mix?")
                  : menu?.name}
              </Label>
              {!deleting && (
                <>
                  <Button
                    title={t("수정", "Edit")}
                    onPress={() => {
                      if (menu) editSaved(menu);
                      setMenu(null);
                      navigate("mixer");
                    }}
                  />
                  <Button
                    title={t("복제", "Duplicate")}
                    onPress={() => {
                      if (menu)
                        update({
                          saved: [
                            ...state.saved,
                            {
                              ...menu,
                              id: Date.now().toString(),
                              name: menu.name + t(" 복사본", " copy"),
                              created: Date.now(),
                            },
                          ],
                        });
                      setMenu(null);
                    }}
                  />
                </>
              )}
              <Button
                title={t("삭제", "Delete")}
                onPress={() => {
                  if (!deleting) {
                    setDeleting(true);
                    return;
                  }
                  if (menu)
                    update({
                      saved: state.saved.filter((x) => x.id !== menu.id),
                      favorites: state.favorites.filter((x) => x !== menu.id),
                    });
                  setMenu(null);
                }}
              />
              <Button
                secondary
                title={t("취소", "Cancel")}
                onPress={() => setMenu(null)}
              />
            </View>
          </View>
        </Modal>
      </>
    );
  }
  if (screen === "my")
    return (
      <>
        {background}
        {header(t("마이", "My space"))}
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <View style={{ alignItems: "center", paddingVertical: 12, gap: 12 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("프로필 수정", "Edit profile")}
              onPress={() => {
                setProfile(state.profile);
                setProfileEditing(true);
              }}
            >
              <ToneImage
                asset="backgrounds_covers_profile_crescent"
                style={{
                  height: 100,
                  width: 100,
                  borderRadius: 50,
                  borderWidth: 2,
                  borderColor: "#fff",
                }}
              />
            </Pressable>
            <Label style={{ fontSize: 20, fontFamily: "PretendardSemiBold" }}>
              {state.profile ||
                t("나의 작은 휴식 공간", "My little space to rest")}
            </Label>
            <Label>
              {t("오늘도 포근한 하루가 되길", "Wishing you a peaceful day")}
            </Label>
          </View>
          <View style={[s.panel, card, { gap: 5, padding: 6 }]}>
            {row(
              "timer",
              t("기본 타이머", "Default timer"),
              () => setTimerEditing(true),
              `${state.minutes}${t("분", " min")}`,
            )}
            {row(
              "moon",
              t("배경 테마", "Theme"),
              () => update({ dark: !state.dark }),
              state.dark ? t("다크모드", "Dark") : t("라이트모드", "Light"),
            )}
            {row("bell", t("알림 설정", "Notifications"), () =>
              notify(
                t(
                  "기기 알림은 아직 연결되지 않았습니다. 실제 휴대폰 빌드에서 설정할 수 있습니다.",
                  "Device notifications are not connected yet. They require a native phone build.",
                ),
              ),
            )}
            <View style={[s.setting, card]}>
              <Glyph name="sliders" />
              <Label style={{ flex: 1, fontFamily: "PretendardSemiBold" }}>
                {t("자동 페이드아웃", "Auto fade out")}
              </Label>
              <Switch
                trackColor={{
                  true: state.dark ? "#d6abcd" : "#8c83ed",
                  false: "#c2b9d2",
                }}
                thumbColor="#ffffff"
                accessibilityLabel={t("자동 페이드아웃", "Auto fade out")}
                value={state.fade}
                onValueChange={(fade) => update({ fade })}
              />
            </View>
            {row(
              "settings",
              t("언어", "Language"),
              () => update({ en: !state.en }),
              state.en ? "English" : "한국어",
            )}
          </View>
          <View style={[s.panel, card, { gap: 5, padding: 6 }]}>
            {row("info", t("앱 소개", "About"), () =>
              notify(
                t(
                  "SOUND ROOM\n나만의 소리로 채우는 휴식 공간.\n현재 기기 테스트를 준비 중인 개발 버전입니다.",
                  "SOUND ROOM\nYour personal space for sound and rest.\nDevelopment version; phone testing is being prepared.",
                ),
              ),
            )}
            {row("mail", t("문의하기", "Contact"), () =>
              notify(
                t(
                  "출시용 문의 주소는 아직 등록되지 않았습니다.",
                  "A support address has not been configured yet.",
                ),
              ),
            )}
          </View>
          {storageError && (
            <Label accessibilityRole="alert">
              {t(
                "기기에 저장하지 못했습니다. 저장 공간을 확인해주세요.",
                "Could not save on this device. Check available storage.",
              )}
            </Label>
          )}
        </ScrollView>
        {nav}
        <Modal
          visible={profileEditing || timerEditing}
          transparent
          onRequestClose={() => {
            setProfileEditing(false);
            setTimerEditing(false);
          }}
        >
          <View style={s.shade}>
            <View
              style={[
                s.panel,
                {
                  backgroundColor: state.dark ? "#363044" : "#f2edf9",
                  gap: 14,
                },
              ]}
            >
              <Label>
                {profileEditing
                  ? t("프로필 이름", "Profile name")
                  : t("기본 타이머", "Default timer")}
              </Label>
              {profileEditing ? (
                <TextInput
                  accessibilityLabel={t("프로필 이름", "Profile name")}
                  value={profile}
                  onChangeText={setProfile}
                  maxLength={40}
                  style={[
                    s.input,
                    card,
                    { color: state.dark ? "#fff" : "#282781" },
                  ]}
                />
              ) : (
                <View style={s.inline}>
                  {[15, 30, 45, 60].map((minutes) => (
                    <Pressable
                      key={minutes}
                      onPress={() => update({ minutes })}
                      style={[
                        s.tab,
                        state.minutes === minutes && {
                          backgroundColor: "#aaa0e0",
                        },
                      ]}
                    >
                      <Label>{minutes}</Label>
                    </Pressable>
                  ))}
                </View>
              )}
              <Button
                title={t("확인", "Done")}
                onPress={() => {
                  if (profileEditing) update({ profile: profile.trim() });
                  setProfileEditing(false);
                  setTimerEditing(false);
                }}
              />
            </View>
          </View>
        </Modal>
      </>
    );
  return null;
}
export function MixSheets({
  sheet,
  close,
  volumes,
  enabled,
  selected,
  editing,
  onSaved,
  onTimer,
}: {
  sheet: "save" | "timer" | null;
  close: () => void;
  volumes: number[];
  enabled: boolean[];
  selected: number;
  editing: SavedMix | null;
  onSaved: (m: SavedMix) => void;
  onTimer: (minutes: number) => void;
}) {
  const { state, update } = useApp();
  const t = (ko: string, en: string) => (state.en ? en : ko);
  const [name, setName] = useState(
    editing?.name ?? presetNames[selected][state.en ? 1 : 0],
  );
  const [tag, setTag] = useState(editing?.tag ?? 0);
  const [cover, setCover] = useState(editing?.cover ?? selected);
  const [minutes, setMinutes] = useState(String(state.minutes));
  const [custom, setCustom] = useState(false);
  const validMinutes =
    /^\d+$/.test(minutes) && Number(minutes) >= 1 && Number(minutes) <= 1440;
  const panel = { backgroundColor: state.dark ? "#373143f5" : "#f1ecfaf5" };
  return (
    <Modal
      visible={!!sheet}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#17122455",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("닫기", "Close")}
            onPress={close}
            style={{ flex: 1 }}
          />
          <View style={[s.sheet, panel]}>
            <View
              style={{
                alignSelf: "center",
                height: 6,
                width: 46,
                borderRadius: 3,
                backgroundColor: "#aaa2d5",
                marginBottom: 12,
              }}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("닫기", "Close")}
              onPress={close}
              style={{ position: "absolute", right: 12, top: 12, padding: 10 }}
            >
              <Glyph name="close" />
            </Pressable>
            <Label
              style={{
                fontSize: 22,
                textAlign: "center",
                fontFamily: "PretendardSemiBold",
                marginVertical: 12,
              }}
            >
              {sheet === "timer"
                ? t("언제까지 함께할까요?", "How long shall we stay?")
                : t("이 분위기를 저장할까요?", "Save this atmosphere?")}
            </Label>
            {sheet === "timer" ? (
              <>
                <Label style={{ textAlign: "center" }}>
                  {t(
                    "원하는 시간 동안 이 분위기를 유지해보세요",
                    "Keep this atmosphere for as long as you like",
                  )}
                </Label>
                <View style={[s.inline, { gap: 8, marginVertical: 15 }]}>
                  {[15, 30, 45, 60].map((n) => (
                    <Pressable
                      key={n}
                      accessibilityRole="button"
                      accessibilityLabel={`${n}${t("분", " minutes")}`}
                      accessibilityState={{ selected: minutes === String(n) }}
                      onPress={() => {
                        setMinutes(String(n));
                        setCustom(false);
                      }}
                      style={[
                        s.timerTile,
                        {
                          backgroundColor:
                            minutes === String(n) ? "#a396df" : "#ffffff25",
                        },
                      ]}
                    >
                      <Glyph name="timer" />
                      <Label>
                        {n}
                        {t("분", " min")}
                      </Label>
                    </Pressable>
                  ))}
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setCustom(!custom)}
                  style={s.setting}
                >
                  <Glyph name="sliders" />
                  <Label>{t("직접 설정", "Custom duration")}</Label>
                </Pressable>
                {custom && (
                  <TextInput
                    accessibilityLabel={t("직접 설정 분", "Custom minutes")}
                    keyboardType="number-pad"
                    value={minutes}
                    onChangeText={setMinutes}
                    placeholder="1–1440"
                    style={[
                      s.input,
                      { color: state.dark ? "#fff" : "#282781" },
                    ]}
                  />
                )}
                <View style={s.setting}>
                  <Label style={{ flex: 1 }}>
                    {t(
                      "끝나기 전 천천히 소리 줄이기",
                      "Fade out before the end",
                    )}
                  </Label>
                  <Switch
                    trackColor={{
                      true: state.dark ? "#d6abcd" : "#8c83ed",
                      false: "#c2b9d2",
                    }}
                    thumbColor="#ffffff"
                    accessibilityLabel={t("페이드아웃", "Fade out")}
                    value={state.fade}
                    onValueChange={(fade) => update({ fade })}
                  />
                </View>
                <Button
                  title={t("타이머 시작하기", "Start timer")}
                  disabled={!validMinutes}
                  onPress={() => {
                    onTimer(Number(minutes));
                    close();
                  }}
                />
              </>
            ) : (
              <>
                <Label>{t("이름", "Name")}</Label>
                <TextInput
                  accessibilityLabel={t("분위기 이름", "Mix name")}
                  value={name}
                  onChangeText={setName}
                  maxLength={60}
                  style={[
                    s.input,
                    {
                      color: state.dark ? "#fff" : "#282781",
                      borderWidth: 1,
                      borderColor: "#bfb3e7",
                      borderRadius: 16,
                    },
                  ]}
                />
                <Label style={{ marginTop: 10 }}>
                  {t("어떤 분위기인가요?", "What is the mood?")}
                </Label>
                <View style={[s.inline, { gap: 7, marginVertical: 10 }]}>
                  {["수면", "집중", "휴식", "감성"].map((v, i) => (
                    <Pressable
                      key={v}
                      accessibilityRole="button"
                      accessibilityState={{ selected: tag === i }}
                      onPress={() => setTag(i)}
                      style={[
                        s.tab,
                        {
                          backgroundColor: tag === i ? "#a396df" : "#ffffff33",
                        },
                      ]}
                    >
                      <Label>
                        {state.en ? ["Sleep", "Focus", "Rest", "Mood"][i] : v}
                      </Label>
                    </Pressable>
                  ))}
                </View>
                <Label>{t("대표 무드 선택", "Choose a cover")}</Label>
                <View style={[s.inline, { gap: 8, marginVertical: 10 }]}>
                  {covers.map((v, i) => (
                    <Pressable
                      key={v}
                      accessibilityRole="button"
                      accessibilityLabel={presetNames[i][state.en ? 1 : 0]}
                      accessibilityState={{ selected: cover === i }}
                      onPress={() => setCover(i)}
                      style={{
                        flex: 1,
                        borderRadius: 13,
                        borderWidth: 2,
                        borderColor: cover === i ? "#9c88de" : "transparent",
                      }}
                    >
                      <Cover
                        index={i}
                        style={{ height: 75, borderRadius: 11 }}
                      />
                      {cover === i && (
                        <View
                          style={{ position: "absolute", right: 4, bottom: 4 }}
                        >
                          <Glyph name="check" size={22} />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
                <Button
                  title={t("이 분위기 저장하기", "Save this atmosphere")}
                  disabled={!name.trim()}
                  onPress={() => {
                    const mix: SavedMix = {
                      id: editing?.id ?? Date.now().toString(),
                      created: editing?.created ?? Date.now(),
                      name: name.trim(),
                      tag,
                      cover,
                      volumes: [...volumes],
                      enabled: [...enabled],
                    };
                    update({
                      saved: [
                        ...state.saved.filter((x) => x.id !== mix.id),
                        mix,
                      ],
                    });
                    onSaved(mix);
                    close();
                  }}
                />
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 60,
    paddingHorizontal: 8,
  },
  iconButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  inline: { flexDirection: "row", alignItems: "center" },
  button: {
    minHeight: 56,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#ffffff99",
    padding: 13,
    justifyContent: "center",
  },
  search: {
    marginHorizontal: 16,
    borderRadius: 25,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: { minHeight: 44, padding: 10, fontFamily: "Pretendard", fontSize: 14 },
  tabs: {
    flexDirection: "row",
    gap: 7,
    padding: 5,
    marginHorizontal: 12,
    marginTop: 8,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  panel: {
    padding: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ffffff66",
  },
  setting: {
    minHeight: 60,
    borderRadius: 20,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  empty: { textAlign: "center", padding: 20 },
  shade: {
    flex: 1,
    backgroundColor: "#201a3455",
    padding: 25,
    justifyContent: "center",
  },
  sheet: {
    padding: 18,
    paddingBottom: 32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: "#ffffff88",
    gap: 5,
  },
  timerTile: {
    flex: 1,
    minHeight: 80,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
