import { motion, useReducedMotion } from "framer-motion";

function RouteArc() {
  const reduce = useReducedMotion();
  return (
    <svg
      viewBox="0 0 520 200"
      className="pointer-events-none absolute right-0 top-24 hidden w-[400px] text-muted opacity-70 lg:block"
      aria-hidden="true"
    >
      <path
        id="hero-route"
        d="M24 168 C 150 8, 372 8, 496 150"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="3 9"
        strokeLinecap="round"
      />
      <circle cx="24" cy="168" r="5" className="fill-brand" />
      <circle cx="496" cy="150" r="5" className="fill-brand-2" />
      <text
        x="24"
        y="192"
        className="fill-current font-mono"
        fontSize="11"
        letterSpacing="2"
      >
        HOME
      </text>
      <text
        x="496"
        y="174"
        textAnchor="end"
        className="fill-current font-mono"
        fontSize="11"
        letterSpacing="2"
      >
        NEXT STOP
      </text>
      <g className="text-brand">
        <path d="M-9 0 L9 -6 L4 0 L9 6 Z" fill="currentColor" />
        {!reduce && (
          <animateMotion dur="7s" repeatCount="indefinite" rotate="auto">
            <mpath href="#hero-route" />
          </animateMotion>
        )}
      </g>
    </svg>
  );
}

export default function Hero({ showArc }) {
  return (
    <section className="relative pb-8 pt-10 sm:pt-16">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-mono text-xs uppercase tracking-[0.22em] text-brand"
      >
        Live fares · 4 agents · SerpApi MCP
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
        className="mt-4 max-w-2xl text-balance font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl"
      >
        Where can you{" "}
        <span className="relative inline-block">
          actually
          <svg
            viewBox="0 0 200 14"
            preserveAspectRatio="none"
            className="absolute -bottom-2 left-0 h-3 w-full text-brand"
            aria-hidden="true"
          >
            <motion.path
              d="M2 9 C 40 2, 80 13, 120 6 S 180 4, 198 9"
              stroke="currentColor"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
            />
          </svg>
        </span>{" "}
        afford to go?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mt-6 max-w-xl text-lg text-muted"
      >
        Give it real dates and a real budget. Agents price live flights and
        hotels before suggesting anywhere, so every number you see is a real
        one.
      </motion.p>

      {showArc && <RouteArc />}
    </section>
  );
}
