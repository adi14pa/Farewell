import { useState, useEffect } from "react";

export default function Itinerary({ days, destination }) {
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    setActiveDay(0);
  }, [destination]);

  if (!days || !days.length) return null;
  const current = days[activeDay] || days[0];

  return (
    <div className="itinerary">
      <h2>Itinerary — {destination}</h2>

      <div className="day-tabs" role="tablist" aria-label="Itinerary days">
        {days.map((d, i) => (
          <button
            key={d.day ?? i}
            role="tab"
            aria-selected={activeDay === i}
            className={`day-tab${activeDay === i ? " day-tab-active" : ""}`}
            onClick={() => setActiveDay(i)}
          >
            Day {d.day ?? i + 1}
          </button>
        ))}
      </div>

      <div className="day-block" key={activeDay}>
        {current.label && <div className="day-label">{current.label}</div>}
        {(current.stops || []).map((stop, i) => (
          <div className="stop" key={i}>
            <div className="time mono">{stop.time || ""}</div>
            <div>
              <div className="name">{stop.name}</div>
              {stop.note && <div className="note">{stop.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
