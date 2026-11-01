import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  AppState,
  Platform,
  Pressable,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { SplashFallback } from "./SplashFallback";
import { GLView, type ExpoWebGLRenderingContext } from "expo-gl";
import { Asset } from "expo-asset";
import { useApp } from "./State";
import { ToneImage } from "./ToneImage";
import { lightAssets } from "./lightAssets";
import { darkAssets } from "./darkAssets";
import { lightTones, darkTones } from "./tones";
import { splashVertex, splashFragment, splashStars } from "./splashMotion";

type Animator = { setRunning: (running: boolean) => void; dispose: () => void };
class MotionBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
/** Keeps the original PNG as the fallback, and never intercepts onboarding gestures. */
export function AnimatedSplash({ active }: { active: boolean }) {
  const { state } = useApp();
  const [reduceMotion, setReduceMotion] = useState(true);
  const [preferenceReady, setPreferenceReady] = useState(false);
  const [requestedMotion, setRequestedMotion] = useState(false);
  const [foreground, setForeground] = useState(
    AppState.currentState !== "background",
  );
  const [visible, setVisible] = useState(
    typeof document === "undefined" || !document.hidden,
  );
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (live) {
          setReduceMotion(value);
          setPreferenceReady(true);
        }
      })
      .catch(() => {
        if (live) setPreferenceReady(true);
      });
    const motion = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (value) => {
        setReduceMotion(value);
        setRequestedMotion(false);
      },
    );
    const app = AppState.addEventListener("change", (value) =>
      setForeground(value === "active"),
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
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <ToneImage
        asset="backgrounds_covers_splash"
        style={StyleSheet.absoluteFill}
      />
      {(!reduceMotion || requestedMotion) && (
        <MotionLayer
          key={state.dark ? "dark" : "light"}
          dark={state.dark}
          running={active && foreground && visible}
        />
      )}
      {active && preferenceReady && reduceMotion && !requestedMotion && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            state.en ? "Play background motion" : "배경 움직임 재생"
          }
          onPress={(event) => {
            event.stopPropagation();
            setRequestedMotion(true);
          }}
          style={{
            position: "absolute",
            bottom: 24,
            right: 20,
            minHeight: 44,
            paddingHorizontal: 16,
            justifyContent: "center",
            borderRadius: 22,
            backgroundColor: "#332d4b99",
            borderWidth: 1,
            borderColor: "#ffffff66",
          }}
        >
          <Text
            style={{ fontFamily: "Pretendard", fontSize: 13, color: "#fff" }}
          >
            {state.en ? "Play background motion" : "배경 움직임 재생"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
function MotionLayer({ dark, running }: { dark: boolean; running: boolean }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const animator = useRef<Animator | null>(null);
  const live = useRef(true);
  const runningRef = useRef(running);
  runningRef.current = running;
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
      animator.current?.dispose();
      animator.current = null;
    };
  }, []);
  useEffect(() => {
    animator.current?.setRunning(running);
  }, [running]);
  const fail = () => {
    animator.current?.dispose();
    animator.current = null;
    if (live.current) setFailed(true);
  };
  const initialize = async (gl: ExpoWebGLRenderingContext) => {
    let dispose = () => {};
    try {
      const asset = Asset.fromModule(
        (dark ? darkAssets : lightAssets).backgrounds_covers_splash,
      );
      await asset.downloadAsync();
      if (!live.current) return;
      let image: TexImageSource;
      if (Platform.OS === "web") {
        const element = new window.Image();
        element.src = asset.localUri || asset.uri;
        await element.decode();
        image = element;
      } else
        image = {
          localUri: asset.localUri || asset.uri,
        } as unknown as TexImageSource;
      if (!live.current) return;
      const vertex = gl.createShader(gl.VERTEX_SHADER)!;
      const fragment = gl.createShader(gl.FRAGMENT_SHADER)!;
      const program = gl.createProgram()!;
      const buffer = gl.createBuffer()!;
      const texture = gl.createTexture()!;
      let frame = 0;
      let destroyed = false;
      let playing = false;
      let time = 0;
      let last = 0;
      const canvas =
        Platform.OS === "web" ? (gl.canvas as HTMLCanvasElement) : null;
      const lost = () => fail();
      canvas?.addEventListener("webglcontextlost", lost);
      dispose = () => {
        if (destroyed) return;
        destroyed = true;
        playing = false;
        cancelAnimationFrame(frame);
        canvas?.removeEventListener("webglcontextlost", lost);
        gl.deleteTexture(texture);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
      };
      for (const [shader, source] of [
        [vertex, splashVertex],
        [fragment, splashFragment],
      ] as const) {
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
          throw Error("Splash shader compilation failed");
        gl.attachShader(program, shader);
      }
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw Error("Splash shader linking failed");
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const position = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
      gl.uniform1i(gl.getUniformLocation(program, "picture"), 0);
      gl.uniform1f(gl.getUniformLocation(program, "dark"), dark ? 1 : 0);
      gl.uniform1f(
        gl.getUniformLocation(program, "saturation"),
        (dark ? darkTones : lightTones).backgrounds_covers_splash ?? 1,
      );
      gl.uniform2fv(
        gl.getUniformLocation(program, "stars[0]"),
        new Float32Array(dark ? splashStars.dark : splashStars.light),
      );
      const cover = gl.getUniformLocation(program, "cover"),
        clock = gl.getUniformLocation(program, "time");
      const draw = () => {
        if (destroyed) return;
        if (Platform.OS === "web") {
          const canvas = gl.canvas as HTMLCanvasElement;
          const scale = Math.min(window.devicePixelRatio || 1, 1.5);
          const w = Math.max(1, Math.round(canvas.clientWidth * scale)),
            h = Math.max(1, Math.round(canvas.clientHeight * scale));
          if (canvas.width !== w) canvas.width = w;
          if (canvas.height !== h) canvas.height = h;
        }
        const width = gl.drawingBufferWidth,
          height = gl.drawingBufferHeight;
        const aspect = width / Math.max(1, height),
          sourceAspect = (asset.width || 887) / (asset.height || 1774);
        gl.viewport(0, 0, width, height);
        gl.uniform2f(
          cover,
          Math.min(1, aspect / sourceAspect),
          Math.min(1, sourceAspect / aspect),
        );
        gl.uniform1f(clock, time);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.flush();
        gl.endFrameEXP();
      };
      const tick = (now: number) => {
        if (!playing || destroyed) return;
        if (!last) last = now;
        if (now - last >= 1000 / 30) {
          time += Math.min((now - last) / 1000, 0.1);
          last = now;
          try {
            draw();
          } catch {
            dispose();
            fail();
            return;
          }
        }
        frame = requestAnimationFrame(tick);
      };
      animator.current = {
        dispose,
        setRunning(value) {
          if (destroyed || playing === value) return;
          playing = value;
          if (value) {
            last = 0;
            frame = requestAnimationFrame(tick);
          } else cancelAnimationFrame(frame);
        },
      };
      draw();
      if (live.current) {
        setReady(true);
        animator.current.setRunning(runningRef.current);
      } else dispose();
    } catch {
      dispose();
      fail();
    }
  };
  if (failed) return <SplashFallback dark={dark} running={running} />;
  return (
    <MotionBoundary onError={fail}>
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { opacity: ready ? 1 : 0 }]}
        testID="splash-motion"
      >
        <GLView
          style={StyleSheet.absoluteFill}
          msaaSamples={0}
          onContextCreate={initialize}
        />
      </View>
    </MotionBoundary>
  );
}
