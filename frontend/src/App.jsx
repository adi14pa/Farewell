import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { AlertTriangle, Plane } from "lucide-react";
import Hero from "./components/Hero.jsx";
import PlannerForm from "./components/PlannerForm.jsx";
import AgentProgress from "./components/AgentProgress.jsx";
import Results from "./components/Results.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import { planTrip } from "./api/client.js";

// Rough time each agent step usually takes (ms). The server answers in one request,
// so these only drive the progress view; they are not real streamed events.
const STAGE_MS = [1200, 4200, 1200, 2600];

export default function App() {
  const [phase, setPhase] = useState("idle"); // idle | loading | done | error
  const [stage, setStage] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [budget, setBudget] = useState(0);
  const [vibe, setVibe] = useState("Anything");
  const resultsRef = useRef(null);
  const progressRef = useRef(null);

  // Bring the progress panel into view so the click clearly "did something".
  useEffect(() => {
    if (phase !== "loading") return;
    const t = setTimeout(
      () =>
        progressRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        }),
      200,
    );
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "done") {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [phase]);

  async function handlePlan(form) {
    setPhase("loading");
    setError(null);
    setResult(null);
    setStage(0);
    setBudget(Number(form.budgetInr));
    setVibe(form.vibe);

    const timers = [];
    let elapsed = 0;
    STAGE_MS.slice(0, -1).forEach((ms, i) => {
      elapsed += ms;
      timers.push(setTimeout(() => setStage(i + 1), elapsed));
    });

    try {
      const data = await planTrip(form);
      setStage(STAGE_MS.length);
      await new Promise((r) => setTimeout(r, 500)); // let the "all done" state show
      setResult(data);
      setPhase("done");
    } catch (e) {
      setError(e.message);
      setPhase("error");
    } finally {
      timers.forEach(clearTimeout);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <header className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand text-on-brand">
              <Plane size={20} className="-rotate-45" />
            </span>
            <span className="font-display text-2xl font-bold tracking-tight">
              Farewell
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted sm:inline">
              Powered by SerpApi MCP
            </span>
            <ThemeToggle />
          </div>
        </header>

        <Hero showArc={phase === "idle"} />

        <PlannerForm onSubmit={handlePlan} loading={phase === "loading"} />

        <div ref={progressRef}>
          <AnimatePresence>
            {phase === "loading" && <AgentProgress activeIndex={stage} />}
          </AnimatePresence>
        </div>

        {phase === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex gap-4 rounded-2xl border border-warn/50 bg-warn/10 p-5"
            role="alert"
          >
            <AlertTriangle className="mt-0.5 shrink-0 text-warn" size={20} />
            <div>
              <p className="font-semibold">
                Couldn't finish planning this trip
              </p>
              <p className="mt-1 break-words text-sm text-muted">{error}</p>
            </div>
          </motion.div>
        )}

        <div ref={resultsRef} className="scroll-mt-6">
          {phase === "done" && result && (
            <Results
              ranked={result.ranked}
              itinerary={result.itinerary}
              budget={budget}
              vibe={vibe}
            />
          )}
        </div>

        <footer className="mt-24 border-t border-dashed border-line pt-6 text-xs text-muted">
          Every price is fetched live through SerpApi's MCP server when you plan
          a trip. Built for the SerpApi Hackathon 2026.
        </footer>
      </div>
    </MotionConfig>
  );
}
