-- Team platform enable/disable gating
CREATE TABLE IF NOT EXISTS team_platforms (
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  enabled_at TEXT NOT NULL DEFAULT (datetime('now')),
  enabled_by TEXT NOT NULL REFERENCES users(id),
  PRIMARY KEY (team_id, platform)
);
