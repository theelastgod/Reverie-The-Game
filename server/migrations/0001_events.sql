-- The writeback log: one append-only table of what happened in the city.
-- Migrations are additive only. Never alter or drop a column that shipped;
-- add a new one, or a new table, and leave the old rows readable.
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at REAL NOT NULL,          -- wall clock, ms since the epoch, when the object wrote it
  world_now REAL NOT NULL,   -- the world's own clock, seconds
  kind TEXT NOT NULL,        -- link, wallet, under, burial, claim.filed, claim.settled, passing, credits, news
  player TEXT NOT NULL,      -- the body's public name: #0042, or GUEST
  serial INTEGER,            -- the Angel serial, null for a guest or a world event
  detail TEXT NOT NULL       -- a small JSON object
);
CREATE INDEX IF NOT EXISTS events_kind_at ON events (kind, at);
