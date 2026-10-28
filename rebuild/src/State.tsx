import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
export type SavedMix = {
  id: string;
  name: string;
  cover: number;
  tag: number;
  volumes: number[];
  enabled: boolean[];
  created: number;
};
export type Preferences = {
  dark: boolean;
  en: boolean;
  onboarded: boolean;
  fade: boolean;
  minutes: number;
  profile: string;
  saved: SavedMix[];
  favorites: string[];
};
const defaults: Preferences = {
  dark: false,
  en: getLocales()[0]?.languageCode !== "ko",
  onboarded: false,
  fade: true,
  minutes: 30,
  profile: "",
  saved: [],
  favorites: [],
};
const Context = createContext<{
  state: Preferences;
  update: (p: Partial<Preferences>) => void;
  ready: boolean;
  storageError: boolean;
}>({ state: defaults, update: () => {}, ready: false, storageError: false });
export function AppState({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(defaults);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem("sound-room.confirmed-design.v1")
      .then((value) => {
        if (value) {
          const data = JSON.parse(value);
          setState({
            ...defaults,
            ...data,
            saved: Array.isArray(data.saved) ? data.saved : [],
            favorites: Array.isArray(data.favorites) ? data.favorites : [],
          });
        }
      })
      .catch(() => setStorageError(true))
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready)
      AsyncStorage.setItem(
        "sound-room.confirmed-design.v1",
        JSON.stringify(state),
      ).catch(() => setStorageError(true));
  }, [state, ready]);
  return (
    <Context.Provider
      value={{
        state,
        update: (p) => setState((s) => ({ ...s, ...p })),
        ready,
        storageError,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useApp = () => useContext(Context);
export const presetNames = [
  ["달빛 아래의 비", "Rain under Moonlight"],
  ["포근한 카페의 밤", "A Cozy Café Night"],
  ["안개 낀 숲속", "Misty Forest"],
  ["잔잔한 바다의 꿈", "A Quiet Ocean Dream"],
];
export const covers = [
  "preset_rain_bedroom",
  "preset_cafe",
  "preset_forest",
  "preset_ocean",
];
export const blends = [
  [70, 0, 20, 0, 0, 45],
  [30, 0, 0, 60, 0, 25],
  [0, 0, 30, 0, 70, 0],
  [0, 65, 20, 0, 0, 30],
];
