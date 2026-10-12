import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { mulberry32 } from "../lib/format.js";


const ROUTES = [
  {
    id: "route-a",
    d: "M-40 660 C 260 250, 640 170, 1010 330 S 1380 560, 1500 420",
    dur: 26,
    delay: -4,
    size: 1.2,
  },
  {
    id: "route-b",
    d: "M-40 230 C 300 30, 700 90, 980 200 S 1320 340, 1500 250",
    dur: 34,
    delay: -16,
    size: 1.0,
  },
  {
    id: "route-c",
    d: "M-40 830 C 320 700, 780 770, 1100 640 S 1400 520, 1500 570",
    dur: 30,
    delay: -22,
    size: 1.1,
  },
];

const CLOUDS = [
  { top: "7%", w: 460, h: 120, dur: 150, delay: -20 },
  { top: "25%", w: 340, h: 90, dur: 120, delay: -70 },
  { top: "50%", w: 520, h: 130, dur: 180, delay: -110 },
  { top: "69%", w: 300, h: 80, dur: 110, delay: -40 },
  { top: "86%", w: 420, h: 110, dur: 160, delay: -90 },
];


export default function Background() {
  const reduce = useReducedMotion();
  const root = useRef(null);

  const stars = useMemo(() => {
    const rand = mulberry32(2026);
    return Array.from({ length: 90 }, () => ({
      left: rand() * 100,
      top: rand() * 100,
      size: 1 + rand() * 1.8,
      dur: 2.8 + rand() * 4,
      delay: -rand() * 6,
    }));
  }, []);

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        root.current?.style.setProperty("--px", x.toFixed(3));
        root.current?.style.setProperty("--py", y.toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="bg-anim pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Slow-drifting colour glows */}
      <div className="bg-layer" style={{ "--depth": 14 }}>
        <div className="bg-glow glow-a" />
        <div className="bg-glow glow-b" />
        <div className="bg-glow glow-c" />
      </div>

   
      <div className="bg-layer bg-stars" style={{ "--depth": 8 }}>
        {stars.map((s, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              "--d": `${s.dur}s`,
              "--delay": `${s.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Clouds (light mode) */}
      <div className="bg-layer bg-clouds" style={{ "--depth": 22 }}>
        {CLOUDS.map((c, i) => (
          <span
            key={i}
            className="cloud"
            style={{
              top: c.top,
              width: c.w,
              height: c.h,
              "--dur": `${c.dur}s`,
              "--delay": `${c.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Flight routes with planes */}
      <div className="bg-layer" style={{ "--depth": 16 }}>
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full text-muted"
        >
          {ROUTES.map((r) => (
            <path
              key={r.id}
              id={r.id}
              d={r.d}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.4"
              className="route-flow"
            />
          ))}
          {!reduce &&
            ROUTES.map((r) => (
              <g key={`plane-${r.id}`} className="bg-plane text-brand">
                <path
                  d="M-10 0 L10 -6.5 L4.5 0 L10 6.5 Z"
                  fill="currentColor"
                  transform={`scale(${r.size * 1.3})`}
                />
                <animateMotion
                  dur={`${r.dur}s`}
                  begin={`${r.delay}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                >
                  <mpath href={`#${r.id}`} />
                </animateMotion>
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.05;0.95;1"
                  dur={`${r.dur}s`}
                  begin={`${r.delay}s`}
                  repeatCount="indefinite"
                />
              </g>
            ))}
        </svg>
      </div>
    </div>
  );
}
