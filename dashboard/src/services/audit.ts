export interface AuditEntry {
  teamId?: string;
  userId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export async function audit(db: D1Database, entry: AuditEntry): Promise<void> {
  await db
    .prepare(
      `INSERT INTO audit_log (team_id, user_id, action, target_type, target_id, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .bind(
      entry.teamId ?? null,
      entry.userId ?? null,
      entry.action,
      entry.targetType ?? null,
      entry.targetId ?? null,
      entry.metadata ? JSON.stringify(entry.metadata) : null
    )
    .run();
}
