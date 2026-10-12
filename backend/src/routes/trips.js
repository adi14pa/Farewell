import { Router } from "express";
import { tripGraph } from "../agents/graph.js";
import { query } from "../db/pool.js";

export const tripsRouter = Router();

/**
 * POST /api/trips/plan
 * Runs the full plan -> search -> compare -> act agent graph with live
 * SerpApi data, then persists the result to Neon.
 */
tripsRouter.post("/plan", async (req, res) => {
  const { origin, startDate, endDate, budgetInr, vibe } = req.body;

  if (!origin || !startDate || !endDate || !budgetInr) {
    return res.status(400).json({
      error: "origin, startDate, endDate, and budgetInr are required",
    });
  }

  try {
    const result = await tripGraph.invoke({
      origin,
      startDate,
      endDate,
      budgetInr: Number(budgetInr),
      vibe: vibe || "anything",
    });

    const status = result.winner?.totalCost != null ? "planned" : "failed";

    const { rows } = await query(
      `INSERT INTO trips (origin, start_date, end_date, budget_inr, vibe, status, winner, candidates, itinerary)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        origin,
        startDate,
        endDate,
        budgetInr,
        vibe || null,
        status,
        result.winner || null,
        JSON.stringify(result.ranked || []),
        JSON.stringify(result.itinerary || []),
      ]
    );

    res.json({ trip: rows[0], ranked: result.ranked, itinerary: result.itinerary });
  } catch (err) {
    console.error("[plan] agent graph failed:", err);
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/trips — recent saved trips */
tripsRouter.get("/", async (_req, res) => {
  const { rows } = await query(
    `SELECT id, origin, start_date, end_date, budget_inr, vibe, status, winner, created_at
     FROM trips ORDER BY created_at DESC LIMIT 20`
  );
  res.json({ trips: rows });
});

/** GET /api/trips/:id — full saved trip incl. itinerary */
tripsRouter.get("/:id", async (req, res) => {
  const { rows } = await query(`SELECT * FROM trips WHERE id = $1`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Trip not found" });
  res.json({ trip: rows[0] });
});
