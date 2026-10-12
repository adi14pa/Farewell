import { useId, useMemo } from "react";
import { hashString, mulberry32 } from "../lib/format.js";

// Every destination gets its own generated "travel poster" so the results feel
// illustrated, without needing a photo API. Same city + vibe => same artwork.
const PALETTES = {
  dusk: {
    top: "#ff8f5e",
    bottom: "#ffd9a8",
    sun: "#fff1cf",
    layers: ["#e0607a", "#a33f6c", "#4a2457"],
  },
  lagoon: {
    top: "#3cb9e8",
    bottom: "#c4ecf6",
    sun: "#fff6cf",
    layers: ["#35a8a0", "#1d7380", "#0f4352"],
  },
  desert: {
    top: "#f3a94a",
    bottom: "#fbe4b4",
    sun: "#fffbe6",
    layers: ["#d98050", "#9a4f3d", "#522d30"],
  },
  forest: {
    top: "#79cf9d",
    bottom: "#e3f4d6",
    sun: "#fffbe0",
    layers: ["#47a37c", "#2b7059", "#143d38"],
  },
  night: {
    top: "#0a1030",
    bottom: "#3b2160",
    sun: "#f4f1ff",
    layers: ["#2a2060", "#1a1445", "#0b0a26"],
  },
};
const DAY_PALETTES = ["dusk", "lagoon", "desert", "forest"];

function mountainPath(rand, base, amp, steps = 7) {
  let d = `M0 220 L0 ${base}`;
  for (let i = 1; i <= steps; i++) {
    const x = (i / steps) * 400;
    const peak = i % 2 === 1;
    const y = base - (peak ? amp * (0.5 + rand() * 0.5) : amp * rand() * 0.25);
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d} L400 220 Z`;
}

function wavePath(base, amp, phase) {
  let d = `M0 220 L0 ${base}`;
  for (let x = 0; x <= 400; x += 8) {
    d += ` L${x} ${(base + Math.sin((x + phase) / 22) * amp).toFixed(1)}`;
  }
  return `${d} L400 220 Z`;
}

function skylinePath(rand, base, maxH) {
  let d = `M0 220 L0 ${base}`;
  let x = 0;
  while (x < 400) {
    const w = 14 + rand() * 22;
    const top = base - maxH * (0.3 + rand() * 0.7);
    d += ` L${x.toFixed(1)} ${top.toFixed(1)} L${(x + w).toFixed(1)} ${top.toFixed(1)} L${(x + w).toFixed(1)} ${base}`;
    x += w;
  }
  return `${d} L400 ${base} L400 220 Z`;
}

function archPath(rand, base, r) {
  let d = "";
  let x = rand() * 8;
  while (x < 400) {
    const top = base - (36 + rand() * 26);
    d += `M${x.toFixed(1)} 220 V${(top + r).toFixed(1)} A${r} ${r} 0 0 1 ${(x + r * 2).toFixed(1)} ${(top + r).toFixed(1)} V220 Z `;
    x += r * 2 + 6 + rand() * 10;
  }
  return d;
}

export default function PostcardArt({
  city = "",
  vibe = "Anything",
  className = "",
}) {
  const gid = useId().replace(/:/g, "");

  const art = useMemo(() => {
    const seed = hashString(`${city}|${vibe}`);
    const rand = mulberry32(seed);
    const night = vibe === "Nightlife";
    const palette = night
      ? PALETTES.night
      : PALETTES[DAY_PALETTES[seed % DAY_PALETTES.length]];
    const kind =
      vibe === "Anything"
        ? ["Mountains", "Beaches", "City break", "Heritage"][seed % 4]
        : vibe;

    const bases = [150, 172, 192];
    const amps = [62, 44, 30];
    const layers = bases.map((base, i) => {
      switch (kind) {
        case "Beaches":
          return wavePath(base + 8, 5 + i * 2, rand() * 120);
        case "City break":
        case "Nightlife":
          return skylinePath(rand, base + 6, amps[i] * 0.95);
        case "Heritage":
          return archPath(rand, base, 12 + (2 - i) * 4);
        default:
          return mountainPath(rand, base, amps[i]);
      }
    });

    const sun = {
      cx: 70 + rand() * 260,
      cy: kind === "Beaches" ? 108 : 52 + rand() * 34,
      r: 24 + rand() * 12,
    };
    const stars = night
      ? Array.from({ length: 30 }, () => ({
          x: rand() * 400,
          y: rand() * 120,
          r: 0.6 + rand() * 1.1,
        }))
      : [];

    return { palette, layers, sun, stars };
  }, [city, vibe]);

  const { palette, layers, sun, stars } = art;

  return (
    <svg
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sky-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.top} />
          <stop offset="1" stopColor={palette.bottom} />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill={`url(#sky-${gid})`} />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity="0.85" />
      ))}
      <circle
        cx={sun.cx}
        cy={sun.cy}
        r={sun.r}
        fill={palette.sun}
        opacity="0.95"
      />
      {layers.map((d, i) => (
        <path key={i} d={d} fill={palette.layers[i]} />
      ))}
    </svg>
  );
}
