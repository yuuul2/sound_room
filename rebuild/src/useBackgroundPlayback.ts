import { useEffect, useState } from "react";
import { AccessibilityInfo, AppState } from "react-native";
export function useBackgroundPlayback(active: boolean) {
  const [reduce, setReduce] = useState(true);
  const [ready, setReady] = useState(false);
  const [requested, setRequested] = useState(false);
  const [visible, setVisible] = useState(
    AppState.currentState !== "background" &&
      (typeof document === "undefined" || !document.hidden),
  );
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (live) {
          setReduce(value);
          setReady(true);
        }
      })
      .catch(() => {
        if (live) setReady(true);
      });
    const motion = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (value) => {
        setReduce(value);
        setRequested(false);
      },
    );
    const app = AppState.addEventListener("change", (value) =>
      setVisible(value === "active"),
    );
    const visibility = () => setVisible(!document.hidden);
    if (typeof document !== "undefined")
      document.addEventListener("visibilitychange", visibility);
    return () => {
      live = false;
      motion?.remove();
      app.remove();
      if (typeof document !== "undefined")
        document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return {
    running: active && visible && ready && (!reduce || requested),
    needsPlay: active && ready && reduce && !requested,
    request: () => setRequested(true),
  };
}
