import { Hono } from 'hono';
import type { Env, Variables } from '../types/bindings';
import type { CreateReportInput, UpdateReportInput } from '../types/reports';
import { requireRole } from '../middleware/team';
import { audit } from '../services/audit';
import {
  listReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  updateReportDeliveryConfig,
  listPromptVersions,
  createPromptVersion,
  listExecutions,
  getExecution,
} from '../services/d1-reports';
import { executeReport } from '../services/report-executor';

const reportRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// List reports
reportRoutes.get('/', async (c) => {
  const reports = await listReports(c.env.DB, c.var.team.id);
  return c.json(reports);
});

// Create report + initial prompt version
reportRoutes.post('/', requireRole('owner', 'admin'), async (c) => {
  const body = await c.req.json<CreateReportInput>();

  if (!body.name?.trim() || !body.platform?.trim() || !body.prompt_text?.trim()) {
    return c.json({ error: 'name, platform, and prompt_text are required' }, 400);
  }

  const report = await createReport(c.env.DB, c.var.team.id, c.var.user.id, {
    name: body.name.trim(),
    platform: body.platform.trim(),
    data_config: JSON.stringify(body.data_config || {}),
    schedule: body.schedule?.trim() || undefined,
  });

  // Create initial prompt version
  await createPromptVersion(c.env.DB, report.id, c.var.user.id, body.prompt_text.trim());

  // Encrypt and store delivery config if provided
  if (body.delivery_config) {
    await updateReportDeliveryConfig(c.env.DB, c.env.ENCRYPTION_KEY, c.var.team.id, report.id, body.delivery_config);
  }

  await audit(c.env.DB, {
    teamId: c.var.team.id,
    userId: c.var.user.id,
    action: 'report.created',
    targetType: 'report',
    targetId: report.id,
    metadata: { name: body.name, platform: body.platform },
  });

  const full = await getReport(c.env.DB, c.var.team.id, report.id);
  return c.json(full, 201);
});

// Get report detail
reportRoutes.get('/:id', async (c) => {
  const report = await getReport(c.env.DB, c.var.team.id, c.req.param('id'));
  if (!report) return c.json({ error: 'Not found' }, 404);
  return c.json(report);
});

// Update report config/schedule/delivery
reportRoutes.patch('/:id', requireRole('owner', 'admin'), async (c) => {
  const reportId = c.req.param('id');
  const body = await c.req.json<UpdateReportInput>();

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.data_config !== undefined) updates.data_config = JSON.stringify(body.data_config);
  if (body.schedule !== undefined) updates.schedule = body.schedule;
  if (body.is_active !== undefined) updates.is_active = body.is_active ? 1 : 0;

  const report = await updateReport(c.env.DB, c.var.team.id, reportId, updates as any);
  if (!report) return c.json({ error: 'Not found' }, 404);

  if (body.delivery_config) {
    await updateReportDeliveryConfig(c.env.DB, c.env.ENCRYPTION_KEY, c.var.team.id, reportId, body.delivery_config);
  }

  await audit(c.env.DB, {
    teamId: c.var.team.id,
    userId: c.var.user.id,
    action: 'report.updated',
    targetType: 'report',
    targetId: reportId,
  });

  return c.json(await getReport(c.env.DB, c.var.team.id, reportId));
});

// Delete report
reportRoutes.delete('/:id', requireRole('owner', 'admin'), async (c) => {
  const reportId = c.req.param('id');
  const deleted = await deleteReport(c.env.DB, c.var.team.id, reportId);
  if (!deleted) return c.json({ error: 'Not found' }, 404);

  await audit(c.env.DB, {
    teamId: c.var.team.id,
    userId: c.var.user.id,
    action: 'report.deleted',
    targetType: 'report',
    targetId: reportId,
  });

  return c.json({ ok: true });
});

// List prompt versions
reportRoutes.get('/:id/versions', async (c) => {
  const versions = await listPromptVersions(c.env.DB, c.req.param('id'));
  return c.json(versions);
});

// Create new prompt version
reportRoutes.post('/:id/versions', requireRole('owner', 'admin'), async (c) => {
  const body = await c.req.json<{ prompt_text: string }>();
  if (!body.prompt_text?.trim()) {
    return c.json({ error: 'prompt_text is required' }, 400);
  }

  const version = await createPromptVersion(c.env.DB, c.req.param('id'), c.var.user.id, body.prompt_text.trim());
  return c.json(version, 201);
});

// List executions (paginated)
reportRoutes.get('/:id/executions', async (c) => {
  const page = Math.max(1, Number(c.req.query('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit')) || 20));
  const result = await listExecutions(c.env.DB, c.req.param('id'), page, limit);
  return c.json(result);
});

// Manual trigger
reportRoutes.post('/:id/run', requireRole('owner', 'admin'), async (c) => {
  const reportId = c.req.param('id');
  const report = await getReport(c.env.DB, c.var.team.id, reportId);
  if (!report) return c.json({ error: 'Not found' }, 404);

  try {
    const executionId = await executeReport({
      env: c.env,
      report,
      teamId: c.var.team.id,
      triggerType: 'manual',
    });

    await audit(c.env.DB, {
      teamId: c.var.team.id,
      userId: c.var.user.id,
      action: 'report.executed',
      targetType: 'report',
      targetId: reportId,
      metadata: { execution_id: executionId, trigger: 'manual' },
    });

    return c.json({ execution_id: executionId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg }, 500);
  }
});

// Get execution detail
reportRoutes.get('/executions/:execId', async (c) => {
  const execution = await getExecution(c.env.DB, c.req.param('execId'));
  if (!execution) return c.json({ error: 'Not found' }, 404);
  return c.json(execution);
});

// Stream output from R2
reportRoutes.get('/executions/:execId/output', async (c) => {
  const execution = await getExecution(c.env.DB, c.req.param('execId'));
  if (!execution) return c.json({ error: 'Not found' }, 404);
  if (!execution.output_key) return c.json({ error: 'No output available' }, 404);

  const obj = await c.env.REPORTS_BUCKET.get(execution.output_key);
  if (!obj) return c.json({ error: 'Output not found in storage' }, 404);

  return new Response(obj.body, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, max-age=3600',
    },
  });
});

export { reportRoutes };
