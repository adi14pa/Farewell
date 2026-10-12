import { motion } from "framer-motion";
import { inr } from "../lib/format.js";

// Shows exactly where the money goes: flights + hotel against the user's budget.
export default function BudgetBar({ flight = 0, hotel = 0, budget }) {
  const total = flight + hotel;
  const scale = Math.max(budget, total) || 1;
  const pct = (v) => `${Math.min(100, (v / scale) * 100)}%`;
  const over = total > budget;
  const diff = Math.abs(budget - total);

  return (
    <div>
      <div className="relative">
        <div className="flex h-4 overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className="h-full bg-brand"
            initial={{ width: 0 }}
            animate={{ width: pct(flight) }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.div
            className="h-full bg-brand-2"
            initial={{ width: 0 }}
            animate={{ width: pct(hotel) }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        {over && (
          <div
            className="absolute -bottom-1 -top-1 w-0.5 rounded bg-fg"
            style={{ left: pct(budget) }}
            title="Your budget"
          />
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-brand" /> Flight{" "}
          {inr(flight)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-brand-2" /> Hotel{" "}
          {inr(hotel)}
        </span>
        <span
          className={
            over
              ? "ml-auto font-medium text-warn"
              : "ml-auto font-medium text-ok"
          }
        >
          {over ? `${inr(diff)} over budget` : `${inr(diff)} to spare`}
        </span>
      </div>
    </div>
  );
}
