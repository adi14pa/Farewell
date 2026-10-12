import { useEffect, useRef } from "react";
import { animate } from "framer-motion";
import { inr } from "../lib/format.js";

// Counts up to `value` (and between values when it changes).
export default function AnimatedNumber({
  value,
  format = inr,
  duration = 0.9,
  className,
}) {
  const ref = useRef(null);
  const prev = useRef(0);

  useEffect(() => {
    if (value == null) return;
    const controls = animate(prev.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = format(v);
      },
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, duration, format]);

  return (
    <span ref={ref} className={className}>
      {value == null ? "—" : format(0)}
    </span>
  );
}
