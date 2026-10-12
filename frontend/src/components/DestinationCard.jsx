import { useState } from "react";

function money(n) {
  if (n == null) return "—";
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export default function DestinationCard({ rank, item, budgetInr, isWinner }) {
  const [open, setOpen] = useState(false);
  const overBudget = item.totalCost != null && item.totalCost > budgetInr;
  const hasDetails = item.searchOk !== false && item.totalCost != null;

  return (
    <div
      className={`ticket${isWinner ? " winner" : ""}${open ? " open" : ""}`}
      onClick={() => hasDetails && setOpen((o) => !o)}
      role={hasDetails ? "button" : undefined}
      tabIndex={hasDetails ? 0 : undefined}
      onKeyDown={(e) => {
        if (hasDetails && (e.key === "Enter" || e.key === " "))
          setOpen((o) => !o);
      }}
      style={{ animationDelay: `${Math.min(rank - 1, 6) * 70}ms` }}
    >
      {isWinner && <div className="stamp">Best fit</div>}
      <div className="ticket-top">
        <div className="rank">{String(rank).padStart(2, "0")}</div>

        <div className="dest">
          <div className="city">
            {item.city}, {item.country}
          </div>
          <div className="why">{item.why}</div>
          {item.searchOk === false ? (
            <span className="badge over">Live search failed</span>
          ) : item.totalCost == null ? (
            <span className="badge over">No fares found</span>
          ) : (
            <span className={`badge${overBudget ? " over" : ""}`}>
              {overBudget ? "Over budget" : "In budget"}
            </span>
          )}
        </div>

        <div className="price">
          <div className="amount mono">{money(item.totalCost)}</div>
          <div className="breakdown mono">
            {money(item.flightPricePerPerson)} flight ·{" "}
            {money(item.hotelPricePerNight)}/night
          </div>
        </div>

        {hasDetails && (
          <div className={`chevron${open ? " chevron-open" : ""}`}>⌄</div>
        )}
      </div>

      {hasDetails && (
        <div className={`ticket-details${open ? " ticket-details-open" : ""}`}>
          <div className="detail-grid">
            <div>
              <div className="detail-label">Flight (per person)</div>
              <div className="detail-value mono">
                {money(item.flightPricePerPerson)}
              </div>
            </div>
            <div>
              <div className="detail-label">Hotel · {item.nights} night(s)</div>
              <div className="detail-value mono">{money(item.hotelTotal)}</div>
            </div>
            <div>
              <div className="detail-label">Sample stay</div>
              <div className="detail-value">{item.sampleHotel || "—"}</div>
            </div>
            <div>
              <div className="detail-label">Total, real-time</div>
              <div className="detail-value mono">{money(item.totalCost)}</div>
            </div>
          </div>

          {item.topHotels?.length > 0 && (
            <div className="top-hotels">
              <div className="detail-label">Top stays found</div>
              {item.topHotels.map((h, i) => (
                <a
                  key={i}
                  className="hotel-row"
                  href={h.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="hotel-name">{h.name}</span>
                  <span className="hotel-meta mono">
                    {h.rating ? `★ ${h.rating}` : ""}
                    {h.pricePerNight
                      ? ` · ${money(h.pricePerNight)}/night`
                      : ""}
                  </span>
                  <span className="hotel-link-arrow">↗</span>
                </a>
              ))}
            </div>
          )}

          <div className="booking-actions">
            <a
              className="book-btn"
              href={item.flightBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Search flights ↗
            </a>
            <a
              className="book-btn book-btn-alt"
              href={item.hotelBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Search &amp; book hotels ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
