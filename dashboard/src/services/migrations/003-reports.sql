-- Reports (Playbooks) feature
-- Versioned prompt-based playbooks that fetch ad platform data, analyze with Claude, store on R2

CREATE TABLE reports (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  data_config TEXT NOT NULL DEFAULT '{}',       -- JSON: date_range, metrics, dimensions
  schedule TEXT,                                 -- cron expression (null = manual only)
  delivery_config TEXT,                          -- encrypted JSON: email recipients, slack webhook
  delivery_config_iv TEXT,                       -- IV for delivery_config encryption
  is_active INTEGER NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_reports_team ON reports(team_id);
CREATE INDEX idx_reports_active_schedule ON reports(is_active, schedule) WHERE schedule IS NOT NULL;

CREATE TABLE report_prompt_versions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  prompt_text TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(report_id, version)
);

CREATE INDEX idx_prompt_versions_report ON report_prompt_versions(report_id, version DESC);

CREATE TABLE report_executions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  prompt_version_id TEXT NOT NULL REFERENCES report_prompt_versions(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','fetching_data','analyzing','delivering','completed','failed')),
  output_key TEXT,                               -- R2 object key
  summary_text TEXT,                             -- inline summary for quick display
  error TEXT,
  trigger_type TEXT NOT NULL CHECK(trigger_type IN ('manual','scheduled')),
  delivery_status TEXT,                          -- JSON: { email: 'sent'|'failed', slack: 'sent'|'failed' }
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_executions_report ON report_executions(report_id, created_at DESC);
CREATE INDEX idx_executions_status ON report_executions(status) WHERE status = 'pending';
