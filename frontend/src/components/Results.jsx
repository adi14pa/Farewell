import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DestinationCard from "./DestinationCard.jsx";
import DetailPanel from "./DetailPanel.jsx";
import Itinerary from "./Itinerary.jsx";
import { inr } from "../lib/format.js";

export default function Results({ ranked, itinerary, budget, vibe }) {
  const [sel, setSel] = useState(0);
  const detailRef = useRef(null);
  useEffect(() => setSel(0), [ranked]);

  if (!ranked?.length) return null;
  const item = ranked[sel] || ranked[0];
  const fits = ranked.filter(
    (r) => r.totalCost != null && r.totalCost <= budget,
  ).length;

  function pick(i) {
    setSel(i);
    // On small screens the detail panel sits below the list, so bring it into view.
    if (window.innerWidth < 1024) {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <section className="mt-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
            Results
          </p>
          <h2 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Ranked by real cost
          </h2>
        </div>
        <p className="text-sm text-muted">
          {fits > 0
            ? `${fits} of ${ranked.length} options fit within ${inr(budget)}`
            : `Nothing fit ${inr(budget)}. These are the closest.`}
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="min-w-0 space-y-3 lg:sticky lg:top-6 lg:self-start">
          {ranked.map((r, i) => (
            <DestinationCard
              key={`${r.city}-${i}`}
              rank={i + 1}
              item={r}
              budget={budget}
              vibe={vibe}
              selected={i === sel}
              onSelect={() => pick(i)}
            />
          ))}
          <p className="px-1 pt-1 text-xs text-muted">
            Prices were fetched live when you hit plan.
          </p>
        </div>

        <div ref={detailRef} className="min-w-0 scroll-mt-6 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${item.city}-${sel}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <DetailPanel
                item={item}
                rank={sel + 1}
                budget={budget}
                vibe={vibe}
              />
            </motion.div>
          </AnimatePresence>

          {sel === 0 && itinerary?.length > 0 && (
            <Itinerary days={itinerary} destination={ranked[0].city} />
          )}
          {sel !== 0 && itinerary?.length > 0 && (
            <button
              type="button"
              onClick={() => pick(0)}
              className="w-full rounded-2xl border border-dashed border-line p-5 text-left text-sm text-muted transition hover:border-brand hover:text-fg"
            >
              The day-by-day itinerary is built for the top pick,{" "}
              {ranked[0].city}. Tap to jump back to it.
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
