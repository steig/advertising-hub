import { Hono } from 'hono';
import type { Env, Variables } from '../types/bindings';
import { PLATFORM_CREDENTIALS } from '../types/auth';
import {
  getCredential,
  putCredential,
  deleteCredential,
  listCredentialStatus,
} from '../services/d1-credentials';

const VALID_PLATFORMS = new Set(PLATFORM_CREDENTIALS.map((p) => p.platform));

const credentialRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

credentialRoutes.get('/', async (c) => {
  const teamId = c.var.team.id;
  const statuses = await listCredentialStatus(c.env.DB, teamId);
  return c.json(statuses);
});

credentialRoutes.get('/:platform', async (c) => {
  const platform = c.req.param('platform');
  if (!VALID_PLATFORMS.has(platform)) {
    return c.json({ ok: false, error: 'Unknown platform' }, 400);
  }

  const teamId = c.var.team.id;
  const data = await getCredential(c.env.DB, c.env.ENCRYPTION_KEY, teamId, platform);
  if (!data) return c.json({ platform, configured: false, fields: {} });

  const masked = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [
      k,
      v.length > 4 ? '\u2022'.repeat(v.length - 4) + v.slice(-4) : '\u2022\u2022\u2022\u2022',
    ])
  );
  return c.json({ platform, configured: true, fields: masked });
});

credentialRoutes.put('/:platform', async (c) => {
  const platform = c.req.param('platform');
  if (!VALID_PLATFORMS.has(platform)) {
    return c.json({ ok: false, error: 'Unknown platform' }, 400);
  }

  const contentType = c.req.header('Content-Type');
  if (!contentType?.includes('application/json')) {
    return c.json({ ok: false, error: 'Content-Type must be application/json' }, 415);
  }

  const body = await c.req.json<{ fields: Record<string, string> }>();

  if (!body.fields || Object.keys(body.fields).length === 0) {
    return c.json({ ok: false, error: 'No fields provided' }, 400);
  }

  const nonEmpty = Object.fromEntries(
    Object.entries(body.fields).filter(([, v]) => v && v.trim().length > 0)
  );

  if (Object.keys(nonEmpty).length === 0) {
    return c.json({ ok: false, error: 'All fields are empty' }, 400);
  }

  const teamId = c.var.team.id;
  await putCredential(c.env.DB, c.env.ENCRYPTION_KEY, teamId, platform, nonEmpty);
  return c.json({ ok: true, platform });
});

credentialRoutes.delete('/:platform', async (c) => {
  const platform = c.req.param('platform');
  if (!VALID_PLATFORMS.has(platform)) {
    return c.json({ ok: false, error: 'Unknown platform' }, 400);
  }

  const teamId = c.var.team.id;
  await deleteCredential(c.env.DB, teamId, platform);
  return c.json({ ok: true, platform });
});

export { credentialRoutes };
