import type { Report, ReportWithMeta, PromptVersion, ReportExecution, ExecutionStatus } from '../types/reports';
import { encrypt, decrypt } from './d1-credentials';

// --- Reports ---

export async function listReports(db: D1Database, teamId: string): Promise<ReportWithMeta[]> {
  const { results } = await db.prepare(`
    SELECT r.*,
      u.name as creator_name,
      pv.version as latest_version,
      pv.prompt_text as latest_prompt,
      e.status as last_execution_status,
      e.created_at as last_execution_at
    FROM reports r
    LEFT JOIN users u ON u.id = r.created_by
    LEFT JOIN report_prompt_versions pv ON pv.report_id = r.id
      AND pv.version = (SELECT MAX(version) FROM report_prompt_versions WHERE report_id = r.id)
    LEFT JOIN report_executions e ON e.report_id = r.id
      AND e.created_at = (SELECT MAX(created_at) FROM report_executions WHERE report_id = r.id)
    WHERE r.team_id = ?
    ORDER BY r.updated_at DESC
  `).bind(teamId).all<ReportWithMeta>();
  return results;
}

export async function getReport(db: D1Database, teamId: string, reportId: string): Promise<ReportWithMeta | null> {
  return db.prepare(`
    SELECT r.*,
      u.name as creator_name,
      pv.version as latest_version,
      pv.prompt_text as latest_prompt,
      e.status as last_execution_status,
      e.created_at as last_execution_at
    FROM reports r
    LEFT JOIN users u ON u.id = r.created_by
    LEFT JOIN report_prompt_versions pv ON pv.report_id = r.id
      AND pv.version = (SELECT MAX(version) FROM report_prompt_versions WHERE report_id = r.id)
    LEFT JOIN report_executions e ON e.report_id = r.id
      AND e.created_at = (SELECT MAX(created_at) FROM report_executions WHERE report_id = r.id)
    WHERE r.id = ? AND r.team_id = ?
  `).bind(reportId, teamId).first<ReportWithMeta>();
}

export async function createReport(
  db: D1Database,
  teamId: string,
  userId: string,
  data: { name: string; platform: string; data_config: string; schedule?: string }
): Promise<Report> {
  const id = crypto.randomUUID();
  await db.prepare(`
    INSERT INTO reports (id, team_id, name, platform, data_config, schedule, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, teamId, data.name, data.platform, data.data_config, data.schedule ?? null, userId).run();
  return (await db.prepare('SELECT * FROM reports WHERE id = ?').bind(id).first<Report>())!;
}

export async function updateReport(
  db: D1Database,
  teamId: string,
  reportId: string,
  data: { name?: string; data_config?: string; schedule?: string | null; is_active?: number }
): Promise<Report | null> {
  const fields: string[] = ["updated_at = datetime('now')"];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.data_config !== undefined) { fields.push('data_config = ?'); values.push(data.data_config); }
  if (data.schedule !== undefined) { fields.push('schedule = ?'); values.push(data.schedule); }
  if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active); }

  values.push(reportId, teamId);
  await db.prepare(`UPDATE reports SET ${fields.join(', ')} WHERE id = ? AND team_id = ?`).bind(...values).run();
  return db.prepare('SELECT * FROM reports WHERE id = ? AND team_id = ?').bind(reportId, teamId).first<Report>();
}

export async function deleteReport(db: D1Database, teamId: string, reportId: string): Promise<boolean> {
  const result = await db.prepare('DELETE FROM reports WHERE id = ? AND team_id = ?').bind(reportId, teamId).run();
  return (result.meta?.changes ?? 0) > 0;
}

export async function updateReportDeliveryConfig(
  db: D1Database,
  encryptionKey: string,
  teamId: string,
  reportId: string,
  deliveryConfig: Record<string, unknown>
): Promise<void> {
  const { ciphertext, iv } = await encrypt(encryptionKey, JSON.stringify(deliveryConfig));
  await db.prepare(`
    UPDATE reports SET delivery_config = ?, delivery_config_iv = ?, updated_at = datetime('now')
    WHERE id = ? AND team_id = ?
  `).bind(ciphertext, iv, reportId, teamId).run();
}

export async function getReportDeliveryConfig(
  db: D1Database,
  encryptionKey: string,
  teamId: string,
  reportId: string
): Promise<Record<string, unknown> | null> {
  const row = await db.prepare(
    'SELECT delivery_config, delivery_config_iv FROM reports WHERE id = ? AND team_id = ?'
  ).bind(reportId, teamId).first<{ delivery_config: string | null; delivery_config_iv: string | null }>();
  if (!row?.delivery_config || !row.delivery_config_iv) return null;
  const decrypted = await decrypt(encryptionKey, row.delivery_config, row.delivery_config_iv);
  return JSON.parse(decrypted);
}

// --- Prompt Versions ---

export async function listPromptVersions(db: D1Database, reportId: string): Promise<PromptVersion[]> {
  const { results } = await db.prepare(`
    SELECT pv.*, u.name as creator_name
    FROM report_prompt_versions pv
    LEFT JOIN users u ON u.id = pv.created_by
    WHERE pv.report_id = ?
    ORDER BY pv.version DESC
  `).bind(reportId).all<PromptVersion>();
  return results;
}

export async function createPromptVersion(
  db: D1Database,
  reportId: string,
  userId: string,
  promptText: string
): Promise<PromptVersion> {
  const id = crypto.randomUUID();
  // Get next version number
  const latest = await db.prepare(
    'SELECT MAX(version) as max_v FROM report_prompt_versions WHERE report_id = ?'
  ).bind(reportId).first<{ max_v: number | null }>();
  const version = (latest?.max_v ?? 0) + 1;

  await db.prepare(`
    INSERT INTO report_prompt_versions (id, report_id, version, prompt_text, created_by)
    VALUES (?, ?, ?, ?, ?)
  `).bind(id, reportId, version, promptText, userId).run();

  return (await db.prepare('SELECT * FROM report_prompt_versions WHERE id = ?').bind(id).first<PromptVersion>())!;
}

export async function getLatestPromptVersion(db: D1Database, reportId: string): Promise<PromptVersion | null> {
  return db.prepare(`
    SELECT * FROM report_prompt_versions
    WHERE report_id = ? ORDER BY version DESC LIMIT 1
  `).bind(reportId).first<PromptVersion>();
}

// --- Executions ---

export async function listExecutions(
  db: D1Database,
  reportId: string,
  page = 1,
  limit = 20
): Promise<{ items: ReportExecution[]; total: number; page: number; pages: number }> {
  const offset = (page - 1) * limit;
  const [countResult, { results }] = await Promise.all([
    db.prepare('SELECT COUNT(*) as total FROM report_executions WHERE report_id = ?').bind(reportId).first<{ total: number }>(),
    db.prepare(`
      SELECT re.*, pv.version as prompt_version
      FROM report_executions re
      LEFT JOIN report_prompt_versions pv ON pv.id = re.prompt_version_id
      WHERE re.report_id = ?
      ORDER BY re.created_at DESC LIMIT ? OFFSET ?
    `).bind(reportId, limit, offset).all<ReportExecution>(),
  ]);
  const total = countResult?.total ?? 0;
  return { items: results, total, page, pages: Math.ceil(total / limit) };
}

export async function getExecution(db: D1Database, executionId: string): Promise<ReportExecution | null> {
  return db.prepare(`
    SELECT re.*, pv.version as prompt_version
    FROM report_executions re
    LEFT JOIN report_prompt_versions pv ON pv.id = re.prompt_version_id
    WHERE re.id = ?
  `).bind(executionId).first<ReportExecution>();
}

export async function createExecution(
  db: D1Database,
  reportId: string,
  promptVersionId: string,
  triggerType: 'manual' | 'scheduled'
): Promise<ReportExecution> {
  const id = crypto.randomUUID();
  await db.prepare(`
    INSERT INTO report_executions (id, report_id, prompt_version_id, trigger_type, started_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).bind(id, reportId, promptVersionId, triggerType).run();
  return (await db.prepare('SELECT * FROM report_executions WHERE id = ?').bind(id).first<ReportExecution>())!;
}

export async function updateExecutionStatus(
  db: D1Database,
  executionId: string,
  status: ExecutionStatus,
  extra?: { output_key?: string; summary_text?: string; error?: string; delivery_status?: string }
): Promise<void> {
  const fields = ['status = ?'];
  const values: (string | null)[] = [status];

  if (extra?.output_key !== undefined) { fields.push('output_key = ?'); values.push(extra.output_key); }
  if (extra?.summary_text !== undefined) { fields.push('summary_text = ?'); values.push(extra.summary_text); }
  if (extra?.error !== undefined) { fields.push('error = ?'); values.push(extra.error); }
  if (extra?.delivery_status !== undefined) { fields.push('delivery_status = ?'); values.push(extra.delivery_status); }

  if (status === 'completed' || status === 'failed') {
    fields.push("completed_at = datetime('now')");
  }

  values.push(executionId);
  await db.prepare(`UPDATE report_executions SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
}

// --- Scheduled Reports ---

export async function getScheduledReports(db: D1Database): Promise<(Report & { team_id: string })[]> {
  const { results } = await db.prepare(`
    SELECT * FROM reports WHERE is_active = 1 AND schedule IS NOT NULL
  `).all<Report>();
  return results;
}
