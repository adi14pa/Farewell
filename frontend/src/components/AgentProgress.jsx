import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Compass, MapPinned, Plane, Scale } from "lucide-react";
import { cn } from "../lib/format.js";

const AGENTS = [
  {
    key: "plan",
    label: "Planner",
    Icon: Compass,
    lines: [
      "Shortlisting destinations that fit your vibe…",
      "Checking routes from your city…",
    ],
  },
  {
    key: "search",
    label: "Search",
    Icon: Plane,
    lines: [
      "Asking SerpApi's MCP server for live flights…",
      "Pulling real hotel rates for your dates…",
    ],
  },
  {
    key: "compare",
    label: "Compare",
    Icon: Scale,
    lines: ["Ranking every option against your budget…"],
  },
  {
    key: "itinerary",
    label: "Itinerary",
    Icon: MapPinned,
    lines: ["Finding real places worth visiting…", "Sequencing your days…"],
  },
];

// `activeIndex` is an estimate of which agent is running; the server answers in a
// single request, so this tracks typical timing rather than real streamed events.
export default function AgentProgress({ activeIndex }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 2200);
    return () => clearInterval(t);
  }, []);

  const active = AGENTS[Math.min(activeIndex, AGENTS.length - 1)];
  const line = active.lines[tick % active.lines.length];
  const progress = Math.min(100, (activeIndex / AGENTS.length) * 100 + 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mt-8 rounded-3xl border border-line bg-surface p-5 shadow-xl sm:p-8"
      role="status"
      aria-live="polite"
    >
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full bg-linear-to-r from-brand to-brand-2"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <ol className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {AGENTS.map(({ key, label, Icon }, i) => {
          const done = i < activeIndex;
          const current = i === activeIndex;
          return (
            <li
              key={key}
              className={cn(
                "relative rounded-2xl border p-4 transition-colors",
                current ? "border-brand bg-brand/5" : "border-line",
                done && "border-ok/40",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-full",
                    done
                      ? "bg-ok text-bg"
                      : current
                        ? "bg-brand text-on-brand"
                        : "bg-surface-2 text-muted",
                  )}
                >
                  {done ? <Check size={18} /> : <Icon size={18} />}
                </span>
                <span className="font-mono text-xs text-muted">0{i + 1}</span>
              </div>
              <div className="mt-3 text-sm font-semibold">{label}</div>
              <div className="text-xs text-muted">
                {done ? "Done" : current ? "Working…" : "Waiting"}
              </div>
              {current && (
                <motion.span
                  className="absolute inset-0 rounded-2xl border-2 border-brand"
                  animate={{ opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 h-6 overflow-hidden font-mono text-sm text-muted">
        <AnimatePresence mode="wait">
          <motion.p
            key={`${active.key}-${line}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {activeIndex >= AGENTS.length
              ? "All done. Laying out your results…"
              : line}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
