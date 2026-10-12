import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Landmark,
  Loader2,
  Mountain,
  Shuffle,
  Sparkles,
  Waves,
} from "lucide-react";
import AnimatedNumber from "./AnimatedNumber.jsx";
import { addDays, cn, inr, nightsBetween, toISODate } from "../lib/format.js";

const VIBES = [
  { key: "Beaches", Icon: Waves, hint: "Sun and sea" },
  { key: "Mountains", Icon: Mountain, hint: "Peaks and air" },
  { key: "City break", Icon: Building2, hint: "Food and streets" },
  { key: "Heritage", Icon: Landmark, hint: "Forts and history" },
  { key: "Nightlife", Icon: Sparkles, hint: "After dark" },
  { key: "Anything", Icon: Shuffle, hint: "Surprise me" },
];

// These match the airports the backend knows how to resolve.
const CITIES = [
  "Bhopal",
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
];
const PRESETS = [15000, 25000, 50000, 100000];
const MIN = 5000;
const MAX = 150000;
const STEP = 1000;

const labelCls = "font-mono text-[11px] uppercase tracking-[0.18em] text-muted";
const inputCls =
  "w-full rounded-xl border border-line bg-bg px-4 py-3 text-base outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/20";

export default function PlannerForm({ onSubmit, loading }) {
  const [origin, setOrigin] = useState("Bhopal");
  const [start, setStart] = useState(() => toISODate(addDays(new Date(), 21)));
  const [end, setEnd] = useState(() => toISODate(addDays(new Date(), 26)));
  const [budget, setBudget] = useState(25000);
  const [vibe, setVibe] = useState("Anything");

  const nights = nightsBetween(start, end);
  const datesOk = nights != null && nights >= 1;
  const perNight = datesOk ? budget / nights : null;
  const fill = ((budget - MIN) / (MAX - MIN)) * 100;

  function changeStart(value) {
    setStart(value);
    if ((nightsBetween(value, end) ?? 0) < 1) {
      const d = new Date(`${value}T00:00:00`);
      setEnd(toISODate(addDays(d, 3)));
    }
  }

  function submit(e) {
    e.preventDefault();
    if (!datesOk || loading || !origin.trim()) return;
    onSubmit({
      origin: origin.trim(),
      startDate: start,
      endDate: end,
      budgetInr: budget,
      vibe,
    });
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="relative rounded-3xl border border-line bg-surface/85 p-5 shadow-xl backdrop-blur sm:p-8"
    >
      {/* Row 1: where & when */}
      <div className="grid gap-5 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <label htmlFor="origin" className={labelCls}>
            Flying from
          </label>
          <input
            id="origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Bhopal"
            className={cn(inputCls, "mt-2")}
            required
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {CITIES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setOrigin(c)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition",
                  origin === c
                    ? "border-brand bg-brand/10 text-fg"
                    : "border-line text-muted hover:border-brand/60 hover:text-fg",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="start" className={labelCls}>
            Depart
          </label>
          <input
            id="start"
            type="date"
            value={start}
            onChange={(e) => changeStart(e.target.value)}
            className={cn(inputCls, "mt-2")}
            required
          />
        </div>
        <div>
          <label htmlFor="end" className={labelCls}>
            Return
          </label>
          <input
            id="end"
            type="date"
            value={end}
            min={start}
            onChange={(e) => setEnd(e.target.value)}
            className={cn(inputCls, "mt-2")}
            required
          />
          <p
            className={cn("mt-2 text-xs", datesOk ? "text-muted" : "text-warn")}
          >
            {datesOk
              ? `${nights} night${nights > 1 ? "s" : ""}`
              : "Return must be after departure"}
          </p>
        </div>
      </div>

      {/* Row 2: vibe */}
      <div className="mt-8">
        <span className={labelCls}>Trip vibe</span>
        <div
          className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          role="radiogroup"
          aria-label="Trip vibe"
        >
          {VIBES.map(({ key, Icon, hint }) => {
            const selected = vibe === key;
            return (
              <motion.button
                type="button"
                key={key}
                role="radio"
                aria-checked={selected}
                onClick={() => setVibe(key)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="relative rounded-2xl border border-line px-4 py-4 text-left transition-colors hover:border-brand/60"
              >
                {selected && (
                  <motion.span
                    layoutId="vibe-pill"
                    className="absolute inset-0 rounded-2xl border-2 border-brand bg-brand/10"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative block">
                  <Icon
                    size={22}
                    className={selected ? "text-brand" : "text-muted"}
                    strokeWidth={1.7}
                  />
                  <span className="mt-3 block text-sm font-semibold">
                    {key}
                  </span>
                  <span className="block text-xs text-muted">{hint}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Row 3: budget */}
      <div className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <label htmlFor="budget" className={labelCls}>
              Total budget per person
            </label>
            <div className="mt-1 font-display text-5xl font-bold tracking-tight">
              <AnimatedNumber value={budget} duration={0.35} />
            </div>
            <p className="mt-1 text-sm text-muted">
              {perNight != null
                ? `${inr(perNight)} a night, flights and stay combined`
                : "Pick your dates to see a nightly figure"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setBudget(p)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  budget === p
                    ? "border-brand bg-brand/10"
                    : "border-line text-muted hover:border-brand/60 hover:text-fg",
                )}
              >
                {inr(p)}
              </button>
            ))}
          </div>
        </div>

        <input
          id="budget"
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="range mt-5"
          style={{ "--fill": `${fill}%` }}
        />
        <div className="mt-2 flex justify-between font-mono text-[11px] text-muted">
          <span>{inr(MIN)}</span>
          <span>{inr(MAX)}+</span>
        </div>
      </div>

      {/* Submit */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-dashed border-line pt-6">
        <p className="max-w-sm text-sm text-muted">
          Usually 10 to 20 seconds. Four agents plan, price, compare and
          schedule your trip.
        </p>
        <motion.button
          type="submit"
          disabled={loading || !datesOk}
          whileTap={{ scale: 0.97 }}
          className="group glow-brand inline-flex items-center gap-2.5 rounded-full bg-brand px-8 py-4 text-base font-semibold text-on-brand transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Pricing live fares
            </>
          ) : (
            <>
              Plan my trip
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}
