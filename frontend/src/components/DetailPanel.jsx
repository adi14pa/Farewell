import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, ExternalLink, Hotel, Plane, Star } from "lucide-react";
import PostcardArt from "./PostcardArt.jsx";
import BudgetBar from "./BudgetBar.jsx";
import AnimatedNumber from "./AnimatedNumber.jsx";
import { cn, inr } from "../lib/format.js";

function Stat({ label, children }) {
  return (
    <div className="rounded-2xl border border-line p-4">
      <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
        {label}
      </div>
      <div className="mt-1.5 font-display text-2xl font-bold tracking-tight">
        {children}
      </div>
    </div>
  );
}

export default function DetailPanel({ item, rank, budget, vibe }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => setCopied(false), [item.city]);

  const priced = item.totalCost != null;
  const over = priced && item.totalCost > budget;
  const isBest = rank === 1;

  function copySummary() {
    const text = [
      `${item.city}, ${item.country} — ${inr(item.totalCost)} total`,
      `Flight ${inr(item.flightPricePerPerson)} + ${item.nights} night(s) hotel ${inr(item.hotelTotal)}`,
      `Budget ${inr(budget)} · planned with Farewell`,
    ].join("\n");
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-surface shadow-xl">
      <div className="relative h-56 sm:h-72">
        <motion.div
          key={item.city}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <PostcardArt city={item.city} vibe={vibe} className="h-full w-full" />
        </motion.div>
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-black/55 px-3 py-1 font-mono text-xs text-white backdrop-blur">
            #{String(rank).padStart(2, "0")}
          </span>
          {isBest && priced && (
            <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-on-brand">
              {over ? "Closest to budget" : "Best fit"}
            </span>
          )}
        </div>

        <div className="absolute inset-x-5 bottom-5 text-white">
          <h3 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
            {item.city}
          </h3>
          <p className="mt-1 text-sm text-white/80">
            {item.country}
            {item.airportCode ? ` · ${item.airportCode}` : ""}
          </p>
        </div>
      </div>

      <div className="space-y-7 p-5 sm:p-8">
        {item.why && (
          <p className="max-w-2xl text-base text-muted">{item.why}</p>
        )}

        {priced ? (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Total">
                <AnimatedNumber value={item.totalCost} />
              </Stat>
              <Stat label="Flight">
                <AnimatedNumber value={item.flightPricePerPerson} />
              </Stat>
              <Stat label={`${item.nights}-night stay`}>
                <AnimatedNumber value={item.hotelTotal} />
              </Stat>
              <Stat label="Per night">
                <AnimatedNumber value={item.hotelPricePerNight} />
              </Stat>
            </div>

            <BudgetBar
              flight={item.flightPricePerPerson}
              hotel={item.hotelTotal}
              budget={budget}
            />
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-warn/50 bg-warn/5 p-5 text-sm">
            <p className="font-medium text-warn">
              No live fares came back for this route and these dates.
            </p>
            {item.error && (
              <p className="mt-1 break-words text-muted">{item.error}</p>
            )}
          </div>
        )}

        {item.topHotels?.length > 0 && (
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              Top stays found
            </h4>
            <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
              {item.topHotels.map((h, i) => (
                <li key={i}>
                  <a
                    href={h.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-brand/5"
                  >
                    <Hotel size={16} className="shrink-0 text-muted" />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {h.name}
                    </span>
                    {h.rating && (
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-muted">
                        <Star size={12} className="fill-brand-2 text-brand-2" />{" "}
                        {h.rating}
                      </span>
                    )}
                    {h.pricePerNight && (
                      <span className="font-mono text-xs">
                        {inr(h.pricePerNight)}/night
                      </span>
                    )}
                    <ExternalLink
                      size={14}
                      className="text-muted transition group-hover:text-brand"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {item.flightBookingUrl && (
            <a
              href={item.flightBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glow-brand inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-on-brand transition hover:-translate-y-0.5"
            >
              <Plane size={16} /> Search flights <ExternalLink size={13} />
            </a>
          )}
          {item.hotelBookingUrl && (
            <a
              href={item.hotelBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-brand"
            >
              <Hotel size={16} /> Search hotels <ExternalLink size={13} />
            </a>
          )}
          {priced && (
            <button
              type="button"
              onClick={copySummary}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition",
                copied ? "text-ok" : "text-muted hover:text-fg",
              )}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy summary"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
