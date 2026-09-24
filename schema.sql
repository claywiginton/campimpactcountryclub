-- Fußballgolf round store (Cloudflare D1).
-- Already applied to the production database; kept here so the schema is
-- reviewable, and so a local dev database can be built with:
--   cd worker && npx wrangler d1 execute fussballgolf --local --file=../schema.sql

CREATE TABLE IF NOT EXISTS rounds (
  id          TEXT PRIMARY KEY,           -- generated on the phone, stable across re-syncs
  played_on   TEXT NOT NULL,              -- YYYY-MM-DD
  pars        TEXT NOT NULL,              -- JSON array, so old rounds stay correct if the course changes
  par_total   INTEGER NOT NULL,
  hole_count  INTEGER NOT NULL DEFAULT 18,
  finished    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS round_players (
  round_id     TEXT NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  position     INTEGER NOT NULL,          -- order they were entered in
  name         TEXT NOT NULL,
  scores       TEXT NOT NULL,             -- JSON array of 18 entries, null = hole not played
  total        INTEGER NOT NULL,
  to_par       INTEGER NOT NULL,
  holes_played INTEGER NOT NULL,
  PRIMARY KEY (round_id, position)
);

CREATE INDEX IF NOT EXISTS idx_rounds_played_on ON rounds(played_on DESC);
CREATE INDEX IF NOT EXISTS idx_players_name ON round_players(name);
