-- Run once against your Neon database (psql, Neon SQL editor, or `npm run db:init`)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS trips (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin        TEXT NOT NULL,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  budget_inr    INTEGER NOT NULL,
  vibe          TEXT,
  status        TEXT NOT NULL DEFAULT 'planning',
  winner        JSONB,
  candidates    JSONB,
  itinerary     JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips (created_at DESC);
