import React, { useEffect, useId, useRef } from "react";
import { Asset } from "expo-asset";
import { lightAssets } from "./lightAssets";
import { darkAssets } from "./darkAssets";
import { lightTones, darkTones } from "./tones";
import { splashStars } from "./splashMotion";
/** SVG animation works in embedded browsers without a WebGL context. Same source PNG. */
export function SplashFallback({
  dark,
  running,
}: {
  dark: boolean;
  running: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const id = useId().replace(/[^a-z0-9]/gi, "");
  const href = Asset.fromModule(
    (dark ? darkAssets : lightAssets).backgrounds_covers_splash,
  ).uri;
  const saturation =
    (dark ? darkTones : lightTones).backgrounds_covers_splash ?? 1;
  useEffect(() => {
    if (running) ref.current?.unpauseAnimations();
    else ref.current?.pauseAnimations();
  }, [running]);
  const image = <image href={href} width="887" height="1774" />;
  const starList = dark ? splashStars.dark : splashStars.light;
  const moon = dark ? { x: 493, y: 495 } : { x: 507, y: 452 };
  const boat = dark ? { x: 236, y: 1210 } : { x: 232, y: 1175 };
  const horizon = dark ? 1196 : 1157;
  return (
    <svg
      ref={ref}
      data-testid="splash-motion-fallback"
      aria-hidden="true"
      viewBox="0 0 887 1774"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        filter: `saturate(${saturation})`,
      }}
    >
      <defs>
        <radialGradient id={`${id}glow`}>
          <stop offset="0%" stopColor="#fff5df" stopOpacity=".95" />
          <stop offset="28%" stopColor="#fff0da" stopOpacity=".6" />
          <stop offset="100%" stopColor="#fff0da" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}soft`}>
          <stop offset="65%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        <linearGradient id={`${id}water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="black" />
          <stop offset="8%" stopColor="white" />
          <stop offset="88%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </linearGradient>
        <mask
          id={`${id}clouds`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="887"
          height="1774"
        >
          {[
            [25, 90, 290, 190],
            [877, 400, 180, 400],
            [20, 830, 270, 300],
            [0, 1530, 210, 280],
            [887, 1490, 210, 240],
            [440, 1774, 440, 120],
          ].map(([cx, cy, rx, ry], i) => (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={`url(#${id}soft)`}
            />
          ))}
        </mask>
        <mask
          id={`${id}boat`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="887"
          height="1774"
        >
          <ellipse
            cx={boat.x}
            cy={boat.y}
            rx="69"
            ry="83"
            fill={`url(#${id}soft)`}
          />
        </mask>
        <mask
          id={`${id}sea`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="887"
          height="1774"
        >
          <rect
            x="0"
            y={horizon}
            width="887"
            height={dark ? 410 : 440}
            fill={`url(#${id}water)`}
          />
          <ellipse cx={boat.x} cy={boat.y} rx="65" ry="80" fill="black" />
          <ellipse cx="0" cy="1610" rx="240" ry="275" fill="black" />
          <ellipse cx="887" cy="1550" rx="210" ry="245" fill="black" />
        </mask>
        <mask
          id={`${id}moon`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="887"
          height="1774"
        >
          <ellipse
            cx={moon.x}
            cy={moon.y}
            rx="115"
            ry="135"
            fill={`url(#${id}soft)`}
          />
        </mask>
        <mask
          id={`${id}glints`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="887"
          height="1774"
        >
          <ellipse
            cx="460"
            cy="1390"
            rx="105"
            ry="220"
            fill={`url(#${id}soft)`}
          />
        </mask>
        {Array.from({ length: 8 }, (_, i) => (
          <mask
            key={i}
            id={`${id}star${i}`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="887"
            height="1774"
          >
            <ellipse
              cx={starList[i * 2] * 887}
              cy={starList[i * 2 + 1] * 1774}
              rx="28"
              ry="28"
              fill={`url(#${id}soft)`}
            />
          </mask>
        ))}
        {Array.from({ length: 18 }, (_, i) => (
          <clipPath key={i} id={`${id}row${i}`}>
            <rect x="0" y={horizon + i * 26} width="887" height="26.5" />
          </clipPath>
        ))}
      </defs>
      {image}
      <g mask={`url(#${id}clouds)`}>
        <g>
          {image}
          <animateTransform
            calcMode="spline"
            keyTimes="0;.25;.5;.75;1"
            keySplines=".42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1"
            attributeName="transform"
            type="translate"
            values="0 0; 23 7; 0 0; -23 -7; 0 0"
            dur="19s"
            repeatCount="indefinite"
          />
        </g>
      </g>
      <g mask={`url(#${id}sea)`}>
        {Array.from({ length: 18 }, (_, i) => (
          <g key={i} clipPath={`url(#${id}row${i})`}>
            <g>
              {image}
              <animateTransform
                calcMode="spline"
                keyTimes="0;.25;.5;.75;1"
                keySplines=".42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1"
                attributeName="transform"
                type="translate"
                values={`0 0; ${i % 2 ? 14 : -14} 0; 0 0; ${i % 2 ? -14 : 14} 0; 0 0`}
                dur={`${6 + i * 0.18}s`}
                repeatCount="indefinite"
              />
            </g>
          </g>
        ))}
      </g>
      <g mask={`url(#${id}boat)`}>
        <g>
          <g>
            {image}
            <animateTransform
              calcMode="spline"
              keyTimes="0;.25;.5;.75;1"
              keySplines=".42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1"
              attributeName="transform"
              type="rotate"
              values={`0 ${boat.x} ${boat.y}; 2 ${boat.x} ${boat.y}; 0 ${boat.x} ${boat.y}; -2 ${boat.x} ${boat.y}; 0 ${boat.x} ${boat.y}`}
              dur="9s"
              repeatCount="indefinite"
            />
          </g>
          <animateTransform
            calcMode="spline"
            keyTimes="0;.25;.5;.75;1"
            keySplines=".42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1"
            attributeName="transform"
            type="translate"
            values="0 0; 16 6; 0 0; -16 -6; 0 0"
            dur="12s"
            repeatCount="indefinite"
          />
        </g>
      </g>
      <g
        mask={`url(#${id}moon)`}
        style={{ mixBlendMode: "screen" }}
        opacity=".04"
      >
        {image}
        <ellipse
          cx={moon.x}
          cy={moon.y}
          rx="122"
          ry="145"
          fill={`url(#${id}glow)`}
        />
        <animate
          attributeName="opacity"
          values=".06;.55;.06"
          dur="7.4s"
          repeatCount="indefinite"
        />
      </g>
      <g
        mask={`url(#${id}glints)`}
        style={{ mixBlendMode: "screen" }}
        opacity=".02"
      >
        {image}
        <animate
          attributeName="opacity"
          values=".03;.48;.07;.30;.03"
          dur="4.8s"
          repeatCount="indefinite"
        />
      </g>
      {Array.from({ length: 8 }, (_, i) => (
        <g
          key={i}
          mask={`url(#${id}star${i})`}
          style={{ mixBlendMode: "screen" }}
          opacity=".02"
        >
          {image}
          <circle
            cx={starList[i * 2] * 887}
            cy={starList[i * 2 + 1] * 1774}
            r="25"
            fill={`url(#${id}glow)`}
          />
          <animate
            attributeName="opacity"
            values=".01;.01;.85;.04;.01"
            begin={`-${i * 0.83}s`}
            dur={`${3.6 + i * 0.31}s`}
            repeatCount="indefinite"
          />
        </g>
      ))}
    </svg>
  );
}
